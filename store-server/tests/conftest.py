import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Must be set before `app.config` is imported anywhere.
os.environ.setdefault("STORE_DRY_RUN", "1")
os.environ.setdefault("STORE_TOKEN", "test-token")
os.environ.setdefault("STORE_PUBLIC_URL", "http://store.test")
os.environ.setdefault("STORE_DATA_DIR", str(Path(os.environ.get("TMPDIR", "/tmp")) / "apslop-store-test"))
