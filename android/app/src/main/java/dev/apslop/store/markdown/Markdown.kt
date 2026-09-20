package dev.apslop.store.markdown

/*
 * A small Markdown parser for app descriptions, which the store takes from each app's README.
 * It covers what READMEs typically use (headings, paragraphs, lists, quotes, fenced code, tables,
 * rules; bold / italic / code / links inline) and degrades everything else to plain text.
 * Pure Kotlin so it can be unit-tested on the JVM; ui/MarkdownText.kt renders the result.
 */

sealed interface MdBlock {
    data class Heading(val level: Int, val text: MdText) : MdBlock
    data class Paragraph(val text: MdText) : MdBlock

    /** [marker] is null for a bullet item, otherwise the ordered marker such as "1.". */
    data class ListItem(val depth: Int, val marker: String?, val text: MdText) : MdBlock
    data class Quote(val text: MdText) : MdBlock
    data class CodeBlock(val code: String) : MdBlock
    data object Rule : MdBlock
}

/** Plain text plus styled ranges; maps 1:1 onto an AnnotatedString. */
data class MdText(val text: String, val spans: List<MdSpan> = emptyList())

data class MdSpan(val start: Int, val end: Int, val style: MdStyle)

sealed interface MdStyle {
    data object Bold : MdStyle
    data object Italic : MdStyle
    data object Code : MdStyle
    data class Link(val url: String) : MdStyle
}

object Markdown {

    private val FENCE = Regex("^(```+|~~~+)")
    private val HEADING = Regex("^(#{1,6})\\s+(.*?)(?:\\s+#+)?\\s*$")
    private val RULE = Regex("^([-*_])(?:\\s*\\1){2,}\\s*$")
    private val BULLET = Regex("^([ \\t]*)([-*+])\\s+(.*)$")
    private val ORDERED = Regex("^([ \\t]*)(\\d{1,9})([.)])\\s+(.*)$")
    private val HTML_LINE = Regex("^(?:</?[a-zA-Z][^>]*>\\s*)+$")
    private val TABLE_SEPARATOR = Regex("^\\|?[\\s:|-]+\\|?$")
    private const val ESCAPABLE = "\\`*_{}[]()#+-.!<>|~"

    fun parse(source: String): List<MdBlock> {
        val lines = source.replace("\r\n", "\n").split('\n')
        val blocks = mutableListOf<MdBlock>()
        var i = 0
        while (i < lines.size) {
            val line = lines[i]
            val trimmed = line.trim()
            if (trimmed.isEmpty() || isHtmlLine(trimmed)) {
                i++
                continue
            }
            val fence = FENCE.find(trimmed)
            if (fence != null) {
                val code = mutableListOf<String>()
                i++
                while (i < lines.size && !lines[i].trim().startsWith(fence.value)) code += lines[i++]
                i++ // closing fence
                blocks += MdBlock.CodeBlock(code.joinToString("\n"))
                continue
            }
            val heading = HEADING.matchEntire(trimmed)
            if (heading != null) {
                blocks += MdBlock.Heading(heading.groupValues[1].length, parseInline(heading.groupValues[2]))
                i++
                continue
            }
            if (RULE.matches(trimmed)) {
                blocks += MdBlock.Rule
                i++
                continue
            }
            if (trimmed.startsWith(">")) {
                val quoted = mutableListOf<String>()
                while (i < lines.size && lines[i].trim().startsWith(">")) {
                    quoted += lines[i++].trim().removePrefix(">").removePrefix(" ")
                }
                blocks += MdBlock.Quote(parseInline(joinLines(quoted)))
                continue
            }
            if (trimmed.startsWith("|")) {
                // Tables are shown as monospace rows; aligning cells is not worth a layout engine here.
                val rows = mutableListOf<String>()
                while (i < lines.size && lines[i].trim().startsWith("|")) {
                    val row = lines[i++].trim()
                    if (!TABLE_SEPARATOR.matches(row)) rows += row
                }
                blocks += MdBlock.CodeBlock(rows.joinToString("\n"))
                continue
            }
            val bullet = BULLET.matchEntire(line)
            val ordered = if (bullet == null) ORDERED.matchEntire(line) else null
            if (bullet != null || ordered != null) {
                val indent = (bullet ?: ordered)!!.groupValues[1]
                val marker = ordered?.let { it.groupValues[2] + it.groupValues[3] }
                val content = mutableListOf(bullet?.groupValues?.get(3) ?: ordered!!.groupValues[4])
                i++
                while (i < lines.size && lines[i].isNotBlank() && !startsBlock(lines[i])) content += lines[i++]
                blocks += MdBlock.ListItem(depth(indent), marker, parseInline(joinLines(content)))
                continue
            }
            val paragraph = mutableListOf(line)
            i++
            while (i < lines.size && lines[i].isNotBlank() && !startsBlock(lines[i])) paragraph += lines[i++]
            blocks += MdBlock.Paragraph(parseInline(joinLines(paragraph)))
        }
        return blocks
    }

