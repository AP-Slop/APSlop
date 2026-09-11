package dev.apslop.store.data

import kotlinx.serialization.Serializable

/*
 * Minimal model of the F-Droid index-v2 format.
 * Only the fields the store needs are declared; everything else is ignored
 * (the Json instance is created with ignoreUnknownKeys = true).
 *
 * Localized values in index-v2 are maps keyed by locale, e.g. {"en-US": "Name"}.
 */

typealias Localized = Map<String, String>
typealias LocalizedFile = Map<String, FileV2>

@Serializable
data class IndexV2(
    val repo: RepoV2 = RepoV2(),
    val packages: Map<String, PackageV2> = emptyMap(),
)

@Serializable
data class RepoV2(
    val name: Localized = emptyMap(),
    val description: Localized = emptyMap(),
    val icon: LocalizedFile = emptyMap(),
    val address: String? = null,
    val timestamp: Long = 0,
)

@Serializable
data class FileV2(
    val name: String,
    val sha256: String? = null,
    val size: Long? = null,
)

@Serializable
data class PackageV2(
    val metadata: MetadataV2 = MetadataV2(),
    val versions: Map<String, VersionV2> = emptyMap(),
)

@Serializable
data class MetadataV2(
    val name: Localized = emptyMap(),
    val summary: Localized = emptyMap(),
    val description: Localized = emptyMap(),
    val icon: LocalizedFile = emptyMap(),
    val sourceCode: String? = null,
    val webSite: String? = null,
    val license: String? = null,
    val added: Long = 0,
    val lastUpdated: Long = 0,
)

@Serializable
data class VersionV2(
    val added: Long = 0,
    val file: FileV2,
    val manifest: ManifestV2 = ManifestV2(),
)

@Serializable
data class ManifestV2(
    val versionName: String = "",
    val versionCode: Long = 0,
    val usesSdk: UsesSdkV2? = null,
)

@Serializable
data class UsesSdkV2(
    val minSdkVersion: Int = 0,
    val targetSdkVersion: Int = 0,
)

/* ---- Domain model used by the UI ---- */

data class StoreIndex(
    val repoName: String,
    val repoDescription: String,
    val repoIconUrl: String?,
    val apps: List<StoreApp>,
)

data class StoreApp(
    val packageName: String,
    val name: String,
    val summary: String,
    val description: String,
    val iconUrl: String?,
    val sourceCode: String?,
    val webSite: String?,
    val license: String?,
    val added: Long,
    val lastUpdated: Long,
    val latest: AppVersion,
)

data class AppVersion(
    val versionName: String,
    val versionCode: Long,
    val apkUrl: String,
    val apkFileName: String,
    val sha256: String?,
    val size: Long?,
    val minSdk: Int?,
    val added: Long,
)
