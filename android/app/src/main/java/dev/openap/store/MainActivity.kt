package dev.openap.store

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dev.openap.store.ui.StoreNavHost
import dev.openap.store.ui.theme.OpenAPStoreTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            OpenAPStoreTheme {
                StoreNavHost()
            }
        }
    }
}
