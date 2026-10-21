"""Environment-driven configuration (see docs/ARCHITECTURE.md)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


@dataclass
class Settings:
    data_dir: Path = field(default_factory=lambda: Path(_env("STORE_DATA_DIR", "/data")))
    store_token: str = field(default_factory=lambda: _env("STORE_TOKEN", ""))
    github_token: str = field(default_factory=lambda: _env("GITHUB_ADMIN_TOKEN", ""))
    github_api: str = field(default_factory=lambda: _env("GITHUB_API_URL", "https://api.github.com"))
    public_url: str = field(default_factory=lambda: _env("STORE_PUBLIC_URL", "http://localhost:8080").rstrip("/"))
    repo_name: str = field(default_factory=lambda: _env("STORE_REPO_NAME", "APSlop University Apps"))
    repo_description: str = field(
        default_factory=lambda: _env("STORE_REPO_DESCRIPTION", "大学コミュニティで作られたアプリの F-Droid 互換リポジトリ")
    )
    # Where the store app's own code lives ("Source code on GitHub" on its store page).
    store_app_source: str = field(
        default_factory=lambda: _env("STORE_APP_SOURCE_URL", "https://github.com/AP-Slop/APSlop")
    )
    key_password: str = field(default_factory=lambda: _env("STORE_KEY_PASSWORD", "change-me"))
    repo_keyalias: str = field(default_factory=lambda: _env("STORE_REPO_KEYALIAS", "apslop"))
    key_dname: str = field(default_factory=lambda: _env("STORE_KEY_DNAME", "CN=APSlop, O=APSlop"))
    # Object storage that holds the data dir when the disk does not persist (see app/mirror.py); "" = off.
    mirror_url: str = field(default_factory=lambda: _env("STORE_MIRROR_URL", "").rstrip("/"))
    # Skip running fdroid / keytool (used by tests and local dev without the toolchain).
    dry_run: bool = field(default_factory=lambda: _env("STORE_DRY_RUN", "0") == "1")

    @property
    def fdroid_dir(self) -> Path:
        return self.data_dir / "fdroid"

    @property
    def repo_dir(self) -> Path:
        return self.fdroid_dir / "repo"

    @property
    def archive_dir(self) -> Path:
        return self.fdroid_dir / "archive"

    @property
    def metadata_dir(self) -> Path:
        return self.fdroid_dir / "metadata"

    @property
    def keys_dir(self) -> Path:
        return self.data_dir / "keys"

    @property
    def incoming_dir(self) -> Path:
        return self.data_dir / "incoming"

    @property
    def apps_json(self) -> Path:
        """The /apps list as a file, so a host can serve it without waking this server."""
        return self.data_dir / "apps.json"

    @property
    def repo_url(self) -> str:
        return f"{self.public_url}/fdroid/repo"


settings = Settings()
