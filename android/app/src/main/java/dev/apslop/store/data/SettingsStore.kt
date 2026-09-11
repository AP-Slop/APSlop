package dev.apslop.store.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dev.apslop.store.BuildConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

/** Persists user-configurable settings (currently only the repository URL). */
class SettingsStore(private val context: Context) {

    private val repoUrlKey = stringPreferencesKey("repo_url")

    val repoUrl: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[repoUrlKey]?.takeIf { it.isNotBlank() } ?: BuildConfig.DEFAULT_REPO_URL
    }

    suspend fun currentRepoUrl(): String = repoUrl.first()

    suspend fun setRepoUrl(url: String) {
        context.dataStore.edit { prefs ->
            val trimmed = url.trim().trimEnd('/')
            if (trimmed.isBlank()) prefs.remove(repoUrlKey) else prefs[repoUrlKey] = trimmed
        }
    }

    suspend fun resetRepoUrl() {
        context.dataStore.edit { it.remove(repoUrlKey) }
    }

    companion object {
        const val DEFAULT_REPO_URL: String = BuildConfig.DEFAULT_REPO_URL
    }
}
