// Copies ../templates/android-compose-app into ./template (excluding build output)
// so the Docker build context (./web) contains the app template.
import fs from "node:fs";
import path from "node:path";

const src = path.resolve("../templates/android-compose-app");
const dst = path.resolve("template");
const skip = new Set([".gradle", "build", ".idea", "local.properties", ".kotlin"]);

if (!fs.existsSync(src)) {
  console.error(`template not found: ${src}`);
  process.exit(1);
}
fs.rmSync(dst, { recursive: true, force: true });
fs.cpSync(src, dst, {
  recursive: true,
  filter: (p) => !skip.has(path.basename(p)),
});
console.log(`copied ${src} -> ${dst}`);
