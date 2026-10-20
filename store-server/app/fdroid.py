"""fdroidserver integration: repo initialisation, metadata, `fdroid update`, index parsing."""
from __future__ import annotations

import json
import logging
import re
import subprocess
import threading
from pathlib import Path
from typing import Any

from .config import Settings, settings
from .signing import SigningError, run, which

log = logging.getLogger("store.fdroid")

# Serialises everything that touches /data/fdroid (fdroid update is not concurrency-safe).
repo_lock = threading.Lock()


def _yaml_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)  # JSON strings are valid YAML double-quoted scalars


def write_config(cfg: Settings = settings) -> tuple[Path, bool]:
    """(Re)generate config.yml from the environment. Returns (path, changed).

    Everything in it is derived from env vars (URLs, names, passwords), so it is rewritten on
    every startup; a stale copy from an earlier run would otherwise pin the old public URL.
    """
    cfg.fdroid_dir.mkdir(parents=True, exist_ok=True)
    path = cfg.fdroid_dir / "config.yml"
    lines = [
        f"repo_url: {_yaml_str(cfg.repo_url)}",
        f"repo_name: {_yaml_str(cfg.repo_name)}",
        f"repo_description: {_yaml_str(cfg.repo_description)}",
        f"archive_url: {_yaml_str(cfg.public_url + '/fdroid/archive')}",
        f"archive_name: {_yaml_str(cfg.repo_name + ' (archive)')}",
        f"archive_description: {_yaml_str('Older versions of apps from ' + cfg.repo_name)}",
        "archive_older: 3",
        'keystore: "keystore.p12"',
        f"repo_keyalias: {_yaml_str(cfg.repo_keyalias)}",
        f"keystorepass: {_yaml_str(cfg.key_password)}",
        f"keypass: {_yaml_str(cfg.key_password)}",
        f"keydname: {_yaml_str(cfg.key_dname)}",
        "make_current_version_link: false",
        "",
    ]
    text = "\n".join(lines)
    changed = not path.exists() or path.read_text(encoding="utf-8") != text
    if changed:
        path.write_text(text, encoding="utf-8")
        path.chmod(0o600)
    return path, changed


def ensure_dirs(cfg: Settings = settings) -> None:
    for d in (cfg.repo_dir, cfg.archive_dir, cfg.metadata_dir, cfg.keys_dir, cfg.incoming_dir):
        d.mkdir(parents=True, exist_ok=True)


def ensure_repo_keystore(cfg: Settings = settings) -> Path:
    ks = cfg.fdroid_dir / "keystore.p12"
    if ks.exists():
        return ks
    tool = which("keytool")
    if not tool:
        raise SigningError("keytool not found")
    run(
        [
            tool, "-genkeypair", "-keystore", str(ks), "-storetype", "PKCS12",
            "-storepass", cfg.key_password, "-keypass", cfg.key_password,
            "-alias", cfg.repo_keyalias, "-keyalg", "RSA", "-keysize", "4096", "-validity", "10000",
            "-dname", cfg.key_dname,
        ]
    )
    ks.chmod(0o600)
    return ks


