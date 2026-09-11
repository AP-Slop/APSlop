# OpenAP Android template rules

You generate a complete Android app based on the OpenAP template. Output the FULL content of every
file you change or add; files you do not output are kept exactly as in the template.

## Package / naming

- Slug is lowercase `a-z0-9-` (e.g. `campus-timetable`). Repository name = slug.
- Package name = `dev.openap.apps.<slug with "-" replaced by "_">` (e.g. `dev.openap.apps.campus_timetable`).
- In `app/build.gradle.kts` set BOTH `namespace` and `applicationId` to that package name.
- Kotlin sources live under `app/src/main/java/dev/openap/apps/<slug_underscored>/`.
  Do not leave sources under `dev/openap/apps/template/` — move `MainActivity.kt` and `ui/Theme.kt`
  to the new package (output them at their new paths; the template versions are deleted).
- `app/src/main/res/values/strings.xml` must define `app_name` (the display name).
- `settings.gradle.kts`: set `rootProject.name` to the display name (optional).

## Files in the template (paths relative to repository root)

```
.gitignore
.github/workflows/ci.yml            (do not modify)
.github/workflows/release.yml       (do not modify)
README.md                           (rewrite for the app)
TEMPLATE_RULES.md                   (may be deleted or kept)
build.gradle.kts                    (do not modify)
settings.gradle.kts
gradle.properties                   (do not modify VERSION_* keys)
gradlew, gradlew.bat                (do not modify)
gradle/wrapper/gradle-wrapper.jar   (binary, do not modify)
gradle/wrapper/gradle-wrapper.properties (do not modify)
gradle/libs.versions.toml           (add libraries here when needed)
app/build.gradle.kts
app/proguard-rules.pro
app/src/main/AndroidManifest.xml
app/src/main/java/dev/openap/apps/template/MainActivity.kt
app/src/main/java/dev/openap/apps/template/ui/Theme.kt
app/src/main/res/values/strings.xml
app/src/main/res/values/colors.xml
app/src/main/res/values/themes.xml
app/src/main/res/drawable/ic_launcher_background.xml
app/src/main/res/drawable/ic_launcher_foreground.xml
app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
app/src/test/java/dev/openap/apps/template/ExampleUnitTest.kt
```

## Build constraints

- Toolchain: AGP 8.7.3, Kotlin 2.0.21 with `org.jetbrains.kotlin.plugin.compose`, Gradle 8.10.2,
  JDK 17, minSdk 26, compileSdk = targetSdk = 35, Compose BOM 2024.12.01, Material3.
- Keep `versionCode` / `versionName` reading from `appVersionCode` / `appVersionName` exactly as in
  the template (env `OPENAP_VERSION_*` → gradle property → default). Never hardcode them.
- The `release` buildType must have NO `signingConfig` and minify disabled. CI produces
  `app/build/outputs/apk/release/app-release-unsigned.apk`; the store signs it.
- Use plugin aliases from the version catalog (`alias(libs.plugins....)`). When adding a library,
  add it to `gradle/libs.versions.toml` and reference it with `libs.xxx`; prefer well-known
  AndroidX / Kotlin libraries with stable versions. No Hilt/KSP/Room unless the app truly needs
  persistence (then prefer DataStore Preferences or plain files).
- UI is Jetpack Compose + Material3 only. No XML layouts, no AppCompat, no Fragments.
- Do not request permissions unless the feature needs them. Add `INTERNET` only when the app
  performs network requests. Never request location, contacts, SMS, or camera without a clear need.
- No secrets, API keys, or hardcoded credentials in source.
- Every Kotlin file must compile: correct package line, all imports present, no unresolved symbols.
  Keep state with `remember` / `rememberSaveable` / `ViewModel` (lifecycle-viewmodel-compose).
- Keep the single-Activity structure (`MainActivity` declared in the manifest with
  `android:exported="true"` and the LAUNCHER intent filter).
- Keep the launcher icon resources: the adaptive XML in `mipmap-anydpi-v26` AND the PNGs in
  `mipmap-{m,h,xh,xxh,xxxh}dpi` (the store extracts its icon from those PNGs). You may change
  the vector paths/colors; if you replace the PNGs, keep the same file names and sizes.
- Keep `android.enableResourceOptimizations=false` in `gradle.properties`: the store reads
  icons by resource path and shortened paths break it.
- Unit tests under `app/src/test/...` must pass with `./gradlew testDebugUnitTest`.
- Write the README in Japanese describing the app, features, and how to build.
