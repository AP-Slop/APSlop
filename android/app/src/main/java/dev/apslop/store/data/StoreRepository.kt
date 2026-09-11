package dev.apslop.store.data

import android.content.Context
import android.content.pm.PackageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Installed-state of a store app on this device. */
sealed interface InstallState {
    data object NotInstalled : InstallState
    data class Installed(val versionName: String, val versionCode: Long) : InstallState {
        fun isOlderThan(latest: AppVersion): Boolean = versionCode < latest.versionCode
    }
}

/**
 * Single source of truth for the store index. Holds the last successfully
 * fetched index in memory and exposes it as a StateFlow.
 */
class StoreRepository(
    private val context: Context,
    private val settings: SettingsStore,
    val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build(),
) {
    private val _index = MutableStateFlow<StoreIndex?>(null)
    val index: StateFlow<StoreIndex?> = _index.asStateFlow()

    val downloader: Downloader = Downloader(httpClient, context.cacheDir)

    val settingsStore: SettingsStore get() = settings

    /** Fetches `index-v2.json` from the configured repository and updates [index]. */
    suspend fun refresh(): StoreIndex = withContext(Dispatchers.IO) {
        val repoUrl = settings.currentRepoUrl().trimEnd('/')
        val request = Request.Builder().url("$repoUrl/index-v2.json").build()
        val body = httpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw IOException("HTTP ${response.code}")
            response.body?.string() ?: throw IOException("Empty response")
        }
        val parsed = IndexParser.parse(body, repoUrl)
        _index.value = parsed
        parsed
    }

    fun app(packageName: String): StoreApp? = _index.value?.apps?.firstOrNull { it.packageName == packageName }

    fun installState(packageName: String): InstallState = try {
        val info = context.packageManager.getPackageInfo(packageName, 0)
        InstallState.Installed(
            versionName = info.versionName ?: "",
            versionCode = info.longVersionCode,
        )
    } catch (_: PackageManager.NameNotFoundException) {
        InstallState.NotInstalled
    }
}
