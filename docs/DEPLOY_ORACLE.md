# Oracle Cloud Always Free でホストする

APSlop を Oracle Cloud Infrastructure (OCI) の Always Free 枠(Ampere A1、ARM64)で公開する手順。
構成は「1 台の VM + Docker Compose + Caddy(自動 HTTPS)」で、公開ホスト名は 1 つ(`APSLOP_DOMAIN`)。

```
インターネット ──443──▶ Caddy ──┬── /fdroid/*  ──▶ store-server:8080  (F-Droid リポジトリ)
                              └── それ以外    ──▶ web:3000           (Next.js)
```

関連ファイル: `docker-compose.prod.yml`(本番オーバーライド)、`deploy/Caddyfile`、`deploy/oracle/setup.sh`、`deploy/oracle/backup.sh`。

## 1. OCI アカウントとコンパートメント

1. https://www.oracle.com/cloud/free/ でアカウントを作成する(クレジットカード登録が必要だが Always Free 枠の範囲では課金されない)。
2. ホームリージョンは後から変えられない。Always Free の A1 はホームリージョンでしか作れないので、近い(例: `ap-tokyo-1`)を選ぶ。
3. コンパートメントは既定の root でよい。分けたい場合は Identity → Compartments で作る。

## 2. インスタンスを作る (Ampere A1)

Compute → Instances → Create instance:

| 項目 | 値 |
|---|---|
| Image | Ubuntu 24.04 **Minimal**(aarch64)。"Canonical Ubuntu 24.04 Minimal aarch64" |
| Shape | **VM.Standard.A1.Flex**(Ampere)。OCPU 4 / メモリ 24 GB まで無料。2 OCPU / 12 GB でも足りる |
| Networking | 新規 VCN でよい。**Assign a public IPv4 address** にチェック |
| SSH keys | 自分の公開鍵を貼る |
| Boot volume | 50 GB(無料枠は合計 200 GB) |

注意:

- **AMD の Micro(VM.Standard.E2.1.Micro、1 GB RAM)は不可**。Next.js のビルドと fdroidserver(Java)が載らない。
- A1 は人気で **"Out of host capacity"** で失敗することが多い。時間を置いて再試行するか、別の Availability Domain を選ぶ。OCPU/メモリを減らすと通りやすい。
- 作成後、Instance details の **Public IP address** を控える。

## 3. VCN のセキュリティリスト (受信ポート)

Networking → Virtual cloud networks → 作成された VCN → Security Lists → Default Security List → Add Ingress Rules:

| Source CIDR | Protocol | Dest port | 用途 |
|---|---|---|---|
| 0.0.0.0/0 | TCP | 80 | Let's Encrypt の検証と HTTPS へのリダイレクト |
| 0.0.0.0/0 | TCP | 443 | HTTPS |
| 0.0.0.0/0 | UDP | 443 | HTTP/3(任意) |

22 は既定で開いている。OS 側の iptables は `setup.sh` が開ける(手順 5)。

## 4. DNS

公開ホスト名を Public IP に向ける。

- 自前ドメインなら A レコード: `apslop.example.com → <Public IP>`
- 無料で済ませるなら DuckDNS: https://www.duckdns.org で `xxxx.duckdns.org` を作り IP を登録する

`dig +short <ホスト名>` が Public IP を返すことを確認してから先へ進む(証明書取得に必要)。

## 5. サーバー初期化 (`setup.sh`)

```sh
ssh ubuntu@<Public IP>

# リポジトリ URL を指定して実行 (Docker 導入・スワップ・iptables 開放・clone・雛形同期まで行う)
curl -fsSL https://raw.githubusercontent.com/<org>/<repo>/main/deploy/oracle/setup.sh \
  | REPO_URL=https://github.com/<org>/<repo>.git bash
```

スクリプトがやること(何度実行しても安全):

- apt upgrade、Docker CE + compose plugin の導入(arm64 対応の公式リポジトリ)、`ubuntu` を docker グループへ
- 4 GB のスワップ作成(`SWAP_GB` で変更可)
- **OCI の Ubuntu イメージは iptables で 22 以外を REJECT している**ため、80/443 を ACCEPT して `netfilter-persistent` で永続化
- `~/apslop` に clone(既にあれば `git pull`)
- `.env` が無ければ `.env.example` から作成(このときは起動せず終了する)
- `templates/android-compose-app` を `web/template` に同期(web イメージのビルドに必要)

初回は `.env` を作って止まるので、手順 6 の後に起動する。

## 6. `.env` を本番用に編集する

`~/apslop/.env` を編集する。ローカル用との違いは URL 系と `AUTH_TRUST_HOST`。

```sh
# 公開ホスト名 (Caddy が証明書を取る名前)
APSLOP_DOMAIN=apslop.example.com

# URL は全部 https://<APSLOP_DOMAIN>
AUTH_URL=https://apslop.example.com
NEXT_PUBLIC_APP_URL=https://apslop.example.com
NEXT_PUBLIC_STORE_URL=https://apslop.example.com
STORE_PUBLIC_URL=https://apslop.example.com
# Caddy 配下なので必須
AUTH_TRUST_HOST=true

# compose 内部の通信はそのまま
STORE_SERVER_URL=http://store-server:8080

# 秘密情報 (ローカルと同じ意味)
GITHUB_ORG=...
GITHUB_ADMIN_TOKEN=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...        # openssl rand -hex 32
AUTH_SECRET=...                  # openssl rand -base64 32
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-opus-5
STORE_TOKEN=...                  # openssl rand -hex 32
STORE_KEY_PASSWORD=...           # 6 文字以上。変更すると既存の鍵が開けなくなる
STORE_REPO_NAME=...
STORE_REPO_DESCRIPTION=...
NEXT_PUBLIC_SITE_NAME=...
```

