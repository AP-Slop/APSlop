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
3. **公開する**: UI から「リリース」→ タグ `vX.Y.Z` を作成。テンプレの GitHub Actions が `assembleRelease`(未署名 APK)をビルドし、Release に添付する。
4. **取り込み**: Release ワークフロー完了の `workflow_run` webhook(APK 添付済み)→ web が `store-server` の `POST /sync` を呼ぶ → store-server が APK をダウンロードし、パッケージごとの鍵で署名して `fdroid update`。`App` の `latestVersion` 等を更新、status=PUBLISHED。
5. **配信**: Android クライアント(または公式 F-Droid クライアント)が `https://<store>/fdroid/repo` を読む。
6. **改良・PR**: 他人のリポジトリに対しても「AI に変更を依頼」→ ブランチ作成 + コミット + PR 作成(利用者トークン)。PR 画面でレビュー・マージ。

## 契約 (コンポーネント間インターフェース)

### web → store-server

```
POST {STORE_SERVER_URL}/sync
Headers: X-Store-Token: {STORE_TOKEN}
Body: { "repo": "org/name", "tag": "v1.2.3" }   // tag 省略時は latest release
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
200: [{ "packageName", "name", "summary", "versionName", "versionCode", "iconUrl", "apkUrl", "added", "lastUpdated" }]

GET {STORE_SERVER_URL}/healthz  -> {"ok": true}
```

store-server は GitHub の Release アセットを `GITHUB_ADMIN_TOKEN` で取得する(private repo でも可)。
アセット名は `*.apk` を対象とし、`*-unsigned.apk` / 未署名 APK は `apksigner` で署名する。
署名鍵は `/data/keys/<packageName>.jks` に無ければ `keytool` で生成する(パスワードは `STORE_KEY_PASSWORD`)。
ストアに表示する名前は APK の `android:label`(`app_name`)、概要は GitHub リポジトリの description、
説明はタグ時点の `README.md`(Markdown。無ければ description)。Release のリリースノートは使わない。

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
            repoFullName?, prNumber?, error?, createdAt, finishedAt?
```

## 環境変数

`.env.example` を参照。web と store-server は同じ `.env` を docker compose から読む。

## ローカル起動

```
cp .env.example .env   # 値を埋める
docker compose up --build
# web:   http://localhost:3000
# store: http://localhost:8080  (fdroid repo: http://localhost:8080/fdroid/repo)
```
