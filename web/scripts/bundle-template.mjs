// Packs ./template (see sync-template.mjs) into src/generated/template-bundle.json so the app
// can read the template without a filesystem (Cloudflare Workers). Missing template -> empty bundle.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("template");
const out = path.resolve("src/generated/template-bundle.json");
const SKIP_DIRS = new Set([".gradle", "build", ".idea", "node_modules", ".git"]);
const TEXT_EXT = /\.(kt|kts|xml|md|txt|yml|yaml|json|properties|gradle|pro|sh|bat|gitignore|toml)$/i;
const RULES_FILE = "TEMPLATE_RULES.md";

const files = [];
let rules = "";
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(abs);
      continue;
    }
    if (!entry.isFile()) continue;
    const rel = path.relative(root, abs).split(path.sep).join("/");
    if (rel === "local.properties") continue;
    const buf = fs.readFileSync(abs);
    if (rel === RULES_FILE) {
      rules = buf.toString("utf-8");
      continue;
    }
    const isText = TEXT_EXT.test(entry.name) || entry.name === "gradlew" || !buf.subarray(0, 8000).includes(0);
    const mode = fs.statSync(abs).mode & 0o111 ? "100755" : "100644";
    files.push(
      isText
        ? { path: rel, content: buf.toString("utf-8"), mode }
        : { path: rel, content: buf.toString("base64"), encoding: "base64", mode },
    );
  }
}
if (fs.existsSync(root)) walk(root);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ files, rules }));
console.log(`bundled ${files.length} template files -> ${path.relative(process.cwd(), out)}`);
