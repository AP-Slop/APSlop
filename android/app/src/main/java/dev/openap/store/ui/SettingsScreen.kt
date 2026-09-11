package dev.openap.store.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import dev.openap.store.StoreApplication
import dev.openap.store.R
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val container = remember { StoreApplication.from(context) }
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    var repoUrl by remember { mutableStateOf("") }
    var loaded by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        repoUrl = container.settings.currentRepoUrl()
        loaded = true
    }

    val savedMsg = stringResource(R.string.settings_saved)
    val errorMsgTemplate = stringResource(R.string.error_loading)

    fun saveAndRefresh(url: String) {
        scope.launch {
            container.settings.setRepoUrl(url)
            repoUrl = container.settings.currentRepoUrl()
            try {
                container.repository.refresh()
                snackbar.showSnackbar(savedMsg)
            } catch (e: Exception) {
                snackbar.showSnackbar(String.format(errorMsgTemplate, e.message ?: e.javaClass.simpleName))
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.title_settings)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back))
                    }
                },
            )
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedTextField(
                value = repoUrl,
                onValueChange = { repoUrl = it },
                enabled = loaded,
                modifier = Modifier.fillMaxWidth(),
                label = { Text(stringResource(R.string.settings_repo_url)) },
                placeholder = { Text(stringResource(R.string.settings_repo_url_hint)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
            )
            Text(
                stringResource(R.string.settings_repo_info),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { saveAndRefresh(repoUrl) }, enabled = loaded) {
                    Text(stringResource(R.string.settings_save))
                }
                OutlinedButton(
                    onClick = { saveAndRefresh(dev.openap.store.data.SettingsStore.DEFAULT_REPO_URL) },
                    enabled = loaded,
                ) {
                    Text(stringResource(R.string.settings_reset))
                }
            }
        }
    }
}
