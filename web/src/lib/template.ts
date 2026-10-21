import type { RepoFile } from "@/lib/github";
// Built by scripts/bundle-template.mjs (runs before dev/build/test) from ./template, since
// Cloudflare Workers have no filesystem to read the template from at runtime.
import bundle from "@/generated/template-bundle.json";

/** Source dirs of the template's placeholder package, dropped once the AI supplies its own package. */
const TEMPLATE_PKG_DIRS = ["app/src/main/java/dev/apslop/apps/template/", "app/src/test/java/dev/apslop/apps/template/"];

/** TEMPLATE_RULES.md of the template (rules for the AI prompt; never committed into student repos), or "". */
export async function readTemplateRules(): Promise<string> {
  return bundle.rules;
}

/** Every file of the Android app template; binaries are base64 blobs. Empty if no template was bundled. */
export async function readTemplateFiles(): Promise<RepoFile[]> {
  return (bundle.files as RepoFile[]).map((f) => ({ ...f }));
}

/** Template files, with binaries omitted and long files truncated — for the AI prompt. */
export function templateForPrompt(files: RepoFile[], maxPerFile = 6000): string {
  return files
    .filter((f) => f.encoding !== "base64")
    .map((f) => {
      const body = f.content.length > maxPerFile ? f.content.slice(0, maxPerFile) + "\n… (truncated)" : f.content;
      return `<file path="${f.path}">\n${body}\n</file>`;
    })
    .join("\n\n");
}

/**
 * Template first, then overrides (AI output) replace/add by path.
 * If the overrides ship Kotlin sources outside the template's placeholder package,
 * the placeholder package's sources are dropped so the repo has a single MainActivity.
 */
export function mergeFiles(base: RepoFile[], overrides: RepoFile[]): RepoFile[] {
  const inTemplatePkg = (p: string) => TEMPLATE_PKG_DIRS.some((d) => p.startsWith(d));
  const hasOwnSources = overrides.some(
    (f) => f.path.startsWith("app/src/main/java/") && f.path.endsWith(".kt") && !inTemplatePkg(f.path),
  );
  const map = new Map<string, RepoFile>();
  for (const f of base) {
    if (hasOwnSources && inTemplatePkg(f.path)) continue;
    map.set(f.path, f);
  }
  for (const f of overrides) {
    const prev = map.get(f.path);
    map.set(f.path, { ...f, mode: f.mode ?? prev?.mode });
  }
  return [...map.values()];
}
