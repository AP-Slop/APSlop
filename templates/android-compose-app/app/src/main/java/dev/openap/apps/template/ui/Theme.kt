package dev.openap.apps.template.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF1E5EFF),
    secondary = Color(0xFF5B6B8C),
    tertiary = Color(0xFF00A385),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF9DB7FF),
    secondary = Color(0xFFB9C6E6),
    tertiary = Color(0xFF5FE0C1),
)

@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
