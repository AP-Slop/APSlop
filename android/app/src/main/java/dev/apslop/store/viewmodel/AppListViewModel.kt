package dev.apslop.store.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import dev.apslop.store.StoreApplication
import dev.apslop.store.data.StoreApp
import dev.apslop.store.data.StoreIndex
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AppListUiState(
    val index: StoreIndex? = null,
    val apps: List<StoreApp> = emptyList(),
    val query: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
)

class AppListViewModel(app: Application) : AndroidViewModel(app) {

    private val repository = StoreApplication.from(app).repository

    private val query = MutableStateFlow("")
    private val loading = MutableStateFlow(false)
    private val error = MutableStateFlow<String?>(null)

    val uiState: StateFlow<AppListUiState> =
        combine(repository.index, query, loading, error) { index, q, isLoading, err ->
            val filtered = index?.apps.orEmpty().filter { it.matches(q) }
            AppListUiState(index = index, apps = filtered, query = q, isLoading = isLoading, error = err)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), AppListUiState(isLoading = true))

    init {
        if (repository.index.value == null) refresh()
    }

    fun onQueryChange(value: String) = query.update { value }

    fun refresh() {
        viewModelScope.launch {
            loading.value = true
            error.value = null
            try {
                repository.refresh()
            } catch (e: Exception) {
                error.value = e.message ?: e.javaClass.simpleName
            } finally {
                loading.value = false
            }
        }
    }

    private fun StoreApp.matches(q: String): Boolean {
        if (q.isBlank()) return true
        val needle = q.trim()
        return name.contains(needle, ignoreCase = true) ||
            summary.contains(needle, ignoreCase = true) ||
            packageName.contains(needle, ignoreCase = true)
    }
}
