# OpenAP Store (Android クライアント)

大学コミュニティ向けアプリストアの Android クライアント。
`store-server` が生成する **F-Droid 互換リポジトリ (index-v2)** を読み、アプリの一覧・詳細・インストール・更新を行う。

- パッケージ名: `dev.openap.store`
- Kotlin 2.2 / Jetpack Compose (Material 3) / minSdk 26 / targetSdk 35
- 依存: navigation-compose, lifecycle-viewmodel-compose, kotlinx-serialization, OkHttp, Coil, DataStore

## ビルド

```sh
cd android
./gradlew :app:assembleDebug          # app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:testDebugUnitTest      # JVM ユニットテスト
```

- Android SDK (platform 35 / build-tools 35) と JDK 17 以上が必要。`ANDROID_HOME` か `local.properties` の `sdk.dir` で SDK を指定する。
- Gradle 9.1 / AGP 8.13 (wrapper 同梱)。AGP 8.x は Gradle 9.6 以降では動かないため、必ず `./gradlew` を使うこと。
- リリースビルドは `assembleRelease`(署名設定は未定義。配布時は `signingConfigs` を追加するか、`store-server` に署名させる)。

## ストアの向き先

既定のリポジトリ URL はビルド時に埋め込まれる (`BuildConfig.DEFAULT_REPO_URL`)。
`gradle.properties` の `openap.repoUrl`、または `-P` で上書きする。

```sh
./gradlew :app:assembleDebug -Popenap.repoUrl=https://apps.example.ac.jp/fdroid/repo
```

既定値 `http://10.0.2.2:8080/fdroid/repo` はエミュレータからホストの `docker compose up` (store-server: 8080) を指す。
実行時には「設定」画面で URL を変更でき、DataStore に保存される。

同じ URL を公式 F-Droid クライアントに「リポジトリを追加」しても利用できる。

## F-Droid index の読み方

1. `{repoUrl}/index-v2.json` を OkHttp で取得。
2. `data/IndexModels.kt` の `@Serializable` モデルで必要な部分だけをデコード (`ignoreUnknownKeys = true`)。
   - `repo.name / description / icon`
   - `packages.<pkg>.metadata.{name, summary, description, icon, sourceCode, webSite, license, added, lastUpdated}`
   - `packages.<pkg>.versions.<sha>.{file{name,sha256,size}, manifest{versionName, versionCode, usesSdk.minSdkVersion}, added}`
   - ローカライズ値 (`{"en-US": "..."}`) は `en-US` を優先し、無ければ最初の値。
3. `IndexParser` が `versionCode` 最大のものを最新版として `StoreApp` / `AppVersion` に変換。
   ファイル名は repo 相対 (`/foo.apk`, `/icons/...`) なので `repoUrl` と結合して絶対 URL にする。
4. インストール状態は `PackageManager.getPackageInfo` の `longVersionCode` と比較して
   「インストール / 更新 / 開く」を出し分ける。

## インストールの流れ

1. `packageManager.canRequestPackageInstalls()` が false なら
   `Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES` へ誘導(不明なアプリのインストール許可)。
2. APK を `cacheDir/apks/` にダウンロードし、index の `sha256` と照合。
3. `PackageInstaller` セッション API で書き込み・commit。
   結果は `InstallReceiver` (BroadcastReceiver) が受け取り、
   `STATUS_PENDING_USER_ACTION` ならシステムの確認画面を起動、成功/失敗は `InstallEvents` 経由で画面に通知。

## 平文 HTTP について

`res/xml/network_security_config.xml` で cleartext (http://) を許可している。
これはローカル開発用 (`http://10.0.2.2:8080`) のため。本番では https のリポジトリを使い、
`cleartextTrafficPermitted="false"` にすること。

## 構成

```
app/src/main/java/dev/openap/store/
  StoreApplication.kt      依存の生成 (Settings / Repository / Installer)
  MainActivity.kt
  data/IndexModels.kt      index-v2 のモデル + ドメインモデル
  data/IndexParser.kt      index-v2 → StoreIndex 変換 (純 Kotlin)
  data/StoreRepository.kt  index の取得・保持、インストール状態
  data/Downloader.kt       APK ダウンロード + SHA-256 検証
  data/SettingsStore.kt    DataStore (リポジトリ URL)
  install/AppInstaller.kt  PackageInstaller セッション
  install/InstallReceiver.kt / InstallEvents.kt
  viewmodel/               AppListViewModel, AppDetailViewModel
  ui/                      AppListScreen, AppDetailScreen, SettingsScreen, Navigation, theme
app/src/test/              IndexParserTest (fixture: resources/index-v2.json)
```
