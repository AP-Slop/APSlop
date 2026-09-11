#!/usr/bin/env bash
# OpenAP のデータをバックアップする。
#   - store-data ボリューム: /data/keys/*.jks (アプリごとの APK 署名鍵。失うとそのアプリは二度と更新できない)
#                            /data/fdroid/keystore.p12, config.yml (リポジトリ署名鍵と設定)
#   - web-data ボリューム:    openap.db (SQLite: アプリ台帳・利用者・生成履歴)
# 出力: ~/backups/openap-YYYYmmdd-HHMM.tar.gz (直近 KEEP 世代を保持)
#
# 環境変数:
#   BACKUP_DIR      出力先 (既定 ~/backups)
#   KEEP            保持世代数 (既定 14)
#   RCLONE_REMOTE   設定済みなら rclone でアップロード (例 "gdrive:openap-backups")
#   COMPOSE_PROJECT compose プロジェクト名 (既定 openap = ディレクトリ名)
#
# cron 例 (毎日 4:00):
#   0 4 * * * /home/ubuntu/openap/deploy/oracle/backup.sh >> /home/ubuntu/backups/backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
KEEP="${KEEP:-14}"
PROJECT="${COMPOSE_PROJECT:-openap}"
STAMP="$(date +%Y%m%d-%H%M)"
OUT="$BACKUP_DIR/openap-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

for v in "${PROJECT}_store-data" "${PROJECT}_web-data"; do
  if ! docker volume inspect "$v" >/dev/null 2>&1; then
    echo "volume not found: $v" >&2
    exit 1
  fi
done

# /var/lib/docker を直接読まず、ボリュームを alpine にマウントして tar する
docker run --rm \
  -v "${PROJECT}_store-data:/src/store:ro" \
  -v "${PROJECT}_web-data:/src/web:ro" \
  -v "$BACKUP_DIR:/out" \
  alpine:3 sh -c "
    set -e
    cd /src
    tar czf /out/openap-$STAMP.tar.gz \
      store/keys \
      store/fdroid/keystore.p12 \
      store/fdroid/config.yml \
      store/fdroid/metadata \
      web/openap.db
  "
chmod 600 "$OUT"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"

# 古い世代を削除
ls -1t "$BACKUP_DIR"/openap-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

# 任意: rclone でオフサイトへ
if [ -n "${RCLONE_REMOTE:-}" ] && command -v rclone >/dev/null 2>&1; then
  rclone copy "$OUT" "$RCLONE_REMOTE/" && echo "uploaded to $RCLONE_REMOTE"
fi
