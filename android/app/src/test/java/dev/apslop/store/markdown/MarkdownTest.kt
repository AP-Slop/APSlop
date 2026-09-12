package dev.apslop.store.markdown

import org.junit.Assert.assertEquals
import org.junit.Test

class MarkdownTest {

    @Test
    fun `parses headings and joins soft line breaks`() {
        val blocks = Markdown.parse("# Title ##\n\nfirst line\nsecond line\n\n日本語の文章で、\n改行されている")
        assertEquals(
            listOf(
                MdBlock.Heading(1, MdText("Title")),
                MdBlock.Paragraph(MdText("first line second line")),
                MdBlock.Paragraph(MdText("日本語の文章で、改行されている")),
            ),
            blocks,
        )
    }

    @Test
    fun `parses lists quotes rules and fenced code`() {
        val md = """
            - one
            - two
              continued
               - nested
            1. first
            > quoted
            > text
            ---
            ```kotlin
            val x = 1
            ```
        """.trimIndent()
        assertEquals(
            listOf(
                MdBlock.ListItem(0, null, MdText("one")),
                MdBlock.ListItem(0, null, MdText("two continued")),
                MdBlock.ListItem(1, null, MdText("nested")),
                MdBlock.ListItem(0, "1.", MdText("first")),
                MdBlock.Quote(MdText("quoted text")),
                MdBlock.Rule,
                MdBlock.CodeBlock("val x = 1"),
            ),
            Markdown.parse(md),
        )
    }

    @Test
    fun `skips html-only lines and shows tables as monospace rows`() {
        val md = "<p align=\"center\">\n  <img src=\"icon.png\">\n</p>\n\n| a | b |\n|---|:-:|\n| 1 | 2 |"
        assertEquals(listOf(MdBlock.CodeBlock("| a | b |\n| 1 | 2 |")), Markdown.parse(md))
    }

    @Test
    fun `parses bold links and code inline`() {
        val text = Markdown.parseInline("**Full Changelog**: see [the docs](https://example.com/docs) and `code`")
        assertEquals("Full Changelog: see the docs and code", text.text)
        assertEquals(
            listOf(
                MdSpan(0, 14, MdStyle.Bold),
                MdSpan(20, 28, MdStyle.Link("https://example.com/docs")),
                MdSpan(33, 37, MdStyle.Code),
            ),
            text.spans,
        )
    }

    @Test
    fun `nested styles are offset into the outer text`() {
        val text = Markdown.parseInline("a [**b**](https://x.dev) *c*")
        assertEquals("a b c", text.text)
        assertEquals(
            listOf(
                MdSpan(2, 3, MdStyle.Bold),
                MdSpan(2, 3, MdStyle.Link("https://x.dev")),
                MdSpan(4, 5, MdStyle.Italic),
            ),
            text.spans,
        )
    }

    @Test
    fun `bare urls become links and stop at punctuation or Japanese text`() {
        val source = "詳細は https://github.com/AP-Slop/app を参照。https://x.devを見て. See https://y.dev."
        val text = Markdown.parseInline(source)
        assertEquals(source, text.text)
        assertEquals(
            listOf("https://github.com/AP-Slop/app", "https://x.dev", "https://y.dev"),
            text.spans.map { (it.style as MdStyle.Link).url },
        )
        text.spans.forEach { assertEquals((it.style as MdStyle.Link).url, text.text.substring(it.start, it.end)) }
    }

    @Test
    fun `unsafe link schemes snake_case and escapes stay plain`() {
        val text = Markdown.parseInline("[tap](intent://evil) my_var_name \\*not italic\\*")
        assertEquals("tap my_var_name *not italic*", text.text)
        assertEquals(emptyList<MdSpan>(), text.spans)
    }
}
