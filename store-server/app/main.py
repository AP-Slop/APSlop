"""APSlop store-server: F-Droid compatible repository generator & host."""
from __future__ import annotations

import logging
import mimetypes
import secrets
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import fdroid
from .config import settings
from .sync import SyncError, sync_release

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("store")
# httpx logs every request URL at INFO, including GitHub's pre-signed release-asset download URLs.
logging.getLogger("httpx").setLevel(logging.WARNING)

mimetypes.add_type("application/vnd.android.package-archive", ".apk")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("application/java-archive", ".jar")


@asynccontextmanager
async def lifespan(_: FastAPI):
    fdroid.initialise()
    log.info("store-server ready: repo=%s data=%s", settings.repo_url, settings.data_dir)
    yield


app = FastAPI(title="APSlop store-server", version="0.1.0", lifespan=lifespan)


def require_token(x_store_token: str | None = Header(default=None)) -> None:
    if not settings.store_token or not x_store_token or not secrets.compare_digest(x_store_token, settings.store_token):
        raise HTTPException(status_code=401, detail="invalid X-Store-Token")


class SyncRequest(BaseModel):
    repo: str = Field(..., description="GitHub repo as owner/name")
    tag: str | None = Field(default=None, description="release tag; latest release if omitted")


@app.exception_handler(HTTPException)
async def http_exc(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail)})


@app.get("/healthz")
def healthz() -> dict[str, bool]:
    return {"ok": True}


@app.post("/sync", dependencies=[Depends(require_token)])
async def sync(req: SyncRequest) -> dict[str, Any]:
    try:
        return await run_in_threadpool(sync_release, req.repo, req.tag)
    except SyncError as e:
        raise HTTPException(status_code=e.status, detail=e.message) from e


@app.get("/apps")
def apps() -> list[dict[str, Any]]:
    return fdroid.parse_index_v2(fdroid.load_index_v2(), settings.repo_url)


@app.get("/")
def root() -> dict[str, Any]:
    return {"name": settings.repo_name, "repo": settings.repo_url, "apps": "/apps"}


# Static F-Droid repository: /fdroid/repo/index-v2.json, APKs, icons, /fdroid/archive/...
# Only repo/ and archive/ are exposed; config.yml and keystore.p12 in /data/fdroid stay private.
fdroid.ensure_dirs()
app.mount("/fdroid/repo", StaticFiles(directory=str(settings.repo_dir)), name="fdroid-repo")
app.mount("/fdroid/archive", StaticFiles(directory=str(settings.archive_dir)), name="fdroid-archive")
