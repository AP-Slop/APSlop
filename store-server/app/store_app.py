"""PUT /store-app implementation: publish the APSlop store app itself in the repo.

The store app is not built from an app repo, so it skips GitHub: the APK is uploaded as is,
signed with its per-package key like every other app (so it can update itself from the store),
and described with fixed metadata.
"""
from __future__ import annotations

import logging
import shutil
from pathlib import Path
from typing import Any

from . import fdroid, signing
from .config import settings
from .sync import SyncError, _prepare_apk, _stage_dir

log = logging.getLogger("store.store_app")

STORE_APP_PACKAGE = "dev.apslop.store"
NAME = "APSlop Store"
SUMMARY = "Install and update the apps made on campus"
DESCRIPTION = """The store app for APSlop.

- Browse and search the apps people on campus have made
- Install them, and update them when a new version comes out
- Point it at another repository in Settings

You can also add this repository to the official F-Droid client to get the same apps:
{repo_url}"""


def _write_metadata() -> Path:
    return fdroid.write_metadata(
        STORE_APP_PACKAGE,
        name=NAME,
        summary=SUMMARY,
        description=DESCRIPTION.format(repo_url=settings.repo_url),
        source_code=settings.store_app_source,
        website="",
        author="APSlop",
    )


def refresh_store_app_metadata() -> bool:
    """Rewrite the store app's metadata when this code (or STORE_APP_SOURCE_URL) changed it, so a
    deploy reaches the store page without re-uploading the APK. False when nothing changed."""
    path = settings.metadata_dir / f"{STORE_APP_PACKAGE}.yml"
    with fdroid.repo_lock:
        if not path.exists():
            return False
        before = path.read_text(encoding="utf-8")
        if _write_metadata().read_text(encoding="utf-8") == before:
            return False
        fdroid.fdroid_update()
    log.info("refreshed the store app's metadata")
    return True


def publish_store_app(apk: bytes) -> dict[str, Any]:
    if not apk:
        raise SyncError(400, "the request body must be the store app's APK")
    stage = _stage_dir()
    try:
        raw = stage / "raw" / "store-app.apk"
        raw.parent.mkdir(parents=True)
        raw.write_bytes(apk)
        try:
            info = signing.inspect_apk(raw)
        except Exception as e:  # androguard raises assorted errors on files that are not APKs
            raise SyncError(400, f"not an APK: {e}") from e
        if info.package_name != STORE_APP_PACKAGE:
            raise SyncError(400, f"expected {STORE_APP_PACKAGE}, got {info.package_name}")
        info, signed = _prepare_apk(raw, stage)

        with fdroid.repo_lock:
            _write_metadata()
            shutil.move(str(signed), settings.repo_dir / signed.name)
            fdroid.fdroid_update()

        log.info("published the store app %s (%d)", info.version_name, info.version_code)
        return {
            "packageName": info.package_name,
            "versionName": info.version_name,
            "versionCode": info.version_code,
            "apkName": signed.name,
            "apkUrl": f"{settings.repo_url}/{signed.name}",
        }
    except signing.SigningError as e:
        raise SyncError(500, str(e)) from e
    finally:
        shutil.rmtree(stage, ignore_errors=True)
