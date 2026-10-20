package dev.apslop.store.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/* The same colors as the APSlop website, so the store app and the site look like one product. */

/** The dark top bar, like the site's header. */
val HeaderBackground = Color(0xFF24292F)
val HeaderContent = Color.White

private val Green = Color(0xFF1F883D)
private val GreenDark = Color(0xFF3FB950)

private val LightColors = lightColorScheme(
    primary = Green,
    onPrimary = Color.White,
    background = Color.White,
    surface = Color.White,
    surfaceVariant = Color(0xFFF6F8FA),
    surfaceContainerLow = Color(0xFFF6F8FA),
    surfaceContainerHigh = Color.White,
    onSurfaceVariant = Color(0xFF59636E),
    outline = Color(0xFFD1D9E0),
    outlineVariant = Color(0xFFD1D9E0),
)
// GitHub's dark colors, for phones in dark mode (the website itself is light only).
private val DarkColors = darkColorScheme(
    primary = GreenDark,
    onPrimary = Color(0xFF0D1117),
    background = Color(0xFF0D1117),
    surface = Color(0xFF0D1117),
    surfaceVariant = Color(0xFF151B23),
    surfaceContainerLow = Color(0xFF151B23),
    surfaceContainerHigh = Color(0xFF151B23),
    onSurfaceVariant = Color(0xFF9198A1),
    outline = Color(0xFF3D444D),
    outlineVariant = Color(0xFF3D444D),
)

@Composable
fun APSlopStoreTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(colorScheme = if (darkTheme) DarkColors else LightColors, content = content)
}
