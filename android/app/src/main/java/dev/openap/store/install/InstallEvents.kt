package dev.openap.store.install

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/** Result of a PackageInstaller session, delivered from [InstallReceiver]. */
sealed interface InstallEvent {
    val packageName: String?

    data class Success(override val packageName: String?) : InstallEvent
    data class Failure(override val packageName: String?, val message: String) : InstallEvent
    data class Cancelled(override val packageName: String?) : InstallEvent
}

/** Process-wide bus so ViewModels can observe install results. */
object InstallEvents {
    private val _events = MutableSharedFlow<InstallEvent>(extraBufferCapacity = 8)
    val events: SharedFlow<InstallEvent> = _events.asSharedFlow()

    fun emit(event: InstallEvent) {
        _events.tryEmit(event)
    }
}
