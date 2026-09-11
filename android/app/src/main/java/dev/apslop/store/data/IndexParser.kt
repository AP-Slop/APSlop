package dev.apslop.store.data

import kotlinx.serialization.json.Json

/**
 * Parses an F-Droid `index-v2.json` document into the store's domain model.
 * Pure Kotlin/JVM so it can be unit-tested without Android.
 */
object IndexParser {

    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    private const val DEFAULT_LOCALE = "en-US"

    fun parse(indexJson: String, repoUrl: String): StoreIndex {
        val index = json.decodeFromString(IndexV2.serializer(), indexJson)
        return toDomain(index, repoUrl)
    }

    fun toDomain(index: IndexV2, repoUrl: String): StoreIndex {
        val base = repoUrl.trimEnd('/')
        val apps = index.packages.mapNotNull { (pkg, p) ->
            val latestEntry = p.versions.values.maxByOrNull { it.manifest.versionCode } ?: return@mapNotNull null
            val m = p.metadata
            StoreApp(
                packageName = pkg,
                name = m.name.localized() ?: pkg,
                summary = m.summary.localized().orEmpty(),
                description = m.description.localized().orEmpty(),
                iconUrl = m.icon.localizedFile()?.let { join(base, it.name) },
                sourceCode = m.sourceCode?.takeIf { it.isNotBlank() },
                webSite = m.webSite?.takeIf { it.isNotBlank() },
                license = m.license,
                added = m.added,
                lastUpdated = m.lastUpdated,
                latest = AppVersion(
                    versionName = latestEntry.manifest.versionName,
                    versionCode = latestEntry.manifest.versionCode,
                    apkUrl = join(base, latestEntry.file.name),
                    apkFileName = latestEntry.file.name.substringAfterLast('/'),
                    sha256 = latestEntry.file.sha256,
                    size = latestEntry.file.size,
                    minSdk = latestEntry.manifest.usesSdk?.minSdkVersion?.takeIf { it > 0 },
                    added = latestEntry.added,
                ),
            )
        }.sortedByDescending { it.lastUpdated }

        return StoreIndex(
            repoName = index.repo.name.localized().orEmpty(),
            repoDescription = index.repo.description.localized().orEmpty(),
            repoIconUrl = index.repo.icon.localizedFile()?.let { join(base, it.name) },
            apps = apps,
        )
    }

    /** Pick the en-US value, else the first available locale. */
    fun Localized.localized(): String? =
        this[DEFAULT_LOCALE]?.takeIf { it.isNotBlank() }
            ?: values.firstOrNull { it.isNotBlank() }

    fun LocalizedFile.localizedFile(): FileV2? = this[DEFAULT_LOCALE] ?: values.firstOrNull()

    /** index-v2 file names are repo-relative and start with "/". */
    fun join(base: String, name: String): String =
        if (name.startsWith("http://") || name.startsWith("https://")) name
        else base + "/" + name.trimStart('/')
}
