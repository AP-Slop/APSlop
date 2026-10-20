#!/bin/sh
# Build the store app for this deployment and publish it in the store (signed by store-server
# like every other app). Run on the host that runs `docker compose`, from anywhere in the repo.
#
#   android/publish-store-app.sh [repo-url]
#
# The app's default repository is repo-url, else STORE_PUBLIC_URL from .env + /fdroid/repo, so phones
# that download it from the website open this store without any setup. Locally, pass
# http://10.0.2.2:<STORE_PORT>/fdroid/repo for the Android emulator. Bump versionCode in
# app/build.gradle.kts to ship an update to phones that already have it.
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

if [ $# -ge 1 ]; then
  repo_url=$1
else
  public_url=$(sed -n 's/^STORE_PUBLIC_URL=//p' .env | tail -n 1)
  [ -n "$public_url" ] || { echo "STORE_PUBLIC_URL is not set in .env" >&2; exit 1; }
  repo_url="${public_url%/}/fdroid/repo"
fi

echo "Building the store app for $repo_url"
./android/gradlew -p android -q :app:assembleRelease -Papslop.repoUrl="$repo_url"
apk=android/app/build/outputs/apk/release/app-release-unsigned.apk

docker compose cp "$apk" store-server:/tmp/store-app.apk
# The token stays inside the container.
docker compose exec -T store-server sh -c \
  'curl -fsS -X PUT -H "X-Store-Token: $STORE_TOKEN" --data-binary @/tmp/store-app.apk http://localhost:8080/store-app; status=$?; rm -f /tmp/store-app.apk; echo; exit $status'
