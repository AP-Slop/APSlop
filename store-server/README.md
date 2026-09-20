# store-server

F-Droid 互換のアプリリポジトリを生成・配信するサービス。`web/` から呼ばれ、GitHub Release の APK を取り込んで
署名し、`fdroid update` で `index-v2.json` を生成する。契約は [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)。

## 仕組み

```
POST /sync {repo, tag?}
  1. GitHub API で Release とアセット(*.apk)を取得 (GITHUB_ADMIN_TOKEN)
  2. androguard で packageName / versionCode / versionName / app_name (android:label) を読む
  3. apksigner verify で署名確認。未署名なら /data/keys/<pkg>.jks で署名 (無ければ keytool で生成)
  4. metadata/<pkg>.yml を書く: Name = APK の app_name、Summary = repo の description、
     Description = タグ時点の README.md (無ければ description)、SourceCode = repo URL
  5. repo/<pkg>_<versionCode>.apk に配置して fdroid update --create-metadata
GET  /apps                    index-v2.json を平坦化した一覧
GET  /fdroid/repo/…           F-Droid クライアントが読む静的ファイル (index-v2.json, APK, icons)
GET  /fdroid/archive/…        古いバージョン (archive_older: 3)
GET  /healthz
```

`fdroid update` と `/sync` は `threading.Lock` で直列化される。

## エンドポイント認証

`POST /sync` は `X-Store-Token` ヘッダが `STORE_TOKEN` と一致する必要がある。それ以外は公開。

## データ (`/data` ボリューム)

| パス | 内容 |
|---|---|
| `/data/fdroid/config.yml` | fdroidserver 設定 (初回起動時に env から生成。以後は変更しない) |
| `/data/fdroid/keystore.p12` | **リポジトリ署名鍵**。失うとクライアント側で別リポジトリ扱いになる |
| `/data/keys/<pkg>.jks` | **アプリごとの APK 署名鍵**。失うとそのアプリは更新不能 (再インストールが必要) |
| `/data/fdroid/repo/` | 配信されるリポジトリ本体 |
| `/data/fdroid/metadata/` | アプリのメタデータ YAML |
| `/data/incoming/` | 取り込み中の一時ファイル |

**`/data/fdroid/keystore.p12` と `/data/keys/` は必ずバックアップすること。** 鍵のパスワードは `STORE_KEY_PASSWORD`。
config.yml と keystore は `/fdroid/` 配下に公開されない (`repo/` と `archive/` だけをマウントしている)。

## 公式 F-Droid クライアントに登録する

1. F-Droid アプリ → 設定 → リポジトリ → 「+」
2. `https://<STORE_PUBLIC_URL>/fdroid/repo` を入力
3. フィンガープリントは `index-v2.json` 署名鍵のもの。取得方法:
   `keytool -list -keystore /data/fdroid/keystore.p12 -storepass "$STORE_KEY_PASSWORD" -alias apslop -v | grep SHA256`
   (`https://<host>/fdroid/repo?fingerprint=<SHA256 をコロン抜き大文字>` の形で共有すると便利)

## ローカル開発

```sh
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
STORE_DRY_RUN=1 STORE_TOKEN=dev STORE_DATA_DIR=./data .venv/bin/uvicorn app.main:app --port 8080
.venv/bin/pytest
```

`STORE_DRY_RUN=1` は fdroid / keytool を呼ばない (index は生成されない)。実際の取り込みは Docker イメージで行う:

```sh
docker compose up --build store-server
curl -X POST localhost:8080/sync -H "X-Store-Token: $STORE_TOKEN" \
     -H 'Content-Type: application/json' -d '{"repo":"my-univ-apps/todo","tag":"v0.1.0"}'
```

## 環境変数

`STORE_TOKEN`, `GITHUB_ADMIN_TOKEN`, `STORE_PUBLIC_URL`, `STORE_REPO_NAME`, `STORE_REPO_DESCRIPTION`,
`STORE_KEY_PASSWORD`, 任意: `STORE_DATA_DIR` (既定 `/data`), `STORE_REPO_KEYALIAS` (`apslop`),
`STORE_KEY_DNAME`, `STORE_DRY_RUN`.

## androguard のバージョン固定

fdroidserver 公式イメージ同梱の androguard 3.4 は AGP 8 系がビルドした `resources.arsc` を解析できず(`res1 must be zero`)、4.1.3 以降は署名ブロック解析で落ちる。そのため `requirements.txt` で **androguard 4.1.2** に固定している。上げる場合は雛形 APK で `POST /sync` 相当の流れが通ることを確認すること。

## イメージ構成 (amd64 / arm64 共通)

fdroidserver の公式 Docker イメージは amd64 専用のため使わず、`python:3.12-slim-bookworm` に
Debian パッケージ (`default-jdk-headless`, `apksigner`, `zipalign`, `aapt`) と PyPI の
`fdroidserver` / `androguard==4.1.2` を入れて構成している。同じ Dockerfile が Oracle Cloud の
Ampere A1 (arm64) でもビルドできる。ローカル (amd64) では雛形 APK の署名から index 生成まで検証済み。
