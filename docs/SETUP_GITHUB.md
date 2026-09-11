# GitHub 側のセットアップ手順

APSlop は github.com の Organization をバックエンドにする。運用者が一度だけ行う設定。

## 1. Organization を作る

1. https://github.com/organizations/new で Organization を作成(Free プランで可)。
2. 名前を `.env` の `GITHUB_ORG` に設定する。
3. Settings → Member privileges:
   - **Base permissions**: `Read`(全メンバーが全リポジトリを読める。PR は fork でなくブランチで送りたい場合は `Write`)
   - **Repository creation**: メンバーによる作成を許可しなくてよい(作成はサーバーが行う)
   - **Repository forking**: 許可

## 2. サーバー用トークン (`GITHUB_ADMIN_TOKEN`)

サーバー(web と store-server)が「利用者の代わりではなく、運営として」GitHub を操作するためのトークン。
利用者のログインとは別物で、次の用途にだけ使う。

| 用途 | 呼び出し元 | 必要な権限 |
|---|---|---|
| Org にリポジトリを作成し、作成者を admin コラボレータに追加 | web (`/new`) | Repository: **Administration (RW)** |
| 生成したファイルをコミット、リポジトリ・README・PR 差分の閲覧、Release 一覧と APK の取得 | web / store-server | Repository: **Contents (RW)**, **Metadata (R)** |
| PR 一覧・レビュー・コメントの表示 | web | Repository: **Pull requests (R)** |
| Issue 一覧の表示 | web | Repository: **Issues (R)** |
| Release ワークフローの実行状況の表示 | web (`/releases`) | Repository: **Actions (R)** |
| 初回ログイン時に利用者を Org に招待 | web | Organization: **Members (RW)** |

PR の作成・レビュー・マージ、Issue 作成、リリース作成は**利用者自身の OAuth トークン**で行うので、このトークンには不要。

### 発行手順 (Fine-grained personal access token)

1. Org の **オーナー権限を持つアカウント** で https://github.com/settings/personal-access-tokens/new を開く。
2. **Token name**: `apslop-server` など。**Expiration**: 運用に合わせる(最長 1 年。切れたら再発行して `.env` を差し替える)。
3. **Resource owner**: 自分ではなく **作成した Organization** を選ぶ。
   Org が候補に出ない場合は Org の Settings → Third-party Access → Personal access tokens で
   fine-grained token の利用を許可する(`Allow access via fine-grained personal access tokens`)。
4. **Repository access**: `All repositories`(サーバーが後から作るリポジトリにも自動で効く)。
5. **Repository permissions** を次の通りに設定する:
   - Administration: Read and write
   - Contents: Read and write
   - Metadata: Read-only(自動で付く)
   - Pull requests: Read-only
   - Issues: Read-only
   - Actions: Read-only
6. **Organization permissions**:
   - Members: Read and write
7. Generate token を押し、表示された `github_pat_...` を `.env` の `GITHUB_ADMIN_TOKEN` に貼る。**この画面を閉じると二度と表示されない。**

### 動作確認

```sh
# Org 情報が取れる (Metadata)
curl -s -H "Authorization: Bearer $GITHUB_ADMIN_TOKEN" https://api.github.com/orgs/$GITHUB_ORG | head -5
# メンバー一覧が取れる (Members)
curl -s -H "Authorization: Bearer $GITHUB_ADMIN_TOKEN" https://api.github.com/orgs/$GITHUB_ORG/members | head -5
```

### 注意

- トークンは Org 全体のリポジトリを作成・書き込みできる強い権限を持つ。`.env` は git に入れない(`.gitignore` 済み)。
- 有効期限切れは「リポジトリ作成に失敗しました」「ストアに同期できません」として現れる。期限をカレンダーに入れておく。
- 長期運用では **GitHub App** に置き換えると、トークンが自動更新され、権限も同じ粒度で設定できる。

## 3. OAuth App (利用者ログイン)

Organization の Settings → Developer settings → OAuth Apps → New:

- Homepage URL: `NEXT_PUBLIC_APP_URL`
- Authorization callback URL: `{AUTH_URL}/api/auth/callback/github`

Client ID / Secret を `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` に設定する。
ログイン時に要求する scope は `read:user user:email repo`。

## 4. Webhook

Organization の Settings → Webhooks → Add webhook:

- Payload URL: `{NEXT_PUBLIC_APP_URL}/api/webhooks/github`
- Content type: `application/json`
- Secret: `GITHUB_WEBHOOK_SECRET`
- Events: `Workflow runs`(必須。CI が APK を添付し終えたタイミングでストアに同期する), `Releases`, `Pull requests`, `Pushes`

Release ワークフローの `workflow_run`(completed, success)を受け取ると、web が store-server に同期を依頼し APK がストアに載る。`release` イベントは手動で APK を添付した場合の補助経路。

## 5. GitHub Actions

学生のリポジトリの CI は各リポジトリ内の `.github/workflows/release.yml`(雛形に同梱)で動く。
Organization の Settings → Actions → General で Actions を有効にし、
Workflow permissions を `Read and write`(Release へのアップロードに必要)にする。

## 6. 動作確認

1. `docker compose up --build`
2. http://localhost:3000 で GitHub ログイン → Org への招待メールが届く(承諾)
3. `/new` でアプリを生成 → リポジトリが Org に作られる
4. `/repos/<name>/releases` で `v0.1.0` を作る → Actions が APK をビルドして Release に添付
5. webhook(ローカルなら `gh webhook forward` や ngrok を使う)→ ストアに反映
6. http://localhost:8080/fdroid/repo/index-v2.json に APK が載る
