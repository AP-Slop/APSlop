from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import main
from app.config import settings
from app.sync import SyncError


@pytest.fixture
def client(monkeypatch):
    with TestClient(main.app) as c:
        yield c


def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200 and r.json() == {"ok": True}


def test_sync_requires_token(client):
    r = client.post("/sync", json={"repo": "org/app"})
    assert r.status_code == 401
    assert r.json() == {"error": "invalid X-Store-Token"}
    r = client.post("/sync", json={"repo": "org/app"}, headers={"X-Store-Token": "wrong"})
    assert r.status_code == 401


def test_sync_calls_sync_release(client, monkeypatch):
    calls = []

    def fake(repo, tag):
        calls.append((repo, tag))
        return {"packageName": "dev.apslop.apps.todo", "versionName": "1.0", "versionCode": 1,
                "apkName": "dev.apslop.apps.todo_1.apk", "sha256": "x", "signer": "y"}

    monkeypatch.setattr(main, "sync_release", fake)
    r = client.post("/sync", json={"repo": "org/app", "tag": "v1.0"}, headers={"X-Store-Token": "test-token"})
    assert r.status_code == 200
    assert r.json()["packageName"] == "dev.apslop.apps.todo"
    assert calls == [("org/app", "v1.0")]


def test_sync_error_maps_to_status(client, monkeypatch):
    def fake(repo, tag):
        raise SyncError(422, "release v1 has no .apk asset")

    monkeypatch.setattr(main, "sync_release", fake)
    r = client.post("/sync", json={"repo": "org/app"}, headers={"X-Store-Token": "test-token"})
    assert r.status_code == 422
    assert r.json() == {"error": "release v1 has no .apk asset"}


def test_apps_serves_parsed_index(client, monkeypatch):
    fixture = Path(__file__).parent / "fixtures" / "index-v2.json"
    settings.repo_dir.mkdir(parents=True, exist_ok=True)
    (settings.repo_dir / "index-v2.json").write_text(fixture.read_text())
    r = client.get("/apps")
    assert r.status_code == 200
    names = {a["packageName"] for a in r.json()}
    assert names == {"dev.apslop.apps.todo", "dev.apslop.apps.old"}
    # static mount serves the index too, but must not expose config.yml
    assert client.get("/fdroid/repo/index-v2.json").status_code == 200
    assert client.get("/fdroid/config.yml").status_code == 404
    assert client.get("/fdroid/keystore.p12").status_code == 404


def test_config_written_on_startup(client):
    cfg = settings.fdroid_dir / "config.yml"
    text = cfg.read_text()
    assert 'repo_url: "http://store.test/fdroid/repo"' in text
    assert 'keystore: "keystore.p12"' in text
