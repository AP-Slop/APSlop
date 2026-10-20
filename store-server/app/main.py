"""APSlop store-server: F-Droid compatible repository generator & host."""
from __future__ import annotations

import logging
import mimetypes
import secrets
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import fdroid
from .config import settings
from .signing import SigningError
from .store_app import publish_store_app
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
    author: str | None = Field(default=None, max_length=100, description="shown as the app's author; release author if omitted")


@app.exception_handler(HTTPException)
async def http_exc(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail)})


@app.get("/healthz")
def healthz() -> dict[str, bool]:
    return {"ok": True}


@app.post("/sync", dependencies=[Depends(require_token)])
async def sync(req: SyncRequest) -> dict[str, Any]:
    try:
        return await run_in_threadpool(sync_release, req.repo, req.tag, req.author)
    except SyncError as e:
        raise HTTPException(status_code=e.status, detail=e.message) from e


class SummaryRequest(BaseModel):
    summary: str = Field(..., min_length=1, max_length=80)


def _package(package_name: str) -> str:
    if not fdroid.PACKAGE_NAME.match(package_name):
        raise HTTPException(status_code=400, detail="invalid package name")
    return package_name


def _set_summary(package_name: str, summary: str) -> bool:
    with fdroid.repo_lock:
        if not fdroid.set_summary(package_name, summary):
            return False
        fdroid.fdroid_update()
        return True


def _remove(package_name: str) -> int:
    with fdroid.repo_lock:
        removed = fdroid.remove_package(package_name)
        if removed:
            fdroid.fdroid_update()
        return removed


@app.put("/apps/{package_name}/summary", dependencies=[Depends(require_token)])
async def put_summary(package_name: str, req: SummaryRequest) -> dict[str, Any]:
    try:
        if not await run_in_threadpool(_set_summary, _package(package_name), req.summary.strip()):
            raise HTTPException(status_code=404, detail=f"{package_name} is not in the store")
    except SigningError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return {"packageName": package_name, "summary": req.summary.strip()}


@app.delete("/apps/{package_name}", dependencies=[Depends(require_token)])
async def delete_app(package_name: str) -> dict[str, Any]:
    """Take a package off the store. Deleting one that is not there succeeds, so callers can retry."""
    try:
        removed = await run_in_threadpool(_remove, _package(package_name))
    except SigningError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    log.info("removed %s (%d files)", package_name, removed)
    return {"packageName": package_name, "removed": removed}


# Larger than any store app build; the body is held in memory.
STORE_APP_MAX_BYTES = 100 * 1024 * 1024


@app.put("/store-app", dependencies=[Depends(require_token)])
async def put_store_app(request: Request) -> dict[str, Any]:
    """Publish the APSlop store app itself (the request body is its APK)."""
    if int(request.headers.get("content-length") or 0) > STORE_APP_MAX_BYTES:
        raise HTTPException(status_code=413, detail="the APK is too large")
    try:
        return await run_in_threadpool(publish_store_app, await request.body())
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
