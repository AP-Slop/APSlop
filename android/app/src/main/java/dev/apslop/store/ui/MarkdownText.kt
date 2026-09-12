package dev.apslop.store.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLinkStyles
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import dev.apslop.store.markdown.Markdown
import dev.apslop.store.markdown.MdBlock
import dev.apslop.store.markdown.MdStyle
import dev.apslop.store.markdown.MdText

/** Renders an app description written in Markdown (see markdown/Markdown.kt for what is supported). */
@Composable
fun MarkdownText(markdown: String, modifier: Modifier = Modifier) {
    val blocks = remember(markdown) { Markdown.parse(markdown) }
    val colors = MaterialTheme.colorScheme
    val typography = MaterialTheme.typography
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        blocks.forEach { block ->
            when (block) {
                is MdBlock.Heading -> Text(
                    block.text.toAnnotatedString(colors),
                    style = when (block.level) {
                        1 -> typography.titleLarge
                        2 -> typography.titleMedium
                        else -> typography.titleSmall
                    },
                )
                is MdBlock.Paragraph -> Text(block.text.toAnnotatedString(colors), style = typography.bodyMedium)
                is MdBlock.ListItem -> Row(Modifier.padding(start = (block.depth * 16).dp)) {
                    Text(block.marker ?: "•", style = typography.bodyMedium, modifier = Modifier.widthIn(min = 20.dp))
                    Spacer(Modifier.width(4.dp))
                    Text(block.text.toAnnotatedString(colors), style = typography.bodyMedium)
                }
                is MdBlock.Quote -> Row(Modifier.height(IntrinsicSize.Min)) {
                    Box(Modifier.width(3.dp).fillMaxHeight().background(colors.outlineVariant))
                    Spacer(Modifier.width(12.dp))
                    Text(block.text.toAnnotatedString(colors), style = typography.bodyMedium, color = colors.onSurfaceVariant)
                }
                is MdBlock.CodeBlock -> Surface(
                    color = colors.surfaceVariant,
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(
                        block.code,
                        style = typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                        softWrap = false,
                        modifier = Modifier.horizontalScroll(rememberScrollState()).padding(12.dp),
                    )
                }
                MdBlock.Rule -> HorizontalDivider()
            }
        }
    }
}

private fun MdText.toAnnotatedString(colors: ColorScheme): AnnotatedString = buildAnnotatedString {
    append(text)
    for (span in spans) {
        when (val style = span.style) {
            MdStyle.Bold -> addStyle(SpanStyle(fontWeight = FontWeight.Bold), span.start, span.end)
            MdStyle.Italic -> addStyle(SpanStyle(fontStyle = FontStyle.Italic), span.start, span.end)
            // Monospace glyphs run wider than the body font, so inline code is set slightly smaller.
            MdStyle.Code -> addStyle(
                SpanStyle(fontFamily = FontFamily.Monospace, fontSize = 0.9.em, background = colors.surfaceVariant),
                span.start,
                span.end,
            )
            is MdStyle.Link -> addLink(
                LinkAnnotation.Url(
                    style.url,
                    TextLinkStyles(SpanStyle(color = colors.primary, textDecoration = TextDecoration.Underline)),
                ),
                span.start,
                span.end,
            )
        }
    }
}
