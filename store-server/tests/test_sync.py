from pathlib import Path

import pytest
import yaml

from app import fdroid, github, signing, sync
from app.config import Settings

PKG = "dev.apslop.apps.campus_timetable"


@pytest.fixture
def stubbed(monkeypatch):
    """Stub GitHub and the Android toolchain so sync_release runs offline; captures written metadata."""
    fdroid.ensure_dirs()
    written: dict[str, dict] = {}
    readme = {"text": "# キャンパス時間割\n\n授業の時間割を表示します。", "refs": []}

    def get_readme(name, ref):
        readme["refs"].append(ref)
        return readme["text"]

    def download(asset, dest: Path) -> Path:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b"apk")
        return dest

    def sign(src: Path, dest: Path, package_name: str) -> Path:
        dest.write_bytes(src.read_bytes())
        return dest

    monkeypatch.setattr(github, "get_repo", lambda name: {
        "name": "campus-timetable",
        "description": "Timetable for campus",
        "html_url": "https://github.com/org/campus-timetable",
        "homepage": None,
    })
    monkeypatch.setattr(github, "get_release", lambda name, tag: {
        "tag_name": "v1.0.0",
        "body": "**Full Changelog**: https://github.com/org/campus-timetable/commits/v1.0.0",
        "assets": [{"name": "app-1.0.0-unsigned.apk", "url": "https://api.github.com/assets/1"}],
    })
    monkeypatch.setattr(github, "get_readme", get_readme)
    monkeypatch.setattr(github, "download_asset", download)
    monkeypatch.setattr(signing, "inspect_apk", lambda p: signing.ApkInfo(PKG, 10000, "1.0.0", app_name="キャンパス時間割"))
    monkeypatch.setattr(signing, "is_signed", lambda p: False)
    monkeypatch.setattr(signing, "sign_apk", sign)
    monkeypatch.setattr(signing, "signer_sha256", lambda p: "ab" * 32)
    monkeypatch.setattr(fdroid, "write_metadata", lambda package_name, **kw: written.setdefault(package_name, kw))
    return written, readme


def test_sync_names_app_by_apk_label_and_describes_it_with_readme(stubbed):
    written, readme = stubbed
    result = sync.sync_release("org/campus-timetable", "v1.0.0")
    assert result["packageName"] == PKG
    meta = written[PKG]
    assert meta["name"] == "キャンパス時間割"
    assert meta["summary"] == "Timetable for campus"
    assert meta["description"] == readme["text"]  # not the release notes
    assert readme["refs"] == ["v1.0.0"]  # README as of the released tag


def test_sync_falls_back_to_repo_name_and_description(stubbed, monkeypatch):
    written, readme = stubbed
    readme["text"] = ""
    monkeypatch.setattr(signing, "inspect_apk", lambda p: signing.ApkInfo(PKG, 10000, "1.0.0"))
    sync.sync_release("org/campus-timetable", "v1.0.0")
    assert written[PKG]["name"] == "campus-timetable"
    assert written[PKG]["description"] == "Timetable for campus"


def test_metadata_keeps_markdown_readme_verbatim(tmp_path):
    readme = "# Title\n\n---\n- key: value\n\n```\ncode: {x}\n```"
    path = fdroid.write_metadata(
        PKG, name="App", summary="s", description=readme,
        source_code="https://github.com/org/app", website="", cfg=Settings(data_dir=tmp_path),
    )
    assert yaml.safe_load(path.read_text(encoding="utf-8"))["Description"] == readme + "\n"
