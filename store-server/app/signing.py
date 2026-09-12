"""APK inspection (androguard) and keytool / apksigner / zipalign wrappers."""
from __future__ import annotations

import functools
import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from .config import settings


class SigningError(Exception):
    pass


@dataclass
class ApkInfo:
    package_name: str
    version_code: int
    version_name: str
    app_name: str = ""  # android:label resolved from resources; "" if it could not be resolved


def run(cmd: list[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if check and proc.returncode != 0:
        tail = (proc.stderr or proc.stdout or "")[-2000:]
        raise SigningError(f"{cmd[0]} failed ({proc.returncode}): {tail}")
    return proc


def which(tool: str) -> str | None:
    return shutil.which(tool)


@functools.cache
def _quiet_androguard() -> None:
    """androguard 4 logs every parsed resource chunk through loguru at DEBUG; keep errors only."""
    try:
        from loguru import logger
    except ImportError:  # pragma: no cover
        return
    logger.remove()
    logger.add(sys.stderr, level="ERROR")


def inspect_apk(path: Path) -> ApkInfo:
    _quiet_androguard()
    try:
        from androguard.core.apk import APK  # androguard >= 4 (bundled with fdroidserver)
    except ImportError:  # pragma: no cover
        try:
            from androguard.core.bytecodes.apk import APK  # androguard 3.x
        except ImportError as e:
            raise SigningError("androguard is not installed") from e
    apk = APK(str(path))
    pkg = apk.get_package()
    vc = apk.get_androidversion_code()
    vn = apk.get_androidversion_name() or "0"
    if not pkg or not vc:
        raise SigningError(f"could not read package/versionCode from {path.name}")
    try:
        label = (apk.get_app_name() or "").strip()
    except Exception:  # noqa: BLE001 - the label is cosmetic; callers fall back to the repo name
        label = ""
    if label.startswith("@"):  # unresolved resource reference such as "@7F0F001D"
        label = ""
    return ApkInfo(package_name=pkg, version_code=int(vc), version_name=str(vn), app_name=label)


def is_signed(path: Path) -> bool:
    tool = which("apksigner")
    if not tool:
        raise SigningError("apksigner not found")
    proc = run([tool, "verify", str(path)], check=False)
    return proc.returncode == 0


def signer_sha256(path: Path) -> str:
    """SHA-256 of the first signer certificate, lowercase hex (same as fdroid's 'signer')."""
    tool = which("apksigner")
    if not tool:
        raise SigningError("apksigner not found")
    proc = run([tool, "verify", "--print-certs", str(path)])
    m = re.search(r"Signer #1 certificate SHA-256 digest:\s*([0-9a-fA-F]{64})", proc.stdout)
    if not m:
        raise SigningError("could not parse signer certificate digest")
    return m.group(1).lower()


def ensure_package_key(package_name: str) -> Path:
    settings.keys_dir.mkdir(parents=True, exist_ok=True)
    ks = settings.keys_dir / f"{package_name}.jks"
    if ks.exists():
        return ks
    tool = which("keytool")
    if not tool:
        raise SigningError("keytool not found")
    run(
        [
            tool, "-genkeypair", "-keystore", str(ks), "-storetype", "PKCS12",
            "-storepass", settings.key_password, "-keypass", settings.key_password,
            "-alias", package_name, "-keyalg", "RSA", "-keysize", "4096", "-validity", "10000",
            "-dname", f"CN={package_name}, O=APSlop",
        ]
    )
    ks.chmod(0o600)
    return ks


def sign_apk(src: Path, dest: Path, package_name: str) -> Path:
    """zipalign (if available) then apksigner-sign `src` into `dest` with the per-package key."""
    ks = ensure_package_key(package_name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    apksigner = which("apksigner")
    if not apksigner:
        raise SigningError("apksigner not found")
    # The aligned copy goes to a scratch dir: `src` may live on a read-only mount.
    with tempfile.TemporaryDirectory(prefix="apslop-sign-") as tmp:
        aligned = src
        za = which("zipalign")
        if za:
            aligned = Path(tmp) / "aligned.apk"
            run([za, "-f", "-p", "4", str(src), str(aligned)])
        run(
            [
                apksigner, "sign", "--ks", str(ks), "--ks-pass", f"pass:{settings.key_password}",
                "--key-pass", f"pass:{settings.key_password}", "--ks-key-alias", package_name,
                "--out", str(dest), str(aligned),
            ]
        )
    return dest


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()
