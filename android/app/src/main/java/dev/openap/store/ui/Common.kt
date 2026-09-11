package dev.openap.store.ui

import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Android
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.Dp
import coil.compose.SubcomposeAsyncImage
import java.text.DateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AppIcon(url: String?, size: Dp, modifier: Modifier = Modifier) {
    val shape = RoundedCornerShape(size / 4)
    if (url == null) {
        Icon(
            imageVector = Icons.Outlined.Android,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = modifier.size(size).clip(shape),
        )
        return
    }
    SubcomposeAsyncImage(
        model = url,
        contentDescription = null,
        modifier = modifier.size(size).clip(shape),
        error = {
            Icon(
                imageVector = Icons.Outlined.Android,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
            )
        },
    )
}

fun formatBytes(bytes: Long?): String {
    if (bytes == null || bytes <= 0) return "-"
    val units = arrayOf("B", "KB", "MB", "GB")
    var value = bytes.toDouble()
    var i = 0
    while (value >= 1024 && i < units.lastIndex) {
        value /= 1024
        i++
    }
    return if (i == 0) "$bytes B" else String.format(Locale.getDefault(), "%.1f %s", value, units[i])
}

fun formatDate(epochMillis: Long): String =
    if (epochMillis <= 0) "-"
    else DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(epochMillis))
