# web — APSlop Web アプリ

Next.js 16 (App Router) / Auth.js v5 (GitHub OAuth) / Octokit / Anthropic SDK / Prisma 7 + SQLite (libsql adapter) / Tailwind v4。

## 機能

| パス | 内容 |
|---|---|
| `/` | 公開中アプリのカタログ、F-Droid リポジトリの案内 |
| `/apps/[slug]` | アプリ詳細 (説明 Markdown、APK ダウンロード、ストア同期) |
| `/new` | AI でアプリ生成 → プレビュー → Org にリポジトリ作成 |
| `/repos` | Org のリポジトリ一覧 (検索) |
| `/repos/[name]` | README + ファイルツリー (`tree/…`, `blob/…`) |
| `/repos/[name]/pulls`, `pulls/[n]` | PR 一覧、差分表示、コメント / 承認 / 変更要求 / Squash マージ |
| `/repos/[name]/issues` | Issue 一覧 + 作成 |
| `/repos/[name]/ai` | AI に変更を依頼 → ブランチ + PR を利用者名義で作成 |
| `/repos/[name]/releases` | Release 一覧、CI 実行状況、タグ付きリリース作成、ストア同期 |
| `/dashboard` | 自分のアプリと AI 生成履歴 |

API: `POST /api/generate`, `POST /api/apps`, `POST /api/apps/[slug]/sync`, `POST /api/repos/[name]/propose`,
`POST /api/repos/[name]/pulls/[n]/{merge,review}`, `POST /api/repos/[name]/releases`, `POST /api/repos/[name]/issues`,
`POST /api/webhooks/github` (HMAC 検証、`release` イベントでストア同期)。

## セットアップ

```sh
# リポジトリルートに .env / .env.secrets を用意 (変数一覧は ../docs/ARCHITECTURE.md)
npm install                  # postinstall で prisma generate が走る
npm run sync-template        # ../templates/android-compose-app を ./template にコピー
npm run db:push              # SQLite にスキーマを反映 (DATABASE_URL)
npm run dev
```

ローカルで `next dev` するときは `.env` をこのディレクトリにも置くか、`DATABASE_URL` などを環境変数で渡す。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | `prisma generate` + `next build` (standalone 出力) |
| `npm run lint` / `npm run typecheck` | ESLint / tsc |
| `npm run db:push` | Prisma スキーマを DB に反映 |
| `npm run sync-template` | Android テンプレートを `./template` に同期 (Docker ビルド前に必須) |

## Docker

`docker compose up --build` (リポジトリルート)。コンテナ起動時に `prisma db push` を実行してから `node server.js` を起動する。
`/app/data` に SQLite、`/app/template` にアプリ雛形を置く。

## 構成

```
src/lib/
  env.ts       環境変数 (zod, 遅延検証)
  db.ts        PrismaClient (libsql adapter)
  auth.ts      Auth.js 設定。JWT に GitHub access token を保持、初回ログインで User upsert + Org 招待
  github.ts    Octokit ラッパー (admin / user トークン、Git Data API による一括コミット、PR/Issue/Release)
  ai.ts        Claude による生成 (structured outputs, streaming)
  template.ts  テンプレート読み込み・マージ
  store.ts     store-server との連携 (/sync, /apps)
  api.ts       Route Handler 用のエラーハンドリング
src/app/       ページと API ルート
src/components/ UI 部品 (Header, Diff, フォーム類)
prisma/        スキーマ
```