    fun parseInline(source: String): MdText {
        val out = StringBuilder()
        val spans = mutableListOf<MdSpan>()

        // Appends the parsed inner markdown, then styles the whole appended range.
        fun appendStyled(inner: String, style: MdStyle?) {
            val start = out.length
            val parsed = parseInline(inner)
            out.append(parsed.text)
            parsed.spans.mapTo(spans) { it.copy(start = it.start + start, end = it.end + start) }
            if (style != null && out.length > start) spans += MdSpan(start, out.length, style)
        }

        fun appendLink(url: String) {
            spans += MdSpan(out.length, out.length + url.length, MdStyle.Link(url))
            out.append(url)
        }

        var i = 0
        while (i < source.length) {
            val c = source[i]
            if (c == '\\' && i + 1 < source.length && source[i + 1] in ESCAPABLE) {
                out.append(source[i + 1])
                i += 2
                continue
            }
            if (c == '`') {
                val end = source.indexOf('`', i + 1)
                if (end > i + 1) {
                    spans += MdSpan(out.length, out.length + end - i - 1, MdStyle.Code)
                    out.append(source, i + 1, end)
                    i = end + 1
                    continue
                }
            }
            if (source.startsWith("**", i) || source.startsWith("__", i)) {
                val delim = source.substring(i, i + 2)
                val end = source.indexOf(delim, i + 2)
                if (end > i + 2 && (delim == "**" || isBoundary(source, i - 1))) {
                    appendStyled(source.substring(i + 2, end), MdStyle.Bold)
                    i = end + 2
                    continue
                }
            }
            if ((c == '*' || c == '_') && i + 1 < source.length && !source[i + 1].isWhitespace()) {
                val end = source.indexOf(c, i + 1)
                // "_" only emphasises at word boundaries so snake_case identifiers stay intact.
                if (end > i + 1 && !source[end - 1].isWhitespace() &&
                    (c == '*' || (isBoundary(source, i - 1) && isBoundary(source, end + 1)))
                ) {
                    appendStyled(source.substring(i + 1, end), MdStyle.Italic)
                    i = end + 1
                    continue
                }
            }
            if (c == '[' || source.startsWith("![", i)) {
                val link = parseLink(source, if (c == '!') i + 1 else i)
                if (link != null) {
                    // Images become a link labelled with their alt text.
                    appendStyled(link.label, link.url.takeIf { isSafeUrl(it) }?.let { MdStyle.Link(it) })
                    i = link.next
                    continue
                }
            }
            if (c == '<') {
                val end = source.indexOf('>', i + 1)
                val url = if (end > i) source.substring(i + 1, end) else ""
                if (isSafeUrl(url) && url.none { it.isWhitespace() }) {
                    appendLink(url)
                    i = end + 1
                    continue
                }
            }
            if ((source.startsWith("https://", i) || source.startsWith("http://", i)) && isBoundary(source, i - 1)) {
                var end = i
                while (end < source.length && !source[end].isWhitespace() && !isCjk(source[end]) && source[end] != '<') end++
                while (end > i && source[end - 1] in ".,;:!?)'\"") end--
                appendLink(source.substring(i, end))
                i = end
                continue
            }
            out.append(c)
            i++
        }
        return MdText(out.toString(), spans)
    }

    private class Link(val label: String, val url: String, val next: Int)

    /** Parses `[label](url "title")` starting at the '[' at [open]. */
    private fun parseLink(s: String, open: Int): Link? {
        var depth = 0
        var close = -1
        for (j in open until s.length) {
            when (s[j]) {
                '[' -> depth++
                ']' -> if (--depth == 0) {
                    close = j
                    break
                }
            }
        }
        if (close < 0 || s.getOrNull(close + 1) != '(') return null
        val end = s.indexOf(')', close + 2)
        if (end < 0) return null
        val url = s.substring(close + 2, end).trim().substringBefore(' ').removeSurrounding("<", ">")
        return Link(s.substring(open + 1, close), url, end + 1)
    }

    /** Soft line breaks become a space, except next to CJK text where a space would be wrong. */
    private fun joinLines(lines: List<String>): String = buildString {
        lines.forEachIndexed { index, raw ->
            val hardBreak = raw.endsWith("  ") || raw.trimEnd().endsWith("\\")
            val line = raw.trim().let { if (hardBreak) it.removeSuffix("\\").trimEnd() else it }
            append(line)
            if (index < lines.lastIndex) {
                val next = lines[index + 1].trim()
                append(
                    when {
                        hardBreak || line.isEmpty() || next.isEmpty() -> "\n"
                        isCjk(line.last()) || isCjk(next.first()) -> ""
                        else -> " "
                    },
                )
            }
        }
    }

    private fun startsBlock(line: String): Boolean {
        val t = line.trim()
        return FENCE.find(t) != null || HEADING.matches(t) || RULE.matches(t) || isHtmlLine(t) ||
            t.startsWith(">") || t.startsWith("|") || BULLET.matches(line) || ORDERED.matches(line)
    }

    private fun isHtmlLine(t: String): Boolean =
        HTML_LINE.matches(t) && !t.startsWith("<http") && !t.startsWith("<mailto:")

    private fun depth(indent: String): Int = (indent.sumOf { if (it == '\t') 4 else 1 } / 2).coerceAtMost(3)

    private fun isBoundary(s: String, index: Int): Boolean = index !in s.indices || !s[index].isLetterOrDigit()

    private fun isCjk(c: Char): Boolean =
        c.code in 0x2E80..0x9FFF || c.code in 0xAC00..0xD7AF || c.code in 0xF900..0xFAFF || c.code in 0xFF00..0xFFEF

    /** Only web and mail links are clickable; anything else (intent:, javascript:, relative paths) stays text. */
    private fun isSafeUrl(url: String): Boolean =
        url.startsWith("https://", ignoreCase = true) ||
            url.startsWith("http://", ignoreCase = true) ||
            url.startsWith("mailto:", ignoreCase = true)
}
