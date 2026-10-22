# APSlop アーキテクチャ

大学コミュニティ向けの「AI でアプリを作って公開できる GitHub」。
Git の実体は github.com 上の Organization に置き、自前サーバーは
**Web UI / AI 生成 / アプリストア** の3つを提供する。

```
┌──────────────┐  OAuth / REST   ┌──────────────────┐
│  利用者ブラウザ │ ───────────────▶│  web (Next.js)   │──────┐
└──────────────┘                 │  - GitHub ラッパー UI │      │ Claude API
                                 │  - AI 生成 → repo/PR │◀─────┘
┌──────────────┐  index-v2.json  │  - App カタログ      │
│ Android クライアント│◀──────────┐   └────────┬─────────┘
│ (store app)   │             │            │ POST /sync (X-Store-Token)
└──────────────┘             │            ▼
                             │   ┌──────────────────┐   release webhook
                             └───│ store-server     │◀──────── github.com
                                 │ (FastAPI+fdroid) │          Organization
                                 │ - APK 取得/署名     │  ───────▶ Actions が APK をビルド
                                 │ - fdroid update   │
                                 │ - /fdroid/repo 配信 │
                                 └──────────────────┘
```

## コンポーネント

| ディレクトリ | 役割 | 技術 |
|---|---|---|
| `web/` | Web UI・API・AI 生成・カタログ DB | Next.js 16 (App Router, TS), Auth.js v5 GitHub provider, Octokit, `@anthropic-ai/sdk`, Prisma + SQLite, Tailwind |
| `store-server/` | F-Droid 互換リポジトリ生成・APK 署名・配信 | Python 3 / FastAPI / fdroidserver / apksigner |
| `android/` | 大学ブランドのストアアプリ | Kotlin / Jetpack Compose / kotlinx.serialization / Coil |
| `templates/android-compose-app/` | AI が生成する Android アプリの雛形。CI で APK をビルドし Release に添付 | Gradle KTS / Compose / GitHub Actions |


## GitHub 側の前提

- Organization を1つ用意する(`GITHUB_ORG`)。全リポジトリはこの Org 配下に作る。
- サーバー用に Org 管理権限を持つトークン(`GITHUB_ADMIN_TOKEN`。fine-grained PAT か GitHub App の installation token)。用途: リポジトリ作成、コラボレータ追加、Org 招待、Release 取得。
- 利用者は GitHub OAuth App(`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`)でログインする。要求 scope: `read:user user:email repo`。利用者自身の操作(コミット、PR 作成、レビュー、マージ)は利用者のトークンで行う。
- Org の webhook(`workflow_run`, `release`, `pull_request`, `push`)を `https://<web>/api/webhooks/github` に向ける。秘密鍵は `GITHUB_WEBHOOK_SECRET`。

## 利用者フロー

1. **ログイン**: GitHub OAuth。初回ログイン時に Org へ招待(admin token)し、`User` を作成。
2. **AI でアプリを作る** (`/new`):
   - 説明文を入力 → Claude が雛形をベースにファイル一式を生成(tool-use で構造化出力)。
   - web が Org に `<slug>` リポジトリを作成し、Git Data API で全ファイルを1コミットで投入。利用者を admin コラボレータに追加。
   - `App` レコード(status=DRAFT)を作る。
   - テンプレの CI(`assembleDebug testDebugUnitTest`)が初期コミットをビルドする。結果は `workflow_run` webhook で
     `Generation.buildStatus` に記録し、失敗なら AI にログの抜粋と全ファイルを渡して修正コミットを main に積む
     (最大 2 回。`web/src/lib/build-fix.ts`)。画面には "Building… / AI is fixing the build (1/2) / Build passed / Build failed"。
3. **公開する**: UI から「リリース」→ タグ `vX.Y.Z` を作成。テンプレの GitHub Actions が `assembleRelease`(未署名 APK)をビルドし、Release に添付する。
4. **取り込み**: Release ワークフロー完了の `workflow_run` webhook(APK 添付済み)→ web が `store-server` の `POST /sync` を呼ぶ → store-server が APK をダウンロードし、パッケージごとの鍵で署名して `fdroid update`。`App` の `latestVersion` 等を更新、status=PUBLISHED。
5. **配信**: Android クライアント(または公式 F-Droid クライアント)が `https://<store>/fdroid/repo` を読む。
6. **改良・PR**: 他人のリポジトリに対しても「AI に変更を依頼」→ ブランチ作成 + コミット + PR 作成(利用者トークン)。PR 画面でレビュー・マージ。
   PR の CI が失敗したら 2 と同じ要領で AI が PR ブランチに修正コミットを積む(サーバー用トークン)。

