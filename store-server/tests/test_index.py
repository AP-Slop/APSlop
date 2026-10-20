import json
from pathlib import Path

from app.fdroid import find_package, parse_index_v2

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "index-v2.json").read_text())


def test_parse_picks_latest_version_and_absolute_urls():
    apps = parse_index_v2(FIXTURE, "http://store.test/fdroid/repo/")
    todo = next(a for a in apps if a["packageName"] == "dev.apslop.apps.todo")
    assert todo["name"] == "Todo"
    assert todo["summary"] == "Simple todo list"
    assert todo["versionCode"] == 2
    assert todo["versionName"] == "0.2.0"
    assert todo["apkUrl"] == "http://store.test/fdroid/repo/dev.apslop.apps.todo_2.apk"
    assert todo["apkName"] == "dev.apslop.apps.todo_2.apk"
    assert todo["iconUrl"] == "http://store.test/fdroid/repo/icons-640/dev.apslop.apps.todo.2.png"
    assert todo["sourceCode"] == "https://github.com/my-univ-apps/todo"
    assert todo["apkSize"] == 11
    assert todo["minSdk"] == 26


def test_parse_falls_back_to_any_locale_and_sorts_by_last_updated():
    apps = parse_index_v2(FIXTURE, "http://store.test/fdroid/repo")
    assert [a["packageName"] for a in apps] == ["dev.apslop.apps.todo", "dev.apslop.apps.old"]
    old = apps[1]
    assert old["name"] == "古いアプリ"
    assert old["iconUrl"] is None
    assert old["summary"] == ""
    assert old["apkSize"] is None and old["minSdk"] is None


def test_parse_empty_index():
    assert parse_index_v2({"repo": {}, "packages": {}}, "http://x") == []
    assert parse_index_v2({}, "http://x") == []


def test_find_package():
    assert find_package(FIXTURE, "dev.apslop.apps.todo", 1)["manifest"]["versionName"] == "0.1.0"
    assert find_package(FIXTURE, "dev.apslop.apps.todo", 9) is None
    assert find_package(FIXTURE, "nope", 1) is None
