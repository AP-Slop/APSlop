# Cloudflare へのデプロイ

web とストアを Cloudflare Workers の 1 つの Worker (`apslop-web`) で動かす。設定は [`web/wrangler.jsonc`](../web/wrangler.jsonc)、
入口は [`web/cloudflare/worker.ts`](../web/cloudflare/worker.ts)。Workers Paid プラン ($5/月) が要る。

```
https://apslop-web.<subdomain>.workers.dev
  /fdroid/repo/…, /fdroid/archive/…  → R2 (apslop-store) をそのまま返す。コンテナは起こさない
  /_store/store-app (PUT)            → ストアのコンテナ (android/publish-store-app.sh 用)
  それ以外                             → Next.js (OpenNext)。DB は D1、裏の仕事は Queue (apslop-jobs)

ストアのコンテナ (StoreContainer, standard-1, 1 台)
  store-server/ の Docker イメージそのもの。最後の要求から 5 分で止まり、次の要求で起きる
  起動時に R2 から /data を復元し、fdroid update のたびに変わったファイルを R2 に書き戻す (store-server/app/mirror.py)
  R2 には Worker の内部ホスト store-files.internal 経由で触る (X-Store-Token)。署名鍵は上書き・削除できない
```

web はストアの一覧を R2 の `apps.json`(fdroid update のたびにコンテナが書く)から読むので、ページ表示でコンテナは起きない。
コンテナが起きるのは取り込み (`/sync`)・一言の変更・削除・ストアアプリの掲載のときだけ。

## 初回の準備

1. ダッシュボードで R2 を有効にする(API からは有効にできない)
2. リソースを作る

   ```sh
   cd web
   npx wrangler d1 create apslop          # 出た database_id を wrangler.jsonc に書く
   npx wrangler d1 migrations apply apslop --remote
   npx wrangler queues create apslop-jobs
   npx wrangler r2 bucket create apslop-store
   ```

3. GitHub OAuth App を workers.dev の URL で作る(callback は `<URL>/api/auth/callback/github`)
4. secret を入れる(`npx wrangler secret bulk <file>`、ファイルは使ったら消す)

   | 名前 | 中身 |
   |---|---|
   | `GITHUB_ADMIN_TOKEN` | Org 管理の fine-grained PAT(docker と同じもの) |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | 3 の OAuth App |
   | `GITHUB_WEBHOOK_SECRET` | Org webhook の secret |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `ANTHROPIC_API_KEY` / `DEEPSEEK_API_KEY` | AI |
   | `STORE_TOKEN` | Worker とコンテナの間の合言葉。`openssl rand -hex 32` |
   | `STORE_KEY_PASSWORD` | 署名鍵のパスワード。**既存のストアを移すなら、その鍵と同じ値** |

5. Org の webhook の Payload URL を `<URL>/api/webhooks/github` に向ける([SETUP_GITHUB.md](SETUP_GITHUB.md) の 4)

## デプロイ

```sh
cd web
npm run cf:deploy     # OpenNext でビルド → wrangler deploy。ストアのイメージも docker でビルドして送る
```

ストアのイメージのビルドに docker が要る(linux/amd64)。

## docker のストアから移す

鍵とリポジトリを R2 に入れておけば、コンテナは初回起動でそれを復元し、URL が変わったので index を作り直す。
同じ鍵で署名し続けるので、スマホに入っているアプリはそのまま更新できる。

```sh
docker compose cp store-server:/data ./store-data
cd store-data
find . -type f ! -path './fdroid/config.yml' ! -path './incoming/*' | sed 's|^\./||' | while read -r key; do
  npx wrangler r2 object put "apslop-store/$key" --file "$key" --remote
done
```

`STORE_KEY_PASSWORD` は docker のときと同じ値にする。web の DB(D1)は別に移す。

## ストアアプリを載せる

```sh
STORE_TOKEN=… android/publish-store-app.sh --cloudflare https://apslop-web.<subdomain>.workers.dev
```

スマホに入っている版より `versionCode`(`android/app/build.gradle.kts`)を上げてから送る。

## ローカルで試す

`npm run cf:preview` で Worker を手元で動かせる(`.dev.vars` に secret)。ストアのコンテナは手元の docker で動くはずだが、
環境によってはコンテナが起動しない。そのときは store-server のイメージを直接動かして R2 の代わりの API に向ける:

```sh
docker run --network host --add-host store-files.internal:127.0.0.1 \
  -e STORE_MIRROR_URL=http://store-files.internal:8787 -e STORE_TOKEN -e STORE_KEY_PASSWORD -e GITHUB_ADMIN_TOKEN \
  <image> python3 -m uvicorn app.main:app --host 127.0.0.1 --port 18090
```
