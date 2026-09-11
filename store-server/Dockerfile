# store-server: FastAPI + fdroidserver, built from Debian packages so the same image
# builds on amd64 and arm64 (e.g. Oracle Cloud Ampere A1). The official fdroidserver
# docker image is amd64-only, so it is not used here.
FROM python:3.12-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    LC_ALL=C.UTF-8 \
    STORE_DATA_DIR=/data

# default-jdk-headless: keytool + jarsigner (index signing), apksigner runs on Java
# apksigner / zipalign / aapt: Android build-tools packaged by Debian (arm64 builds exist)
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        default-jdk-headless apksigner zipalign aapt \
        git rsync curl ca-certificates; \
    rm -rf /var/lib/apt/lists/*; \
    for t in keytool jarsigner apksigner zipalign aapt curl; do command -v "$t"; done

WORKDIR /srv/store
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && fdroid --version \
    && python3 -c 'import androguard; print("androguard", androguard.__version__)'

COPY app ./app

VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=10 CMD curl -fsS http://localhost:8080/healthz || exit 1

CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
