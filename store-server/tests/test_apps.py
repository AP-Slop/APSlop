import pytest
import yaml
from fastapi.testclient import TestClient

from app import fdroid, main
from app.config import settings

PKG = "dev.apslop.apps.counter"
TOKEN = {"X-Store-Token": "test-token"}


@pytest.fixture
def client():
    with TestClient(main.app) as c:
        yield c


@pytest.fixture
def published():
    """A package as /sync leaves it: metadata, the current APK and an archived one."""
    fdroid.ensure_dirs()
    fdroid.write_metadata(PKG, name="Counter", summary="Count things", description="# Counter\n\nCounts.",
                          source_code="https://github.com/org/counter", website="https://github.com/org/counter")
    (settings.repo_dir / f"{PKG}_2.apk").write_bytes(b"apk")
    (settings.archive_dir / f"{PKG}_1.apk").write_bytes(b"apk")
    other = settings.repo_dir / "dev.apslop.apps.other_1.apk"
    other.write_bytes(b"apk")
    yield
    other.unlink(missing_ok=True)
    fdroid.remove_package(PKG)


def test_requires_token(client):
    assert client.put(f"/apps/{PKG}/summary", json={"summary": "x"}).status_code == 401
    assert client.delete(f"/apps/{PKG}").status_code == 401


def test_set_summary_rewrites_only_the_summary(client, published):
    r = client.put(f"/apps/{PKG}/summary", json={"summary": "  Count anything: \"fast\"  "}, headers=TOKEN)
    assert r.status_code == 200
    meta = yaml.safe_load((settings.metadata_dir / f"{PKG}.yml").read_text())
    assert meta["Summary"] == 'Count anything: "fast"'
    assert meta["Name"] == "Counter"
    assert meta["Description"] == "# Counter\n\nCounts.\n"


def test_set_summary_unknown_package_is_404(client):
    r = client.put("/apps/dev.apslop.apps.missing/summary", json={"summary": "x"}, headers=TOKEN)
    assert r.status_code == 404


def test_set_summary_limits(client, published):
    assert client.put(f"/apps/{PKG}/summary", json={"summary": ""}, headers=TOKEN).status_code == 422
    assert client.put(f"/apps/{PKG}/summary", json={"summary": "x" * 81}, headers=TOKEN).status_code == 422


def test_delete_removes_metadata_and_apks_of_that_package_only(client, published):
    r = client.delete(f"/apps/{PKG}", headers=TOKEN)
    assert r.status_code == 200 and r.json()["removed"] == 3
    assert not (settings.metadata_dir / f"{PKG}.yml").exists()
    assert not list(settings.repo_dir.glob(f"{PKG}_*.apk"))
    assert not list(settings.archive_dir.glob(f"{PKG}_*.apk"))
    assert (settings.repo_dir / "dev.apslop.apps.other_1.apk").exists()
    # Deleting again is not an error, so a failed delete can be retried.
    r = client.delete(f"/apps/{PKG}", headers=TOKEN)
    assert r.status_code == 200 and r.json()["removed"] == 0


@pytest.mark.parametrize("bad", ["..", "dev", "dev.apslop.*", "dev..x", "1dev.x"])
def test_rejects_invalid_package_names(client, bad):
    assert client.delete(f"/apps/{bad}", headers=TOKEN).status_code in (400, 404, 405)
    assert client.put(f"/apps/{bad}/summary", json={"summary": "x"}, headers=TOKEN).status_code in (400, 404, 405)
