plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

// Version comes from gradle.properties, overridable by CI through environment variables.
val appVersionCode: Int =
    (System.getenv("OPENAP_VERSION_CODE") ?: project.findProperty("VERSION_CODE")?.toString() ?: "1").toInt()
val appVersionName: String =
    System.getenv("OPENAP_VERSION_NAME") ?: project.findProperty("VERSION_NAME")?.toString() ?: "0.1.0"

android {
    // AI: change both `namespace` and `applicationId` to dev.openap.apps.<your_slug>
    namespace = "dev.openap.apps.template"
    compileSdk = 35

    defaultConfig {
        applicationId = "dev.openap.apps.template"
        minSdk = 26
        targetSdk = 35
        versionCode = appVersionCode
        versionName = appVersionName
    }

    buildTypes {
        release {
            // Intentionally NO signingConfig: the OpenAP store signs the APK on ingest.
            isMinifyEnabled = false
            isShrinkResources = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    testImplementation(libs.junit)
    debugImplementation(libs.androidx.ui.tooling)
}
