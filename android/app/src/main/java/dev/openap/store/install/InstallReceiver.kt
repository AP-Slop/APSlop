package dev.openap.store.install

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.os.Build

/**
 * Receives PackageInstaller status broadcasts. On STATUS_PENDING_USER_ACTION the
 * system hands us a confirmation Intent which we must start; other statuses are
 * forwarded to [InstallEvents].
 */
class InstallReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
        val packageName = intent.getStringExtra(PackageInstaller.EXTRA_PACKAGE_NAME)
        val message = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)

        when (status) {
            PackageInstaller.STATUS_PENDING_USER_ACTION -> {
                @Suppress("DEPRECATION")
                val confirm: Intent? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent::class.java)
                } else {
                    intent.getParcelableExtra(Intent.EXTRA_INTENT)
                }
                if (confirm != null) {
                    confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(confirm)
                } else {
                    InstallEvents.emit(InstallEvent.Failure(packageName, "Missing confirmation intent"))
                }
            }

            PackageInstaller.STATUS_SUCCESS -> InstallEvents.emit(InstallEvent.Success(packageName))

            PackageInstaller.STATUS_FAILURE_ABORTED -> InstallEvents.emit(InstallEvent.Cancelled(packageName))

            else -> InstallEvents.emit(
                InstallEvent.Failure(packageName, message ?: "status $status"),
            )
        }
    }

    companion object {
        const val ACTION_INSTALL_STATUS = "dev.openap.store.INSTALL_STATUS"
    }
}
