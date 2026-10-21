"""Keep the data dir in object storage, for hosts whose disk starts empty on every start (Cloudflare Containers).

When STORE_MIRROR_URL is set, startup restores every stored file into the data dir, and each `fdroid update`
pushes what changed. The mirror is a small HTTP API (served by web/cloudflare/worker.ts on top of R2):

    GET    /list       [{"key": "fdroid/repo/index-v2.json", "sha256": "…" | null}, …]
    GET    /o/<key>    the file
    PUT    /o/<key>    store the file (X-Content-SHA256: its digest); signing keys are never overwritten
    DELETE /o/<key>    remove the file

Every call carries X-Store-Token.
"""
from __future__ import annotations

import hashlib
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote

import httpx

from .config import Settings, settings

log = logging.getLogger("store.mirror")

# Rewritten from the environment at startup (it holds the key password), and work in progress.
SKIPPED_FILES = {"fdroid/config.yml"}
SKIPPED_DIRS = ("incoming/",)
# Uploaded last, so a client never reads an index that names a file not uploaded yet.
INDEX_NAMES = ("index", "entry")

# Tests swap in an httpx.MockTransport.
transport: httpx.BaseTransport | None = None

# key -> sha256 of what the mirror holds, as of the last restore or push.
_remote: dict[str, str] = {}


class MirrorError(Exception):
    pass


def enabled(cfg: Settings = settings) -> bool:
    return bool(cfg.mirror_url)


def _client(cfg: Settings) -> httpx.Client:
    return httpx.Client(
        base_url=cfg.mirror_url, headers={"X-Store-Token": cfg.store_token}, timeout=300, transport=transport
    )


def _check(r: httpx.Response) -> None:
    if r.status_code >= 400:
        raise MirrorError(f"{r.request.method} {r.request.url.path} answered {r.status_code}: {r.text[:300]}")


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _is_private(key: str) -> bool:
    return key.startswith("keys/") or key == "fdroid/keystore.p12"


def _local_path(cfg: Settings, key: str) -> Path:
    path = (cfg.data_dir / key).resolve()
    if not path.is_relative_to(cfg.data_dir.resolve()):
        raise MirrorError(f"refusing to write outside the data dir: {key}")
    return path


def _list(c: httpx.Client) -> list[dict]:
    # The container may make its first call before the host has wired up the mirror; give it a few seconds.
    for attempt in range(10):
        try:
            r = c.get("/list")
            break
        except httpx.TransportError as e:
            if attempt == 9:
                raise MirrorError(f"the mirror cannot be reached: {e}") from e
            time.sleep(1)
    _check(r)
    return r.json()


def restore(cfg: Settings = settings) -> int:
    """Download every stored file into the data dir. Returns the number of files.
    Raises MirrorError instead of starting on an empty disk, which would mint new signing keys."""
    with _client(cfg) as c:
        objects = _list(c)

        def fetch(obj: dict) -> tuple[str, str]:
            key = obj["key"]
            path = _local_path(cfg, key)
            path.parent.mkdir(parents=True, exist_ok=True)
            tmp = path.with_name(path.name + ".part")
            with c.stream("GET", "/o/" + quote(key)) as r:
                _check(r)
                with tmp.open("wb") as f:
                    for chunk in r.iter_bytes(1 << 16):
                        f.write(chunk)
            digest = _sha256(tmp)
            if obj.get("sha256") and obj["sha256"] != digest:
                raise MirrorError(f"{key} does not match its stored digest")
            os.replace(tmp, path)
            if _is_private(key):
                path.chmod(0o600)
            return key, digest

        with ThreadPoolExecutor(8) as pool:
            restored = dict(pool.map(fetch, objects))
    _remote.clear()
    _remote.update(restored)
    log.info("restored %d files from the mirror", len(restored))
    return len(restored)


def _local_files(cfg: Settings) -> dict[str, Path]:
    files: dict[str, Path] = {}
    for path in cfg.data_dir.rglob("*"):
        key = path.relative_to(cfg.data_dir).as_posix()
        if path.is_file() and key not in SKIPPED_FILES and not key.startswith(SKIPPED_DIRS):
            files[key] = path
    return files


def _upload_order(key: str) -> tuple[bool, str]:
    return Path(key).name.startswith(INDEX_NAMES), key


def push(cfg: Settings = settings) -> int:
    """Upload new and changed files, then delete the ones gone from disk. Returns the number of changes."""
    local = {key: (path, _sha256(path)) for key, path in _local_files(cfg).items()}
    changed = sorted((k for k, (_, h) in local.items() if _remote.get(k) != h), key=_upload_order)
    gone = sorted(k for k in _remote if k not in local)
    if not changed and not gone:
        return 0
    with _client(cfg) as c:
        for key in changed:
            path, digest = local[key]
            with path.open("rb") as f:
                r = c.put("/o/" + quote(key), content=f.read(), headers={"X-Content-SHA256": digest})
            _check(r)
            _remote[key] = digest
        for key in gone:
            _check(c.delete("/o/" + quote(key)))
            _remote.pop(key, None)
    log.info("pushed %d files to the mirror, removed %d", len(changed), len(gone))
    return len(changed) + len(gone)
