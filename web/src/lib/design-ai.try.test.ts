// A real call to the AI, for tuning the drawing prompt: TRY_AI=1 with ANTHROPIC_API_KEY set. Skipped otherwise.
import { writeFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const on = process.env.TRY_AI === "1";
vi.mock("@/lib/db", () => ({ prisma: {} }));
for (const k of ["GITHUB_ORG", "GITHUB_ADMIN_TOKEN", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "AUTH_SECRET"]) process.env[k] ||= "x";

describe.skipIf(!on)("drawDesign (real AI)", { timeout: 600_000 }, () => {
  it("draws the cafeteria app", async () => {
    const { drawDesign, designForPrompt } = await import("./design-ai");
    const prompt = process.env.TRY_PROMPT ?? "An app to note cafeteria menus and rate them with stars, without photos.";
    const t0 = Date.now();
    const r = await drawDesign(prompt, (process.env.TRY_MODEL as "claude" | "deepseek") ?? "claude");
    const out = process.env.TRY_OUT ?? "/tmp/draw.json";
    writeFileSync(out, JSON.stringify({ seconds: (Date.now() - t0) / 1000, plan: r.plan, files: r.files, prompt: designForPrompt(r.plan, r.files) }, null, 2));
    console.log(`drawn in ${(Date.now() - t0) / 1000}s: ${Object.keys(r.files.screens).join(", ")} -> ${out}`);
    expect(Object.keys(r.files.screens).length).toBeGreaterThan(0);
  });
});
