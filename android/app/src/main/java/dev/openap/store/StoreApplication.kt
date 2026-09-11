package dev.openap.store

import android.app.Application
import dev.openap.store.data.SettingsStore
import dev.openap.store.data.StoreRepository
import dev.openap.store.install.AppInstaller

/** Hand-rolled dependency container; small enough not to need a DI framework. */
class StoreApplication : Application() {

    val settings: SettingsStore by lazy { SettingsStore(this) }
    val repository: StoreRepository by lazy { StoreRepository(this, settings) }
    val installer: AppInstaller by lazy { AppInstaller(this) }

    companion object {
        fun from(context: android.content.Context): StoreApplication =
            context.applicationContext as StoreApplication
    }
}
