"""Minimal GitHub REST client for releases and release assets."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import httpx

from .config import settings


class GitHubError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(f"GitHub {status}: {message}")
        self.status = status


def _headers(accept: str = "application/vnd.github+json") -> dict[str, str]:
    h = {"Accept": accept, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "openap-store-server"}
    if settings.github_token:
        h["Authorization"] = f"Bearer {settings.github_token}"
    return h


def _client() -> httpx.Client:
    return httpx.Client(base_url=settings.github_api, headers=_headers(), follow_redirects=True, timeout=60)


def _raise_for(r: httpx.Response) -> None:
    if r.status_code >= 400:
        try:
            msg = r.json().get("message", r.text)
        except Exception:  # noqa: BLE001
            msg = r.text
        raise GitHubError(r.status_code, msg)


def get_repo(full_name: str) -> dict[str, Any]:
    with _client() as c:
        r = c.get(f"/repos/{full_name}")
        _raise_for(r)
        return r.json()


def get_release(full_name: str, tag: str | None) -> dict[str, Any]:
    path = f"/repos/{full_name}/releases/tags/{tag}" if tag else f"/repos/{full_name}/releases/latest"
    with _client() as c:
        r = c.get(path)
        _raise_for(r)
        return r.json()


def apk_assets(release: dict[str, Any]) -> list[dict[str, Any]]:
    return [a for a in release.get("assets", []) if str(a.get("name", "")).lower().endswith(".apk")]


def download_asset(asset: dict[str, Any], dest: Path) -> Path:
    """Download a release asset (works for private repos via the API asset URL)."""
    url = asset["url"]  # https://api.github.com/repos/.../releases/assets/<id>
    dest.parent.mkdir(parents=True, exist_ok=True)
    with httpx.Client(headers=_headers("application/octet-stream"), follow_redirects=True, timeout=300) as c:
        with c.stream("GET", url) as r:
            _raise_for(r)
            with dest.open("wb") as f:
                for chunk in r.iter_bytes(1 << 16):
                    f.write(chunk)
    return dest
