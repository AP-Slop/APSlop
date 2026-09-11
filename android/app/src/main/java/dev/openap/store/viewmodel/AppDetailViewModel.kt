package dev.openap.store.viewmodel

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import dev.openap.store.StoreApplication
import dev.openap.store.data.InstallState
import dev.openap.store.data.StoreApp
import dev.openap.store.install.InstallEvent
import dev.openap.store.install.InstallEvents
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Progress of the download → install pipeline for the current app. */
sealed interface InstallProgress {
    data object Idle : InstallProgress
    data class Downloading(val percent: Int) : InstallProgress
    data object Installing : InstallProgress
    data class Failed(val message: String, val duringDownload: Boolean) : InstallProgress
    data object Succeeded : InstallProgress
}

data class AppDetailUiState(
    val app: StoreApp? = null,
    val installState: InstallState = InstallState.NotInstalled,
    val progress: InstallProgress = InstallProgress.Idle,
    val isLoading: Boolean = false,
    val error: String? = null,
    /** Set when the user must grant "install unknown apps" first. */
    val needsUnknownSourcesPermission: Boolean = false,
)

class AppDetailViewModel(app: Application, savedStateHandle: SavedStateHandle) : AndroidViewModel(app) {

    private val container = StoreApplication.from(app)
    private val repository = container.repository
    private val installer = container.installer
    private val packageName: String = checkNotNull(savedStateHandle["packageName"])

    private val _uiState = MutableStateFlow(AppDetailUiState())
    val uiState: StateFlow<AppDetailUiState> = _uiState.asStateFlow()

    private var installJob: Job? = null

    init {
        viewModelScope.launch {
            repository.index.collect { load() }
        }
        viewModelScope.launch {
            InstallEvents.events.collect { event ->
                if (event.packageName != null && event.packageName != packageName) return@collect
                val progress = when (event) {
                    is InstallEvent.Success -> InstallProgress.Succeeded
                    is InstallEvent.Cancelled -> InstallProgress.Idle
                    is InstallEvent.Failure -> InstallProgress.Failed(event.message, duringDownload = false)
                }
                _uiState.update { it.copy(progress = progress, installState = repository.installState(packageName)) }
            }
        }
    }

    private suspend fun load() {
        val cached = repository.app(packageName)
        if (cached == null && repository.index.value == null) {
            _uiState.update { it.copy(isLoading = true) }
            try {
                repository.refresh()
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message ?: e.javaClass.simpleName) }
                return
            }
        }
        _uiState.update {
            it.copy(
                app = repository.app(packageName),
                installState = repository.installState(packageName),
                isLoading = false,
                error = null,
            )
        }
    }

    /** Re-check installed state, e.g. when returning to the screen. */
    fun refreshInstallState() {
        _uiState.update { it.copy(installState = repository.installState(packageName)) }
    }

    fun unknownSourcesIntent(): Intent = installer.unknownSourcesSettingsIntent()

    fun dismissPermissionPrompt() = _uiState.update { it.copy(needsUnknownSourcesPermission = false) }

    fun launchIntent(): Intent? = getApplication<Application>().packageManager.getLaunchIntentForPackage(packageName)

    fun install() {
        val app = _uiState.value.app ?: return
        if (!installer.canRequestPackageInstalls()) {
            _uiState.update { it.copy(needsUnknownSourcesPermission = true) }
            return
        }
        if (installJob?.isActive == true) return
        installJob = viewModelScope.launch {
            _uiState.update { it.copy(progress = InstallProgress.Downloading(0)) }
            val file = try {
                repository.downloader.download(app.latest) { pct ->
                    _uiState.update { it.copy(progress = InstallProgress.Downloading(pct)) }
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(progress = InstallProgress.Failed(e.message ?: e.javaClass.simpleName, duringDownload = true))
                }
                return@launch
            }
            _uiState.update { it.copy(progress = InstallProgress.Installing) }
            try {
                installer.install(file, app.packageName)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(progress = InstallProgress.Failed(e.message ?: e.javaClass.simpleName, duringDownload = false))
                }
            }
        }
    }

    fun cancelInstall() {
        installJob?.cancel()
        _uiState.update { it.copy(progress = InstallProgress.Idle) }
    }

    fun clearProgress() = _uiState.update { it.copy(progress = InstallProgress.Idle) }
}