def write_metadata(package_name: str, *, name: str, summary: str, description: str,
                   source_code: str, website: str, author: str = "", cfg: Settings = settings) -> Path:
    """Write metadata/<pkg>.yml. Only overwrites fields we own; keeps file if it already exists
    and was hand-edited (we always regenerate — the GitHub repo is the source of truth)."""
    cfg.metadata_dir.mkdir(parents=True, exist_ok=True)
    path = cfg.metadata_dir / f"{package_name}.yml"
    summary = (summary or name or package_name)[:80]
    desc = (description or summary).strip() or summary
    lines = [
        "Categories:",
        "  - University",
        f"License: {_yaml_str('Unknown')}",
        *([f"AuthorName: {_yaml_str(author)}"] if author else []),
        f"Name: {_yaml_str(name or package_name)}",
        f"Summary: {_yaml_str(summary)}",
        "Description: |",
        *[f"  {ln}" for ln in desc.splitlines()],
        *([f"SourceCode: {_yaml_str(source_code)}"] if source_code else []),
        *([f"WebSite: {_yaml_str(website)}"] if website else []),
        *([f"IssueTracker: {_yaml_str(source_code.rstrip('/') + '/issues')}"] if source_code else []),
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


PACKAGE_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$")


def set_summary(package_name: str, summary: str, cfg: Settings = settings) -> bool:
    """Replace the Summary line of metadata/<pkg>.yml (written by write_metadata). False if there is none."""
    path = cfg.metadata_dir / f"{package_name}.yml"
    if not path.exists():
        return False
    line = f"Summary: {_yaml_str(summary[:80])}"
    lines = [line if ln.startswith("Summary: ") else ln for ln in path.read_text(encoding="utf-8").split("\n")]
    path.write_text("\n".join(lines), encoding="utf-8")
    return True


def remove_package(package_name: str, cfg: Settings = settings) -> int:
    """Delete the metadata and every APK of a package from repo/ and archive/. Returns the number of files removed.
    The per-package signing key is kept, so a later app with the same package name can still update installs."""
    removed = 0
    candidates = [cfg.metadata_dir / f"{package_name}.yml"]
    for d in (cfg.repo_dir, cfg.archive_dir):
        candidates += d.glob(f"{package_name}_*.apk")
    for path in candidates:
        if path.is_file():
            path.unlink()
            removed += 1
    return removed


def fdroid_update(cfg: Settings = settings) -> str:
    """Run `fdroid update` (caller must hold repo_lock)."""
    if cfg.dry_run:
        log.info("dry run: skipping fdroid update")
        return "dry-run"
    tool = which("fdroid")
    if not tool:
        raise SigningError("fdroid not found")
    proc = subprocess.run(
        [tool, "update", "--create-metadata", "--pretty"],
        cwd=cfg.fdroid_dir, capture_output=True, text=True,
    )
    if proc.returncode != 0:
        tail = (proc.stderr or proc.stdout or "")[-3000:]
        raise SigningError(f"fdroid update failed: {tail}")
    return proc.stdout[-3000:]


def initialise(cfg: Settings = settings) -> None:
    """Called at startup: dirs, config.yml, repo keystore, initial (possibly empty) index."""
    if len(cfg.key_password) < 6:
        raise RuntimeError("STORE_KEY_PASSWORD must be at least 6 characters (keytool requirement)")
    ensure_dirs(cfg)
    _, config_changed = write_config(cfg)
    if cfg.dry_run:
        return
    with repo_lock:
        ensure_repo_keystore(cfg)
        if not (cfg.repo_dir / "index-v2.json").exists():
            log.info("no index found, running initial fdroid update")
            fdroid_update(cfg)
        elif config_changed:
            log.info("config.yml changed (e.g. STORE_PUBLIC_URL), regenerating index")
            fdroid_update(cfg)


# ---------------------------------------------------------------- index-v2 parsing

def _localized(value: Any, lang: str = "en-US") -> str:
    """index-v2 stores strings as {"en-US": "..."}; pick lang, else the first value."""
    if isinstance(value, dict):
        if lang in value:
            return str(value[lang])
        for v in value.values():
            return str(v)
        return ""
    return str(value) if value is not None else ""


def _localized_file(value: Any, base_url: str, lang: str = "en-US") -> str | None:
    """index-v2 file refs look like {"en-US": {"name": "/icons/x.png", "sha256": ..}}."""
    if not isinstance(value, dict):
        return None
    entry = value.get(lang) or next(iter(value.values()), None)
    if isinstance(entry, dict) and entry.get("name"):
        return base_url + entry["name"]
    return None


def _icon_url(value: Any, repo_url: str, repo_dir: Path | None) -> str | None:
    """The icon fdroid rendered at 640 dpi when it is on disk, else index-v2's own (160 dpi, blurry on phones)."""
    url = _localized_file(value, repo_url)
    prefix = repo_url + "/icons/"
    if url and repo_dir is not None and url.startswith(prefix):
        name = url[len(prefix) :]
        if (repo_dir / "icons-640" / name).is_file():
            return f"{repo_url}/icons-640/{name}"
    return url


def parse_index_v2(index: dict[str, Any], repo_url: str, repo_dir: Path | None = None) -> list[dict[str, Any]]:
    """Flatten an index-v2 document into the /apps contract shape."""
    repo_url = repo_url.rstrip("/")
    apps: list[dict[str, Any]] = []
    for pkg, entry in (index.get("packages") or {}).items():
        meta = entry.get("metadata", {}) or {}
        versions = entry.get("versions", {}) or {}
        # versions are keyed by sha256; pick highest versionCode
        latest: dict[str, Any] | None = None
        for v in versions.values():
            manifest = v.get("manifest", {}) or {}
            if latest is None or int(manifest.get("versionCode", 0)) > int(latest["manifest"].get("versionCode", 0)):
                latest = v
        manifest = (latest or {}).get("manifest", {}) or {}
        apk_file = (latest or {}).get("file") or {}
        apk_name = apk_file.get("name")
        apps.append(
            {
                "packageName": pkg,
                "name": _localized(meta.get("name")) or pkg,
                "summary": _localized(meta.get("summary")),
                "description": _localized(meta.get("description")),
                "versionName": manifest.get("versionName"),
                "versionCode": manifest.get("versionCode"),
                "iconUrl": _icon_url(meta.get("icon"), repo_url, repo_dir),
                "apkUrl": (repo_url + apk_name) if apk_name else None,
                "apkName": apk_name.lstrip("/") if apk_name else None,
                "apkSize": apk_file.get("size"),
                "minSdk": (manifest.get("usesSdk") or {}).get("minSdkVersion"),
                "sourceCode": meta.get("sourceCode"),
                "webSite": meta.get("webSite"),
                "added": meta.get("added"),
                "lastUpdated": meta.get("lastUpdated"),
            }
        )
    apps.sort(key=lambda a: a.get("lastUpdated") or 0, reverse=True)
    return apps


def load_index_v2(cfg: Settings = settings) -> dict[str, Any]:
    path = cfg.repo_dir / "index-v2.json"
    if not path.exists():
        return {"repo": {}, "packages": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def find_package(index: dict[str, Any], package_name: str, version_code: int) -> dict[str, Any] | None:
    entry = (index.get("packages") or {}).get(package_name) or {}
    for v in (entry.get("versions") or {}).values():
        if int((v.get("manifest") or {}).get("versionCode", -1)) == version_code:
            return v
    return None
