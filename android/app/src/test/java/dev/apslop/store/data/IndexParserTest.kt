package dev.apslop.store.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class IndexParserTest {

    private val fixture: String by lazy {
        checkNotNull(javaClass.classLoader?.getResourceAsStream("index-v2.json")) { "fixture missing" }
            .bufferedReader().use { it.readText() }
    }

    private val repoUrl = "http://localhost:8080/fdroid/repo/"

    @Test
    fun `parses repo metadata`() {
        val index = IndexParser.parse(fixture, repoUrl)
        assertEquals("APSlop University Apps", index.repoName)
        assertEquals("Apps built by the university community", index.repoDescription)
        assertEquals("http://localhost:8080/fdroid/repo/icons/icon.png", index.repoIconUrl)
    }

    @Test
    fun `skips packages without versions and sorts by lastUpdated`() {
        val index = IndexParser.parse(fixture, repoUrl)
        assertEquals(listOf("dev.apslop.apps.timetable", "dev.apslop.apps.notes"), index.apps.map { it.packageName })
    }

    @Test
    fun `picks the highest versionCode as latest`() {
        val app = IndexParser.parse(fixture, repoUrl).apps.first { it.packageName == "dev.apslop.apps.timetable" }
        assertEquals("Timetable", app.name)
        assertEquals("Campus timetable viewer", app.summary)
        assertEquals("https://github.com/my-univ-apps/timetable", app.sourceCode)
        assertNull("blank webSite becomes null", app.webSite)
        assertEquals("http://localhost:8080/fdroid/repo/icons/dev.apslop.apps.timetable.10002.png", app.iconUrl)

        assertEquals(10002L, app.latest.versionCode)
        assertEquals("1.0.2", app.latest.versionName)
        assertEquals("http://localhost:8080/fdroid/repo/dev.apslop.apps.timetable_10002.apk", app.latest.apkUrl)
        assertEquals("dev.apslop.apps.timetable_10002.apk", app.latest.apkFileName)
        assertEquals("2222", app.latest.sha256)
        assertEquals(120000L, app.latest.size)
        assertEquals(26, app.latest.minSdk)
    }

    @Test
    fun `falls back to first locale and tolerates missing fields`() {
        val app = IndexParser.parse(fixture, repoUrl).apps.first { it.packageName == "dev.apslop.apps.notes" }
        assertEquals("メモ", app.name)
        assertEquals("", app.summary)
        assertNull(app.iconUrl)
        assertNull(app.latest.minSdk)
        assertNotNull(app.latest.apkUrl)
    }

    @Test
    fun `join handles slashes and absolute urls`() {
        assertEquals("http://x/repo/a.apk", IndexParser.join("http://x/repo", "/a.apk"))
        assertEquals("http://x/repo/a.apk", IndexParser.join("http://x/repo", "a.apk"))
        assertEquals("https://cdn/a.apk", IndexParser.join("http://x/repo", "https://cdn/a.apk"))
    }
}
