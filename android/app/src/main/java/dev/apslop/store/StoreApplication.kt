package dev.apslop.store

import android.app.Application
import dev.apslop.store.data.SettingsStore
import dev.apslop.store.data.StoreRepository
import dev.apslop.store.install.AppInstaller

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