## 契約 (コンポーネント間インターフェース)

### web → store-server

```
POST {STORE_SERVER_URL}/sync
Headers: X-Store-Token: {STORE_TOKEN}
Body: { "repo": "org/name", "tag": "v1.2.3", "author": "login" }   // tag 省略時は latest release
                                                                  // author はストアに出す作者 (アプリの持ち主)。省略時は Release の作成者
200: {
  "packageName": "dev.apslop.apps.foo",
  "versionName": "1.2.3",
  "versionCode": 10203,
  "apkName": "dev.apslop.apps.foo_10203.apk",
  "sha256": "...",
  "signer": "<sha256 of signing cert>"
}
4xx/5xx: { "error": "message" }

GET {STORE_SERVER_URL}/apps
200: [{ "packageName", "name", "summary", "description", "versionName", "versionCode", "iconUrl", "apkUrl", "apkName", "apkSize", "minSdk", "sourceCode", "webSite", "added", "lastUpdated" }]
// iconUrl は fdroid が作った 640dpi の icons-640/ があればそれ、無ければ index-v2 の icons/(160dpi)

PUT {STORE_SERVER_URL}/apps/{packageName}/summary   // Settings で一言を保存したとき
Headers: X-Store-Token: {STORE_TOKEN}
Body: { "summary": "one line, 1-80 chars" }
200: { "packageName", "summary" }   404: ストアに無い

DELETE {STORE_SERVER_URL}/apps/{packageName}          // Settings でアプリを削除したとき
Headers: X-Store-Token: {STORE_TOKEN}
200: { "packageName", "removed": <消したファイル数> }   // 無くても 200

PUT {STORE_SERVER_URL}/store-app                       // android/publish-store-app.sh が呼ぶ
Headers: X-Store-Token: {STORE_TOKEN}
Body: ストアアプリ (dev.apslop.store) の APK そのもの
200: { "packageName", "versionName", "versionCode", "apkName", "apkUrl" }   400: 他のパッケージ

GET {STORE_SERVER_URL}/healthz  -> {"ok": true}
```

store-server は GitHub の Release アセットを `GITHUB_ADMIN_TOKEN` で取得する(private repo でも可)。
アセット名は `*.apk` を対象とし、`*-unsigned.apk` / 未署名 APK は `apksigner` で署名する。
署名鍵は `/data/keys/<packageName>.jks` に無ければ `keytool` で生成する(パスワードは `STORE_KEY_PASSWORD`)。
ストアに表示する名前は APK の `android:label`(`app_name`)、概要は GitHub リポジトリの description、
説明はタグ時点の `README.md`(Markdown。無ければ description)、作者 (`AuthorName`) は `/sync` の `author`。
Release のリリースノートは使わない。

### store-server が配信するもの

- `GET /fdroid/repo/index-v2.json`, `index-v1.json`, `entry.json`, `index.jar`(fdroidserver 生成物)
- `GET /fdroid/repo/<apkName>`, `/fdroid/repo/icons*/…`
- リポジトリの署名用鍵は `/data/fdroid/keystore.p12`(初回 `fdroid update` 前に `fdroid init` 相当で生成)

Android クライアントは `index-v2.json` のみ読む。

### GitHub Actions (テンプレ)

- `.github/workflows/release.yml`: `on: push: tags: ['v*']`。JDK 17 + Gradle で `./gradlew assembleRelease`。
  成果物 `app/build/outputs/apk/release/app-release-unsigned.apk` を `softprops/action-gh-release` で Release に添付。
- テンプレの `app/build.gradle.kts` は `signingConfig` を持たず未署名でビルドする。

### AI 生成の出力スキーマ (web 内部)

```ts
type GeneratedApp = {
  name: string;          // 表示名
  slug: string;          // リポジトリ名 (a-z0-9-)
  packageName: string;   // "dev.apslop.apps.<slug の _ 版>"
  summary: string;       // 80 文字以内
  description: string;   // Markdown
  files: { path: string; content: string }[]; // 雛形からの差分ではなく完全なファイル一式
};
```

## データモデル (web / Prisma / SQLite)

