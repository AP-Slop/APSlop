from pathlib import Path

import pytest
import yaml
from fastapi.testclient import TestClient

from app import fdroid, main, signing
from app.config import settings
from app.store_app import STORE_APP_PACKAGE, refresh_store_app_metadata

TOKEN = {"X-Store-Token": "test-token"}


@pytest.fixture
def client():
    with TestClient(main.app) as c:
        yield c


@pytest.fixture
def apk_of(monkeypatch):
    """Stub the Android toolchain; the test picks which package the uploaded APK claims to be."""
    package = {"name": STORE_APP_PACKAGE}

    def sign(src: Path, dest: Path, package_name: str) -> Path:
        dest.write_bytes(src.read_bytes())
        return dest

    monkeypatch.setattr(signing, "inspect_apk", lambda p: signing.ApkInfo(package["name"], 2, "0.2.0", app_name="APSlop Store"))
    monkeypatch.setattr(signing, "is_signed", lambda p: False)
    monkeypatch.setattr(signing, "sign_apk", sign)
    yield package
    fdroid.remove_package(STORE_APP_PACKAGE)


def test_publishes_the_store_app_with_fixed_metadata(client, apk_of):
    r = client.put("/store-app", content=b"apk", headers=TOKEN)
    assert r.status_code == 200
    assert r.json()["apkName"] == f"{STORE_APP_PACKAGE}_2.apk"
    assert r.json()["apkUrl"] == f"http://store.test/fdroid/repo/{STORE_APP_PACKAGE}_2.apk"
    assert (settings.repo_dir / f"{STORE_APP_PACKAGE}_2.apk").exists()
    meta = yaml.safe_load((settings.metadata_dir / f"{STORE_APP_PACKAGE}.yml").read_text(encoding="utf-8"))
    assert meta["Name"] == "APSlop Store"
    assert meta["AuthorName"] == "APSlop"
    assert meta["SourceCode"] == "https://github.com/AP-Slop/APSlop"
    assert meta["IssueTracker"] == "https://github.com/AP-Slop/APSlop/issues"
    assert meta["Description"].rstrip().endswith("\nhttp://store.test/fdroid/repo")


def test_refreshes_the_metadata_only_when_it_changed(client, apk_of, monkeypatch):
    assert refresh_store_app_metadata() is False  # not published yet
    client.put("/store-app", content=b"apk", headers=TOKEN)
    assert refresh_store_app_metadata() is False
    monkeypatch.setattr(settings, "store_app_source", "https://github.com/example/store")
    assert refresh_store_app_metadata() is True
    meta = yaml.safe_load((settings.metadata_dir / f"{STORE_APP_PACKAGE}.yml").read_text(encoding="utf-8"))
    assert meta["SourceCode"] == "https://github.com/example/store"


def test_refuses_any_other_app(client, apk_of):
    apk_of["name"] = "dev.apslop.apps.counter"
    r = client.put("/store-app", content=b"apk", headers=TOKEN)
    assert r.status_code == 400
    assert "expected dev.apslop.store" in r.json()["error"]
    assert not list(settings.repo_dir.glob("dev.apslop.apps.counter_*.apk"))


def test_needs_a_body_and_the_token(client, apk_of):
    assert client.put("/store-app", content=b"", headers=TOKEN).status_code == 400
    assert client.put("/store-app", content=b"apk").status_code == 401
