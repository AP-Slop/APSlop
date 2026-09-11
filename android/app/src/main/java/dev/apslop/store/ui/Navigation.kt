package dev.apslop.store.ui

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

object Routes {
    const val LIST = "apps"
    const val SETTINGS = "settings"
    const val DETAIL = "apps/{packageName}"
    fun detail(packageName: String) = "apps/${Uri.encode(packageName)}"
}

@Composable
fun StoreNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = Routes.LIST) {
        composable(Routes.LIST) {
            AppListScreen(
                onOpenApp = { navController.navigate(Routes.detail(it)) },
                onOpenSettings = { navController.navigate(Routes.SETTINGS) },
            )
        }
        composable(
            route = Routes.DETAIL,
            arguments = listOf(navArgument("packageName") { type = NavType.StringType }),
        ) {
            AppDetailScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.SETTINGS) {
            SettingsScreen(onBack = { navController.popBackStack() })
        }
    }
}