`STORE_PORT` は本番では使わない(Caddy 経由のみで、ホストにポートを公開しない)。

## 7. GitHub 側の URL を本番に合わせる

- **OAuth App**: Authorization callback URL を `https://<APSLOP_DOMAIN>/api/auth/callback/github` に変更(または本番用の OAuth App を別に作る)。
- **Org Webhook**: Payload URL を `https://<APSLOP_DOMAIN>/api/webhooks/github`、Secret を `GITHUB_WEBHOOK_SECRET` と同じ値に。イベントは `Workflow runs`, `Releases`, `Pull requests`, `Pushes`。

その他は [docs/SETUP_GITHUB.md](SETUP_GITHUB.md) と同じ。

## 8. 起動と確認

```sh
cd ~/apslop
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

初回ビルドは 10 分前後(A1 4 OCPU の場合)。確認:

```sh
# 証明書と web
curl -sI https://<APSLOP_DOMAIN>/ | head -3
# F-Droid index (repo.address が https://<APSLOP_DOMAIN>/fdroid/repo になっている)
curl -s https://<APSLOP_DOMAIN>/fdroid/repo/index-v2.json | head -c 300
# store-server のヘルス (内部)
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec store-server curl -s http://localhost:8080/healthz
# webhook 署名検証が効いている (401 が正常)
curl -s -X POST -H 'x-github-event: ping' https://<APSLOP_DOMAIN>/api/webhooks/github
```

Android クライアントや公式 F-Droid クライアントには `https://<APSLOP_DOMAIN>/fdroid/repo` を登録する。

## 9. 運用

### ログ

```sh
cd ~/apslop
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f --tail 100
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f caddy   # 証明書取得の様子
```

### 更新

```sh
cd ~/apslop
git pull
bash deploy/oracle/setup.sh          # 雛形同期を含めて再ビルド・再起動 (.env はそのまま)
```

### バックアップ (重要)

`store-data` ボリュームの `keys/*.jks` は **アプリごとの APK 署名鍵**で、失うとそのアプリは二度と更新配信できない(署名が変わると Android が更新を拒否する)。`keystore.p12` はリポジトリ署名鍵で、失うと全利用者がリポジトリを登録し直す必要がある。

```sh
bash ~/apslop/deploy/oracle/backup.sh           # ~/backups/apslop-YYYYmmdd-HHMM.tar.gz
# 毎日 4:00 に取る
( crontab -l 2>/dev/null; echo '0 4 * * * /home/ubuntu/apslop/deploy/oracle/backup.sh >> /home/ubuntu/backups/backup.log 2>&1' ) | crontab -
```

`RCLONE_REMOTE=gdrive:apslop-backups` を設定すると rclone で外部にも送る。VM 1 台に鍵を置くだけにしないこと。

復元は、ボリュームを alpine にマウントして tar を展開する:

```sh
docker run --rm -v apslop_store-data:/dst/store -v apslop_web-data:/dst/web -v ~/backups:/in:ro alpine:3 \
  sh -c 'cd /dst && tar xzf /in/apslop-<日時>.tar.gz'
```

### Always Free の制限

- A1 は合計 4 OCPU / 24 GB まで、インスタンス数は最大 2。
- ブロックストレージは合計 200 GB(ブートボリューム含む)。
- 送信帯域 10 TB/月。
- **アイドル回収**: Free Tier アカウントでは、7 日間の CPU 使用率 10% 未満などの条件で A1 インスタンスが停止・回収されることがある。小規模利用でも起きうるので、`docker compose` を常時動かし、**Pay As You Go にアップグレード**しておくと回収対象から外れる(Always Free 枠の範囲なら課金は 0 のまま。Billing → Upgrade and Manage Payment)。
- 課金の確認: Billing & Cost Management → Cost Analysis で 0 になっていることを月初に見る。

## 10. トラブルシューティング

| 症状 | 対処 |
|---|---|
| インスタンス作成で "Out of host capacity" | 時間をおいて再試行。別 AD、OCPU/メモリを減らす。ホームリージョンでしか無料 A1 は作れない |
| `curl https://<DOMAIN>` がタイムアウト | (1) VCN のセキュリティリストに 80/443 の Ingress があるか (2) OS の iptables: `sudo iptables -S INPUT` に `--dport 443 -j ACCEPT` が REJECT より前にあるか。無ければ `setup.sh` を再実行 |
| Caddy が証明書を取れない | DNS が Public IP を指しているか(`dig +short`)、80 番が外から届くか。`docker compose logs caddy` に ACME のエラーが出る。Let's Encrypt のレート制限(同一ホスト名で週 5 回)に注意 |
| ログインが `Untrusted host` / callback エラー | `.env` の `AUTH_TRUST_HOST=true` と `AUTH_URL=https://<DOMAIN>`、OAuth App の callback URL を確認 |
| `next build` が途中で落ちる / OOM | スワップが有効か `swapon --show`。`SWAP_GB=8 bash deploy/oracle/setup.sh` で増やす |
| store-server のイメージがビルドできない | ARM64 では fdroidserver の公式 Docker イメージが無いため、`store-server/Dockerfile` は Debian のパッケージ(apksigner, zipalign)と pip の fdroidserver / androguard で構成している。ビルドログの apt/pip のエラーを確認 |
| webhook が届かない | Org Webhook の Recent Deliveries でレスポンスを見る。401 は Secret 不一致、404 は URL 誤り |
| APK がストアに載らない | `docker compose logs store-server`。Release に `.apk` が添付済みか、`/repos/<name>/releases` の「ストアに同期」で手動同期 |
| ディスクが逼迫 | `docker system prune -f`(古いイメージを削除)。`df -h` で確認 |
