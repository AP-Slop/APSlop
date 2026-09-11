# Template App

APSlop で AI が生成するアプリの雛形です。Kotlin + Jetpack Compose (Material3) の最小構成で、
タグを push すると GitHub Actions が **未署名の release APK** をビルドして Release に添付します。
署名は APSlop ストアが取り込み時に行うため、このリポジトリに鍵は不要です。

## 構成

```
settings.gradle.kts / build.gradle.kts / gradle.properties   Gradle 設定 (通常触らない)
gradle/libs.versions.toml                                   依存バージョン一覧
app/build.gradle.kts                                         applicationId / namespace / 依存
app/src/main/AndroidManifest.xml                             権限・Activity
app/src/main/java/dev/apslop/apps/template/MainActivity.kt   画面 (Compose)
app/src/main/java/dev/apslop/apps/template/ui/Theme.kt       配色
app/src/main/res/values/strings.xml                          表示文字列 (app_name など)
app/src/main/res/drawable/ic_launcher_*.xml                  アイコン (ベクター)
.github/workflows/ci.yml                                     PR / main の自動ビルド
.github/workflows/release.yml                                タグ push → APK を Release に添付
```

## ローカルで動かす

```sh
./gradlew assembleDebug            # app/build/outputs/apk/debug/app-debug.apk
./gradlew installDebug             # 接続した端末にインストール
./gradlew testDebugUnitTest
```

Android Studio で開く場合はルートディレクトリを開くだけで動きます。

## リリースする

```sh
git tag v0.2.0
git push origin v0.2.0
```

`v<major>.<minor>.<patch>` 形式のタグを push すると `release.yml` が動き、
`versionName = 0.2.0`, `versionCode = major*10000 + minor*100 + patch` (= 200) で
`<applicationId>-0.2.0-unsigned.apk` を Release に添付します。
APSlop はその Release を検知して署名し、ストアに並べます。

バージョンはローカルでは `gradle.properties` の `VERSION_NAME` / `VERSION_CODE`、
CI では環境変数 `APSLOP_VERSION_NAME` / `APSLOP_VERSION_CODE` で決まります。

## AI 向けメモ

主に編集するファイル:

- `app/src/main/java/dev/apslop/apps/<slug>/MainActivity.kt` (画面。必要なら同じパッケージに Kotlin ファイルを追加)
- `app/src/main/res/values/strings.xml` (`app_name` と表示文字列)
- `app/build.gradle.kts` の `namespace` と `applicationId` (`dev.apslop.apps.<slug>`) と依存追加
- `app/src/main/AndroidManifest.xml` (権限が必要なときだけ)
- `README.md`

壊してはいけないもの:

- `.github/workflows/*.yml`、`gradlew*`、`gradle/wrapper/*`、`settings.gradle.kts`、ルートの `build.gradle.kts`
- `release` buildType に `signingConfig` を追加しない
- `versionCode` / `versionName` を固定値に書き換えない (CI が上書きできなくなる)

詳細な制約は `TEMPLATE_RULES.md` を参照。
