# OpenAP

大学内の誰もが **AI でアプリを作り、公開し、Pull Request を送れる** 大学コミュニティ版 GitHub。

- **Web**: GitHub 風の UI(リポジトリ / PR / Issue / AI によるアプリ生成と改良)
- **モバイル**: F-Droid 互換のアプリストア(専用 Android クライアント、公式 F-Droid クライアントからも登録可)

Git の実体は github.com の Organization に置き、本リポジトリは Web UI・AI 生成・アプリストアを提供する。
詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 構成

| ディレクトリ | 内容 |
|---|---|
| `web/` | Next.js の Web アプリ (UI + API + AI 生成) |
| `store-server/` | F-Droid 互換リポジトリを生成・配信するサーバー |
| `android/` | ストア Android クライアント |
| `templates/android-compose-app/` | AI が生成するアプリの雛形 (CI で APK をビルド) |

## 起動

```sh
cp .env.example .env   # GitHub / Anthropic の値を埋める
docker compose up --build
```

- Web: http://localhost:3000
- ストア (F-Droid リポジトリ): http://localhost:8080/fdroid/repo

## GitHub 側の準備

1. Organization を作成し `GITHUB_ORG` に設定
2. Org 管理権限のトークンを `GITHUB_ADMIN_TOKEN` に設定
3. OAuth App を作成(callback: `{AUTH_URL}/api/auth/callback/github`)
4. Org の Webhook を `{NEXT_PUBLIC_APP_URL}/api/webhooks/github` に設定(イベント: workflow_run, release, pull_request, push)

## デプロイ

Oracle Cloud Always Free(Ampere A1 / ARM64)に Caddy + Docker Compose で公開する手順は
[docs/DEPLOY_ORACLE.md](docs/DEPLOY_ORACLE.md) を参照。本番は次で起動する。

```sh
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
