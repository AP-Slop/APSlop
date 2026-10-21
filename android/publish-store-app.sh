#!/bin/sh
# Build the store app for this deployment and publish it in the store (signed by store-server
# like every other app). Run on the host that runs `docker compose`, from anywhere in the repo.
#
#   android/publish-store-app.sh [repo-url]
#   STORE_TOKEN=… android/publish-store-app.sh --cloudflare <site-url>
#
# With --cloudflare the store app points at <site-url>/fdroid/repo and is uploaded to the site
# (docs/DEPLOY_CLOUDFLARE.md); STORE_TOKEN is the Worker's secret of that name.
# The app's default repository is repo-url, else STORE_PUBLIC_URL from .env + /fdroid/repo, so phones
# that download it from the website open this store without any setup. Locally, pass
# http://10.0.2.2:<STORE_PORT>/fdroid/repo for the Android emulator. Bump versionCode in
# app/build.gradle.kts to ship an update to phones that already have it.
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

build() {
  echo "Building the store app for $1"
  ./android/gradlew -p android -q :app:assembleRelease -Papslop.repoUrl="$1"
}
apk=android/app/build/outputs/apk/release/app-release-unsigned.apk

if [ "${1:-}" = "--cloudflare" ]; then
  site=${2:?usage: publish-store-app.sh --cloudflare <site-url>}
  site=${site%/}
  : "${STORE_TOKEN:?set STORE_TOKEN to the Worker secret}"
  build "$site/fdroid/repo"
  # The token goes in through stdin, so it never shows in the process list.
  printf 'X-Store-Token: %s\n' "$STORE_TOKEN" |
    curl -fsS -X PUT -H @- -H 'Content-Type: application/vnd.android.package-archive' --data-binary @"$apk" "$site/_store/store-app"
  echo
  exit
fi

if [ $# -ge 1 ]; then
  repo_url=$1
else
  public_url=$(sed -n 's/^STORE_PUBLIC_URL=//p' .env | tail -n 1)
  [ -n "$public_url" ] || { echo "STORE_PUBLIC_URL is not set in .env" >&2; exit 1; }
  repo_url="${public_url%/}/fdroid/repo"
fi

build "$repo_url"

docker compose cp "$apk" store-server:/tmp/store-app.apk
# The token stays inside the container.
docker compose exec -T store-server sh -c \
  'curl -fsS -X PUT -H "X-Store-Token: $STORE_TOKEN" --data-binary @/tmp/store-app.apk http://localhost:8080/store-app; status=$?; rm -f /tmp/store-app.apk; echo; exit $status'
