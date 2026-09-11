import fs from "node:fs/promises";
import path from "node:path";
import type { RepoFile } from "@/lib/github";

const SKIP_DIRS = new Set([".gradle", "build", ".idea", "node_modules", ".git"]);
const TEXT_EXT = /\.(kt|kts|xml|md|txt|yml|yaml|json|properties|gradle|pro|sh|bat|gitignore|toml)$/i;
/** Rules for the AI prompt; never committed into student repos. */
const RULES_FILE = "TEMPLATE_RULES.md";
/** Source dirs of the template's placeholder package, dropped once the AI supplies its own package. */
const TEMPLATE_PKG_DIRS = ["app/src/main/java/dev/apslop/apps/template/", "app/src/test/java/dev/apslop/apps/template/"];

/** Reads TEMPLATE_RULES.md from the template dir, or "" if absent. */
export async function readTemplateRules(): Promise<string> {
  try {
    return await fs.readFile(path.join(templateDir(), RULES_FILE), "utf-8");
  } catch {
    return "";
  }
}

/** Directory holding the Android app template (copied into the image at /app/template). */
export function templateDir(): string {
  return process.env.TEMPLATE_DIR ?? path.join(process.cwd(), "template");
}

/** Reads every file under the template dir; binaries become base64 blobs. */
export async function readTemplateFiles(): Promise<RepoFile[]> {
  const root = templateDir();
  try {
    await fs.access(root);
  } catch {
    return [];
  }
  const out: RepoFile[] = [];
  async function walk(dir: string) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join("/");
      if (rel === "local.properties" || rel === RULES_FILE) continue;
      const buf = await fs.readFile(abs);
      const isText = TEXT_EXT.test(entry.name) || entry.name === "gradlew" || !buf.subarray(0, 8000).includes(0);
      const stat = await fs.stat(abs);
      const mode = stat.mode & 0o111 ? ("100755" as const) : ("100644" as const);
      out.push(
        isText
          ? { path: rel, content: buf.toString("utf-8"), mode }
          : { path: rel, content: buf.toString("base64"), encoding: "base64", mode },
      );
    }
  }
  await walk(root);
  return out;
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
