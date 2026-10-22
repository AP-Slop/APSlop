/** How much of a build log is handed to AI. */
const MAX_LINES = 120;

/** Lines that explain a Gradle failure on their own. */
const ERROR_LINE = /^(e: |error: |FAILURE: |Execution failed|.* FAILED$|.*: error: |.*\bUnresolved reference\b)/;
/** Lines whose indented continuation belongs to them (a Kotlin error, a failed test). */
const STARTS_BLOCK = /^(e: |.* FAILED$)/;

/**
 * The lines of a GitHub Actions job log that say why the build failed: Kotlin / resource errors with their
 * continuation lines, failed tasks and tests, and Gradle's "What went wrong". Timestamps, colors and the
 * runner's checkout path are dropped so paths read as in the repository. Falls back to the log's tail.
 */
export function extractBuildErrors(log: string): string {
  const lines = log.split(/\r?\n/).map(clean);
  const kept: string[] = [];
  let inBlock = false;
  let inWhatWentWrong = false;
  for (const line of lines) {
    if (line.startsWith("* What went wrong:")) inWhatWentWrong = true;
    else if (line.startsWith("* Try:") || line.startsWith("* Get more help")) inWhatWentWrong = false;
    const continues: boolean = inBlock && /^\s+\S/.test(line);
    const keep = inWhatWentWrong || continues || ERROR_LINE.test(line);
    if (keep) kept.push(line);
    // Gradle interleaves "> Task …" progress lines with a compiler error's continuation lines.
    inBlock = continues || STARTS_BLOCK.test(line) || (inBlock && /^> Task /.test(line));
  }
  const out = kept.length ? kept : lines.filter((l) => l.trim()).slice(-40);
  if (out.length <= MAX_LINES) return out.join("\n");
  return [...out.slice(0, MAX_LINES), `… (${out.length - MAX_LINES} more lines)`].join("\n");
}

function clean(line: string): string {
  return line
    .replace(/^\S+Z /, "") // the timestamp GitHub puts before every line
    .replace(/\x1b\[[0-9;]*m/g, "")
    .replace(/file:\/\/\/home\/runner\/work\/[^/\s]+\/[^/\s]+\//g, "")
    .replace(/\/home\/runner\/work\/[^/\s]+\/[^/\s]+\//g, "")
    .trimEnd();
}
