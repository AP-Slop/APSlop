// Boots the embedded wireframe editor (public/wireframe/) in headless Chromium against this server's
// store, with real screens: SMOKE=1 SMOKE_DESIGN=<draw.json from design-ai.try.test.ts>. Skipped otherwise.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { serialize } from "@/vendor/wireframe/core";

const on = process.env.SMOKE === "1";
let row = { id: "d1", project: "{}", screens: "{}", updatedAt: new Date() };
const update = vi.fn(async (args: { data: { project?: string; screens?: string } }) => {
  row = { ...row, ...args.data, updatedAt: new Date() };
  return row;
});
vi.mock("@/lib/db", () => ({ prisma: { design: { update } } }));

const chromium = ["/usr/bin/chromium", "/usr/bin/google-chrome-stable"].find((p) => existsSync(p));

describe.skipIf(!on || !chromium)("embedded editor (headless Chromium)", { timeout: 120_000 }, () => {
  it("loads the project, opens the first screen and draws its parts", async () => {
    const store = await import("./wireframe-store");
    const drawn = JSON.parse(readFileSync(process.env.SMOKE_DESIGN!, "utf8")) as { files: { project: unknown; screens: Record<string, unknown> } };
    row.project = serialize(drawn.files.project);
    row.screens = JSON.stringify(drawn.files.screens);
    const first = Object.keys(drawn.files.screens)[0];

    const pub = join(process.cwd(), "public/wireframe");
    const types: Record<string, string> = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html" };
    const server = createServer(async (req, res) => {
      const url = new URL(req.url!, "http://x");
      const send = (status: number, body: unknown) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(status === 204 ? undefined : JSON.stringify(body));
      };
      if (url.pathname.startsWith("/wireframe/")) {
        const file = join(pub, url.pathname.slice("/wireframe/".length) || "index.html");
        if (!existsSync(file)) return send(404, { error: "nf" });
        res.writeHead(200, { "content-type": types[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
        return res.end(readFileSync(file));
      }
      const m = /^\/api\/wireframe\/d1(\/api\/.*)$/.exec(url.pathname);
      if (!m) return send(404, { error: "nf" });
      const p = m[1];
      const body = async () => JSON.parse(await new Promise<string>((r) => { let t = ""; req.on("data", (c) => (t += c)); req.on("end", () => r(t || "null")); }));
      let a;
      if (p === "/api/project" && req.method === "GET") a = await store.projectResponse(row);
      else if (p === "/api/project" && req.method === "PUT") a = await store.putProject(row, await body());
      else if (p === "/api/screens" && req.method === "POST") a = await store.createScreen(row, await body());
      else if (/^\/api\/screens\/[a-z0-9-]+$/.test(p) && req.method === "GET") a = await store.screenResponse(row, p.split("/")[3]);
      else if (/^\/api\/screens\/[a-z0-9-]+$/.test(p) && req.method === "PUT") a = await store.putScreen(row, p.split("/")[3], await body());
      else if (p === "/api/templates") a = store.templatesResponse();
      else a = store.libraryResponse(req.method!, p);
      send(a.status, a.body);
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const port = (server.address() as { port: number }).port;
    const url = `http://127.0.0.1:${port}/wireframe/index.html?design=d1&screen=${first}`;
    try {
      // Its own profile: with the default one, Chromium would hand the URL to a browser already running and wait.
      // Spawned asynchronously: the server above lives in this process, so a blocking spawn would starve it.
      const profile = mkdtempSync(join(tmpdir(), "apslop-smoke-"));
      const run = await new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve, reject) => {
        const child = spawn(
          chromium!,
          [`--user-data-dir=${profile}`, "--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--virtual-time-budget=8000", "--enable-logging=stderr", "--v=0", "--dump-dom", url],
          { stdio: ["ignore", "pipe", "pipe"] },
        );
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (c) => (stdout += c));
        child.stderr.on("data", (c) => (stderr += c));
        const killer = setTimeout(() => child.kill("SIGKILL"), 60_000);
        child.on("error", reject);
        child.on("close", (code) => {
          clearTimeout(killer);
          resolve({ stdout, stderr, code });
        });
      });
      expect(run.code, run.stderr.slice(-2000)).toBe(0);
      const dom = run.stdout;
      const consoleErrors = run.stderr.split("\n").filter((l) => /CONSOLE/.test(l) && /error|Error|Uncaught|Failed/.test(l));
      expect(consoleErrors, run.stderr.split("\n").filter((l) => /CONSOLE/.test(l)).join("\n")).toEqual([]);
      // The editor view is showing (not the Start page), with the screen's parts drawn in the canvas.
      expect(dom).toMatch(/<div id="editor"(?![^>]*hidden)/);
      expect(dom).toContain('id="apslop-bar"');
      const canvas = dom.slice(dom.indexOf('id="canvas"'));
      expect((canvas.match(/wf-el/g) ?? []).length).toBeGreaterThan(3);
      const title = (drawn.files.screens[first] as { title: string }).title;
      expect(dom).toContain(title);
      console.log(`editor booted: ${(canvas.match(/wf-el/g) ?? []).length} parts drawn, ${update.mock.calls.length} saves, console: ${run.stderr.split("\n").filter((l) => /CONSOLE/.test(l)).length} lines`);
    } finally {
      server.close();
    }
  });
});
