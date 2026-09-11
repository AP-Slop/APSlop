#!/usr/bin/env bash
# OpenAP: Oracle Cloud Always Free (Ampere A1, Ubuntu 24.04) 用の初期セットアップ。
# ubuntu ユーザーで実行する (sudo を内部で使う)。何度実行しても安全 (冪等)。
#
#   curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/deploy/oracle/setup.sh | \
#     REPO_URL=https://github.com/<org>/<repo>.git bash
#   または clone 済みなら:  bash deploy/oracle/setup.sh
#
# 環境変数:
#   REPO_URL   clone 元 (未指定なら clone をスキップし、カレントの checkout を使う)
#   APP_DIR    配置先 (既定 ~/openap)
#   SWAP_GB    スワップサイズ GB (既定 4、0 で作らない)
#   NO_START=1 compose の起動をスキップ (.env を先に編集したいとき)
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/openap}"
SWAP_GB="${SWAP_GB:-4}"
REPO_URL="${REPO_URL:-}"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$*" >&2; }

# ---------------------------------------------------------------- 前提確認
if [ "$(id -u)" -eq 0 ]; then
  warn "root ではなく一般ユーザー (ubuntu) で実行してください"; exit 1
fi
ARCH="$(uname -m)"
if [ "$ARCH" != "aarch64" ]; then
  warn "アーキテクチャが $ARCH です。この手順は Ampere A1 (aarch64) を想定しています。続行しますが、AMD micro (1GB RAM) ではメモリ不足になります。"
fi
if ! grep -qi ubuntu /etc/os-release; then
  warn "Ubuntu 以外の OS です。パッケージ名が異なる可能性があります。"
fi

# ---------------------------------------------------------------- パッケージ
log "apt update / upgrade"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl git rsync gnupg

# ---------------------------------------------------------------- Docker (公式リポジトリ)
if ! command -v docker >/dev/null 2>&1; then
  log "Docker をインストール"
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  DEB_ARCH="$(dpkg --print-architecture)"   # arm64 / amd64
  CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
  echo "deb [arch=${DEB_ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  log "Docker は導入済み: $(docker --version)"
fi
sudo systemctl enable --now docker
if ! id -nG "$USER" | grep -qw docker; then
  sudo usermod -aG docker "$USER"
  ADDED_TO_DOCKER_GROUP=1
fi
# 今のシェルはまだ docker グループを持たないので、以降の docker 呼び出しは sg で行う
dockerx() { if id -nG | grep -qw docker; then "$@"; else sg docker -c "$(printf '%q ' "$@")"; fi; }

# ---------------------------------------------------------------- スワップ (Next.js ビルド対策)
if [ "$SWAP_GB" != "0" ] && ! swapon --show | grep -q .; then
  log "${SWAP_GB}GB のスワップを作成"
  sudo fallocate -l "${SWAP_GB}G" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
else
  log "スワップは設定済み (または SWAP_GB=0)"
fi

# ---------------------------------------------------------------- iptables (OCI Ubuntu イメージは 22 以外を REJECT している)
log "iptables で 80/443 を開放"
sudo apt-get install -y iptables-persistent netfilter-persistent
open_port() { # proto port
  if ! sudo iptables -C INPUT -p "$1" --dport "$2" -j ACCEPT 2>/dev/null; then
    # 既存の REJECT ルールより前に入れる必要があるので先頭に挿入
    sudo iptables -I INPUT 1 -p "$1" --dport "$2" -j ACCEPT
  fi
}
open_port tcp 80
open_port tcp 443
open_port udp 443
sudo netfilter-persistent save >/dev/null

# ---------------------------------------------------------------- リポジトリ
if [ -n "$REPO_URL" ]; then
  if [ -d "$APP_DIR/.git" ]; then
    log "リポジトリを更新: $APP_DIR"
    git -C "$APP_DIR" pull --ff-only
  else
    log "リポジトリを clone: $REPO_URL -> $APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
  fi
elif [ -f "$(pwd)/docker-compose.yml" ]; then
  APP_DIR="$(pwd)"
  log "カレントの checkout を使用: $APP_DIR"
elif [ -d "$APP_DIR/.git" ]; then
  log "既存の checkout を使用: $APP_DIR"
else
  warn "REPO_URL が未指定で、リポジトリも見つかりません。REPO_URL=... を付けて再実行してください。"; exit 1
fi
cd "$APP_DIR"

# ---------------------------------------------------------------- .env
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  ENV_CREATED=1
  log ".env を .env.example から作成しました。起動前に次を編集してください:"
  cat <<'EOT'
    GITHUB_ORG, GITHUB_ADMIN_TOKEN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_WEBHOOK_SECRET
    AUTH_SECRET (openssl rand -base64 32), ANTHROPIC_API_KEY
    STORE_TOKEN, STORE_KEY_PASSWORD (6 文字以上)
    OPENAP_DOMAIN=<公開ホスト名>
    AUTH_URL / NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_STORE_URL / STORE_PUBLIC_URL = https://<OPENAP_DOMAIN>
    AUTH_TRUST_HOST=true
EOT
fi

# ---------------------------------------------------------------- web/template (Docker build context に雛形を入れる)
# web/scripts/sync-template.mjs と同じ除外 (.gradle, build, .idea, local.properties, .kotlin)。Node 不要。
log "templates/android-compose-app -> web/template を同期"
rm -rf web/template
rsync -a \
  --exclude '.gradle' --exclude 'build' --exclude '.idea' --exclude 'local.properties' --exclude '.kotlin' \
  templates/android-compose-app/ web/template/

# ---------------------------------------------------------------- 起動
if [ "${NO_START:-}" = "1" ] || [ "${ENV_CREATED:-}" = "1" ]; then
  log "起動はスキップしました。.env を編集後に次を実行してください:"
  echo "    cd $APP_DIR && ${COMPOSE[*]} up -d --build"
else
  log "ビルドして起動 (初回は 10 分前後かかります)"
  dockerx "${COMPOSE[@]}" up -d --build
  dockerx "${COMPOSE[@]}" ps
  log "確認: https://$(grep -E '^OPENAP_DOMAIN=' .env | cut -d= -f2)/fdroid/repo/index-v2.json"
fi

if [ "${ADDED_TO_DOCKER_GROUP:-}" = "1" ]; then
  warn "docker グループに追加しました。ログインし直すと sudo なしで docker が使えます。"
fi
