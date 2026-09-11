package dev.openap.store.ui

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.openap.store.R
import dev.openap.store.data.InstallState
import dev.openap.store.data.StoreApp
import dev.openap.store.viewmodel.AppDetailUiState
import dev.openap.store.viewmodel.AppDetailViewModel
import dev.openap.store.viewmodel.InstallProgress

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppDetailScreen(
    onBack: () -> Unit,
    viewModel: AppDetailViewModel = viewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }

    // Re-check installed state whenever the screen comes back to the foreground
    // (e.g. after the system install dialog or the unknown-sources settings page).
    val lifecycleOwner = LocalLifecycleOwner.current
    androidx.compose.runtime.DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) viewModel.refreshInstallState()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val installSuccess = stringResource(R.string.install_success)
    LaunchedEffect(state.progress) {
        when (val p = state.progress) {
            is InstallProgress.Succeeded -> {
                snackbar.showSnackbar(installSuccess)
                viewModel.clearProgress()
            }
            is InstallProgress.Failed -> {
                snackbar.showSnackbar(
                    if (p.duringDownload) context.getString(R.string.download_failed, p.message)
                    else context.getString(R.string.install_failed, p.message),
                )
                viewModel.clearProgress()
            }
            else -> Unit
        }
    }

    if (state.needsUnknownSourcesPermission) {
        AlertDialog(
            onDismissRequest = viewModel::dismissPermissionPrompt,
            title = { Text(stringResource(R.string.unknown_sources_title)) },
            text = { Text(stringResource(R.string.unknown_sources_message)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.dismissPermissionPrompt()
                    context.startActivity(viewModel.unknownSourcesIntent())
                }) { Text(stringResource(R.string.open_settings)) }
            },
            dismissButton = {
                TextButton(onClick = viewModel::dismissPermissionPrompt) { Text(stringResource(R.string.action_cancel)) }
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.app?.name ?: "") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back))
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        val app = state.app
        when {
            state.isLoading -> androidx.compose.foundation.layout.Box(
                Modifier.padding(padding).fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }

            state.error != null && app == null -> ErrorView(state.error!!) { viewModel.refreshInstallState() }

            app == null -> CenteredMessage(stringResource(R.string.empty_apps))

            else -> DetailContent(
                app = app,
                state = state,
                modifier = Modifier.padding(padding),
                onInstall = viewModel::install,
                onCancel = viewModel::cancelInstall,
                onOpen = { viewModel.launchIntent()?.let(context::startActivity) },
                onOpenUrl = { url -> context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) },
            )
        }
    }
}

@Composable
private fun DetailContent(
    app: StoreApp,
    state: AppDetailUiState,
    modifier: Modifier,
    onInstall: () -> Unit,
    onCancel: () -> Unit,
    onOpen: () -> Unit,
    onOpenUrl: (String) -> Unit,
) {
    Column(
        modifier = modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AppIcon(url = app.iconUrl, size = 72.dp)
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(app.name, style = MaterialTheme.typography.headlineSmall)
                if (app.summary.isNotBlank()) {
                    Text(app.summary, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        InstallSection(app, state, onInstall, onCancel, onOpen)

        HorizontalDivider()

        if (app.description.isNotBlank()) {
            Text(app.description, style = MaterialTheme.typography.bodyMedium)
            HorizontalDivider()
        }

        InfoRow(stringResource(R.string.label_version), "${app.latest.versionName} (${app.latest.versionCode})")
        (state.installState as? InstallState.Installed)?.let {
            InfoRow(stringResource(R.string.label_installed_version), "${it.versionName} (${it.versionCode})")
        }
        InfoRow(stringResource(R.string.label_size), formatBytes(app.latest.size))
        app.latest.minSdk?.let { InfoRow(stringResource(R.string.label_min_sdk), it.toString()) }
        InfoRow(stringResource(R.string.label_updated), formatDate(app.lastUpdated))
        InfoRow(stringResource(R.string.label_package), app.packageName)

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            app.sourceCode?.let { url ->
                OutlinedButton(onClick = { onOpenUrl(url) }) {
                    Icon(Icons.Default.Code, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text(stringResource(R.string.source_code))
                }
            }
            app.webSite?.let { url ->
                OutlinedButton(onClick = { onOpenUrl(url) }) {
                    Icon(Icons.Default.Language, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text(stringResource(R.string.website))
                }
            }
        }
    }
}

@Composable
private fun InstallSection(
    app: StoreApp,
    state: AppDetailUiState,
    onInstall: () -> Unit,
    onCancel: () -> Unit,
    onOpen: () -> Unit,
) {
    when (val p = state.progress) {
        is InstallProgress.Downloading -> {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(stringResource(R.string.downloading, p.percent), style = MaterialTheme.typography.labelLarge)
                LinearProgressIndicator(progress = { p.percent / 100f }, modifier = Modifier.fillMaxWidth())
                TextButton(onClick = onCancel) { Text(stringResource(R.string.action_cancel)) }
            }
        }
        is InstallProgress.Installing -> {
            Row(verticalAlignment = Alignment.CenterVertically) {
                CircularProgressIndicator(Modifier.height(20.dp).width(20.dp))
                Spacer(Modifier.width(12.dp))
                Text(stringResource(R.string.installing))
            }
        }
        else -> {
            val installed = state.installState as? InstallState.Installed
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                when {
                    installed == null -> Button(onClick = onInstall, modifier = Modifier.weight(1f)) {
                        Text(stringResource(R.string.action_install))
                    }
                    installed.isOlderThan(app.latest) -> {
                        Button(onClick = onInstall, modifier = Modifier.weight(1f)) {
                            Text(stringResource(R.string.action_update))
                        }
                        OutlinedButton(onClick = onOpen, modifier = Modifier.weight(1f)) {
                            Text(stringResource(R.string.action_open))
                        }
                    }
                    else -> Button(onClick = onOpen, modifier = Modifier.weight(1f)) {
                        Text(stringResource(R.string.action_open))
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.width(16.dp))
        Text(value, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f, fill = false))
    }
}
