package dev.apslop.store

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dev.apslop.store.ui.StoreNavHost
import dev.apslop.store.ui.theme.APSlopStoreTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            APSlopStoreTheme {
                StoreNavHost()
            }
        }
    }
}
