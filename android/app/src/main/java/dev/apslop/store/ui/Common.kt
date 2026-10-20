package dev.apslop.store.ui

import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Android
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import coil.compose.SubcomposeAsyncImage
import dev.apslop.store.R
import dev.apslop.store.data.IndexParser
import dev.apslop.store.ui.theme.HeaderBackground
import dev.apslop.store.ui.theme.HeaderContent
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** The dark bar at the top of every screen. With [onBack], it shows a back arrow. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoreTopBar(
    title: String,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
) {
    TopAppBar(
        title = { Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back))
                }
            }
        },
        actions = actions,
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = HeaderBackground,
            titleContentColor = HeaderContent,
            navigationIconContentColor = HeaderContent,
            actionIconContentColor = HeaderContent,
        ),
    )
}

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
    // Try the sharp 640 dpi icon first; repos without it fall back to the one the index names.
    var model by remember(url) { mutableStateOf(IndexParser.hiResIconUrl(url) ?: url) }
    SubcomposeAsyncImage(
        model = model,
        contentDescription = null,
        modifier = modifier.size(size).clip(shape),
        onError = { if (model != url) model = url },
        error = {
            if (model == url) {
                Icon(
                    imageVector = Icons.Outlined.Android,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                )
            }
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
    return if (i == 0) "$bytes B" else String.format(Locale.US, "%.1f %s", value, units[i])
}

/** "Sep 12, 2026", like the website (the UI is in English whatever the phone's language). */
fun formatDate(epochMillis: Long): String =
    if (epochMillis <= 0) "-"
    else SimpleDateFormat("MMM d, yyyy", Locale.US).format(Date(epochMillis))
