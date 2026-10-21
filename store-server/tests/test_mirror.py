import hashlib
import json
from urllib.parse import unquote

import httpx
import pytest

from app import fdroid, mirror
from app.config import Settings


class FakeMirror:
    """The mirror API of web/cloudflare/worker.ts, in memory."""

    def __init__(self, files: dict[str, bytes] | None = None):
        self.files = dict(files or {})
        self.calls: list[str] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        if request.headers.get("x-store-token") != "test-token":
            return httpx.Response(401)
        path = request.url.path
        self.calls.append(f"{request.method} {unquote(path)}")
        if path == "/list":
            return httpx.Response(200, json=[{"key": k, "sha256": None} for k in self.files])
        key = unquote(path.removeprefix("/o/"))
        if request.method == "GET":
            return httpx.Response(200, content=self.files[key]) if key in self.files else httpx.Response(404)
        if request.method == "PUT":
            assert request.headers["x-content-sha256"] == hashlib.sha256(request.content).hexdigest()
            self.files[key] = request.content
            return httpx.Response(200)
        if request.method == "DELETE":
            self.files.pop(key, None)
            return httpx.Response(200)
        return httpx.Response(405)


@pytest.fixture
def cfg(tmp_path, monkeypatch):
    remote = FakeMirror({"keys/dev.example.jks": b"key", "fdroid/repo/index-v2.json": b"{}"})
    monkeypatch.setattr(mirror, "transport", httpx.MockTransport(remote))
    monkeypatch.setattr(mirror, "_remote", {})
    c = Settings(data_dir=tmp_path / "data", mirror_url="http://mirror.test", store_token="test-token")
    return c, remote


def test_restore_downloads_every_file(cfg):
    c, _ = cfg
    assert mirror.restore(c) == 2
    assert (c.data_dir / "keys/dev.example.jks").read_bytes() == b"key"
    assert (c.data_dir / "keys/dev.example.jks").stat().st_mode & 0o777 == 0o600
    assert (c.data_dir / "fdroid/repo/index-v2.json").read_bytes() == b"{}"


def test_restore_fails_when_the_mirror_refuses(cfg):
    c, _ = cfg
    c.store_token = "wrong"
    with pytest.raises(mirror.MirrorError):
        mirror.restore(c)


def test_push_sends_only_changes_and_the_index_last(cfg):
    c, remote = cfg
    mirror.restore(c)
    remote.calls.clear()
    repo = c.data_dir / "fdroid/repo"
    (repo / "index-v2.json").write_bytes(b'{"packages": {}}')
    (repo / "dev.example_1.apk").write_bytes(b"apk")
    (c.data_dir / "fdroid/config.yml").write_text("keystorepass: secret")
    (c.data_dir / "incoming").mkdir()
    (c.data_dir / "incoming/half.apk").write_bytes(b"half")

    assert mirror.push(c) == 2
    assert remote.calls == ["PUT /o/fdroid/repo/dev.example_1.apk", "PUT /o/fdroid/repo/index-v2.json"]
    assert "fdroid/config.yml" not in remote.files
    assert mirror.push(c) == 0


def test_push_deletes_files_gone_from_disk(cfg):
    c, remote = cfg
    mirror.restore(c)
    (c.data_dir / "fdroid/repo/index-v2.json").unlink()
    mirror.push(c)
    assert set(remote.files) == {"keys/dev.example.jks"}


def test_fdroid_update_writes_the_app_list_and_pushes_it(cfg):
    c, remote = cfg
    c.dry_run = True
    mirror.restore(c)
    fdroid.fdroid_update(c)
    assert json.loads((c.data_dir / "apps.json").read_text()) == []
    assert remote.files["apps.json"] == b"[]"


def test_config_digest_ignores_the_key_password(tmp_path):
    c = Settings(data_dir=tmp_path, key_password="first-password")
    assert fdroid.write_config(c)[1] is True
    assert fdroid.write_config(c)[1] is False
    c.key_password = "second-password"
    assert fdroid.write_config(c)[1] is False
    assert "second-password" in (tmp_path / "fdroid/config.yml").read_text()
    c.public_url = "https://store.example"
    assert fdroid.write_config(c)[1] is True


def test_local_path_stays_in_the_data_dir(tmp_path):
    with pytest.raises(mirror.MirrorError):
        mirror._local_path(Settings(data_dir=tmp_path), "../outside")
    assert mirror._local_path(Settings(data_dir=tmp_path), "keys/a.jks") == (tmp_path / "keys/a.jks").resolve()
