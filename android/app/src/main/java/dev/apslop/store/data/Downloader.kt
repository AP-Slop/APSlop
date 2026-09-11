package dev.apslop.store.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.IOException
import java.security.MessageDigest

/** Downloads APK files into the app cache and verifies their SHA-256. */
class Downloader(private val client: OkHttpClient, private val cacheDir: File) {

    private val apkDir: File get() = File(cacheDir, "apks").apply { mkdirs() }

    /**
     * Downloads [version] to the cache. Returns the verified file.
     * @throws IOException on network failure or hash mismatch.
     */
    suspend fun download(
        version: AppVersion,
        onProgress: (Int) -> Unit = {},
    ): File = withContext(Dispatchers.IO) {
        val target = File(apkDir, version.apkFileName.ifBlank { "download.apk" })

        // Reuse an already-verified cached file.
        if (target.exists() && version.sha256 != null && sha256(target).equals(version.sha256, ignoreCase = true)) {
            onProgress(100)
            return@withContext target
        }

        val request = Request.Builder().url(version.apkUrl).build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw IOException("HTTP ${response.code} for ${version.apkUrl}")
            val body = response.body ?: throw IOException("Empty body")
            val total = body.contentLength().takeIf { it > 0 } ?: version.size ?: -1L
            val digest = MessageDigest.getInstance("SHA-256")

            body.byteStream().use { input ->
                target.outputStream().use { output ->
                    val buf = ByteArray(64 * 1024)
                    var read: Int
                    var done = 0L
                    var lastPct = -1
                    while (input.read(buf).also { read = it } != -1) {
                        ensureActive()
                        output.write(buf, 0, read)
                        digest.update(buf, 0, read)
                        done += read
                        if (total > 0) {
                            val pct = ((done * 100) / total).toInt().coerceIn(0, 100)
                            if (pct != lastPct) {
                                lastPct = pct
                                onProgress(pct)
                            }
                        }
                    }
                }
            }

            val actual = digest.digest().toHex()
            if (version.sha256 != null && !actual.equals(version.sha256, ignoreCase = true)) {
                target.delete()
                throw IOException("SHA-256 mismatch (expected ${version.sha256}, got $actual)")
            }
        }
        onProgress(100)
        target
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buf = ByteArray(64 * 1024)
            var read: Int
            while (input.read(buf).also { read = it } != -1) digest.update(buf, 0, read)
        }
        return digest.digest().toHex()
    }

    private fun ByteArray.toHex(): String = joinToString("") { "%02x".format(it) }
}