```
User        id, githubId (unique), login, name, avatarUrl, email, createdAt
App         id, slug (unique), repoFullName (unique), name, summary, description,
            platform (ANDROID|WEB), packageName?, webUrl?, iconUrl?,
            status (DRAFT|PUBLISHED|FAILED), latestVersion?, latestVersionCode?,
            ownerId -> User, createdAt, updatedAt, publishedAt?
Generation  id, userId -> User, kind (CREATE|MODIFY), prompt, model, status,
            repoFullName?, prNumber?, error?, createdAt, finishedAt?,
            buildStatus? (BUILDING|FIXING|PASSED|FAILED), buildBranch?, buildRounds, buildRunUrl?
```

## 環境変数

web と store-server は docker compose から同じ設定を読む。非秘密は `.env`、秘密は `.env.secrets`
(compose では optional。ローカルでは `~/.secrets/apslop.env` への symlink)に置く。どちらも git 管理外。

### `.env` (非秘密)

| 変数 | 既定 / 例 | 用途 |
|---|---|---|
| `GITHUB_ORG` | `AP-Slop` | 全リポジトリを置く Organization |
| `GITHUB_CLIENT_ID` | `Iv1.xxx` | 利用者ログイン用 OAuth App |
| `AUTH_URL` | `http://localhost:3000` | Auth.js のベース URL |
| `AUTH_TRUST_HOST` | 本番で `true` | ホスト名をリクエストから取る (Workers では必須) |
| `ANTHROPIC_MODEL` | `claude-opus-5` | アプリ生成に使うモデル |
| `DEEPSEEK_MODEL` | `deepseek-flash` | 「Create PR with AI」で使う DeepSeek のモデル (DeepSeek-V4.1-Flash-1017 は `deepseek-flash` で呼ぶ) |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com/anthropic` | DeepSeek の Anthropic 互換エンドポイント |
| `DATABASE_URL` | `file:./data/apslop.db` | web の SQLite |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | ブラウザから見える web の URL |
| `NEXT_PUBLIC_STORE_URL` | `http://localhost:8080` | 同じくストアの URL |
| `NEXT_PUBLIC_SITE_NAME` | `APSlop` | 大学名など表示用 |
| `NEXT_PUBLIC_STORE_APP_URL` | (空) | ストアアプリ (APK) の配布 URL。空ならストアに載せたストアアプリ (`dev.apslop.store`) を指し、それも無ければ "Download the store app" ボタンを出さない |
| `STORE_SERVER_URL` | `http://store-server:8080` | web → store-server の内部 URL (compose 内) |
| `STORE_PORT` | `8080` | ホスト側に公開するポート |
| `STORE_PUBLIC_URL` | `http://localhost:8080` | F-Droid index に埋め込む公開 URL |
| `STORE_REPO_NAME` / `STORE_REPO_DESCRIPTION` | — | ストアの表示名と説明 |

### `.env.secrets` (秘密)

| 変数 | 用途 |
|---|---|
| `GITHUB_ADMIN_TOKEN` | Org 管理権限の fine-grained PAT (Administration / Contents / Members / Webhooks RW) |
| `GITHUB_CLIENT_SECRET` | OAuth App の secret |
| `GITHUB_WEBHOOK_SECRET` | Org webhook の署名検証 |
| `AUTH_SECRET` | Auth.js の署名鍵 (`openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | アプリ生成と「Create PR with AI」(Claude) |
| `DEEPSEEK_API_KEY` | 任意。「Create PR with AI」で DeepSeek を選べるようにする。無ければ選択肢は「not set up」で選べない |
| `STORE_TOKEN` | web ↔ store-server の共有トークン |
| `STORE_KEY_PASSWORD` | APK 署名鍵 / リポジトリ鍵のパスワード (6 文字以上) |

本番 (Cloudflare) の設定は `web/wrangler.jsonc` の `vars` と Worker の secret に置く
([DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md))。
store-server にはこのほか `STORE_DATA_DIR` / `GITHUB_API_URL` / `STORE_REPO_KEYALIAS` /
`STORE_KEY_DNAME` / `STORE_DRY_RUN` / `STORE_APP_SOURCE_URL`(ストアアプリの掲載ページのソースのリンク)があり、既定値は `store-server/app/config.py` を参照。

## ローカル起動

```
# .env と .env.secrets を用意してから
docker compose up --build
# web:   http://localhost:3000
# store: http://localhost:8080  (fdroid repo: http://localhost:8080/fdroid/repo)
```
