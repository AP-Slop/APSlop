"""POST /sync implementation: GitHub release -> signed APK -> fdroid update."""
from __future__ import annotations

import logging
import shutil
import uuid
from pathlib import Path
from typing import Any

from . import fdroid, github, signing
from .config import settings

log = logging.getLogger("store.sync")


class SyncError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def _stage_dir() -> Path:
    d = settings.incoming_dir / uuid.uuid4().hex
    d.mkdir(parents=True, exist_ok=True)
    return d


def _prepare_apk(src: Path, stage: Path) -> tuple[signing.ApkInfo, Path]:
    """Inspect, sign if needed, and return (info, path-to-signed-apk-in-stage)."""
    info = signing.inspect_apk(src)
    final = stage / f"{info.package_name}_{info.version_code}.apk"
    if signing.is_signed(src):
        shutil.copyfile(src, final)
    else:
        log.info("signing %s with per-package key", src.name)
        signing.sign_apk(src, final, info.package_name)
    return info, final


def sync_release(repo_full_name: str, tag: str | None) -> dict[str, Any]:
    if "/" not in repo_full_name:
        raise SyncError(400, "repo must be 'owner/name'")
    try:
        repo = github.get_repo(repo_full_name)
        release = github.get_release(repo_full_name, tag)
        # The store description is the README as of the released tag. Release notes are a
        # changelog (GitHub's generated ones are just a compare link), not a description.
        readme = github.get_readme(repo_full_name, release.get("tag_name"))
    except github.GitHubError as e:
        raise SyncError(404 if e.status == 404 else 502, str(e)) from e

    assets = github.apk_assets(release)
    if not assets:
        raise SyncError(422, f"release {release.get('tag_name')} has no .apk asset")

    stage = _stage_dir()
    try:
        prepared: list[tuple[signing.ApkInfo, Path]] = []
        for asset in assets:
            raw = github.download_asset(asset, stage / "raw" / asset["name"])
            prepared.append(_prepare_apk(raw, stage))
        # Highest versionCode wins as "the" result; all APKs are still published.
        prepared.sort(key=lambda p: p[0].version_code, reverse=True)
        info, signed = prepared[0]

        with fdroid.repo_lock:
            for pinfo, _ in {p[0].package_name: p for p in prepared}.values():
                fdroid.write_metadata(
                    pinfo.package_name,
                    # The label shown on the home screen, so the store and the launcher agree.
                    name=pinfo.app_name or repo.get("name") or pinfo.package_name,
                    summary=repo.get("description") or "",
                    description=readme or repo.get("description") or "",
                    source_code=repo.get("html_url", ""),
                    website=repo.get("homepage") or repo.get("html_url", ""),
                )
            for _, path in prepared:
                shutil.move(str(path), settings.repo_dir / path.name)
            fdroid.fdroid_update()

        result = {
            "packageName": info.package_name,
            "versionName": info.version_name,
            "versionCode": info.version_code,
            "apkName": signed.name,
            "sha256": signing.sha256_file(settings.repo_dir / signed.name),
            "signer": signing.signer_sha256(settings.repo_dir / signed.name),
            "tag": release.get("tag_name"),
            "apkUrl": f"{settings.repo_url}/{signed.name}",
        }
        log.info("synced %s %s (%s)", info.package_name, info.version_name, repo_full_name)
        return result
    except signing.SigningError as e:
        raise SyncError(500, str(e)) from e
    except github.GitHubError as e:
        raise SyncError(502, str(e)) from e
    finally:
        shutil.rmtree(stage, ignore_errors=True)
