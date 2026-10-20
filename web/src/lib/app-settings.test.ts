import { beforeEach, describe, expect, it, vi } from "vitest";
import type { App } from "@/generated/prisma/client";

const calls: string[] = [];
const fail = new Set<string>();
function step(name: string) {
  return vi.fn(async (...args: unknown[]) => {
    calls.push(`${name}(${args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(", ")})`);
    if (fail.has(name)) throw new Error(`${name} failed`);
    return args[0];
  });
}

vi.mock("@/lib/db", () => ({
  prisma: {
    app: { update: step("db.update"), delete: step("db.delete") },
    generation: { updateMany: step("db.history") },
  },
}));
vi.mock("@/lib/github", () => ({
  repoName: (full: string) => full.split("/")[1],
  updateRepoDescription: step("github.description"),
  deleteRepo: step("github.delete"),
}));
vi.mock("@/lib/store", () => ({ setStoreSummary: step("store.summary"), removeFromStore: step("store.remove") }));

const { SummarySchema, STORE_SUMMARY_LATER, deleteApp, updateSummary } = await import("./app-settings");

const app = {
  id: "a1",
  slug: "counter",
  repoFullName: "org/counter",
  packageName: "dev.apslop.apps.counter",
  status: "PUBLISHED",
} as App;

beforeEach(() => {
  calls.length = 0;
  fail.clear();
});

describe("SummarySchema", () => {
  it("trims and keeps one line of at most 80 characters", () => {
    expect(SummarySchema.parse("  Count things  ")).toBe("Count things");
    expect(SummarySchema.safeParse("   ").success).toBe(false);
    expect(SummarySchema.safeParse("x".repeat(81)).success).toBe(false);
    expect(SummarySchema.safeParse("x".repeat(80)).success).toBe(true);
    expect(SummarySchema.safeParse("one\ntwo").success).toBe(false);
  });
});

describe("updateSummary", () => {
  it("changes the repo description, the app, then the store", async () => {
    await updateSummary(app, "New");
    expect(calls).toEqual([
      "github.description(counter, New)",
      'db.update({"where":{"id":"a1"},"data":{"summary":"New"}})',
      "store.summary(dev.apslop.apps.counter, New)",
    ]);
  });

  it("leaves the store alone for an app that is not published", async () => {
    await updateSummary({ ...app, status: "DRAFT" }, "New");
    expect(calls.some((c) => c.startsWith("store."))).toBe(false);
  });

  it("says the store will catch up when only the store failed", async () => {
    fail.add("store.summary");
    const err = await updateSummary(app, "New").catch((e) => e);
    expect(err.message).toBe(STORE_SUMMARY_LATER);
    expect(err.status).toBe(502);
    expect(calls).toHaveLength(3);
  });
});

describe("deleteApp", () => {
  it("takes it off the store before deleting the repo and the app", async () => {
    await deleteApp(app);
    expect(calls.map((c) => c.split("(")[0])).toEqual([
      "store.remove",
      "db.update",
      "github.delete",
      "db.history",
      "db.history",
      "db.delete",
    ]);
  });

  it("discards proposals awaiting review and marks the AI history of the repo", async () => {
    await deleteApp(app);
    const history = calls.filter((c) => c.startsWith("db.history"));
    expect(history[0]).toBe(
      'db.history({"where":{"repoFullName":"org/counter","status":"READY"},"data":{"status":"DISCARDED"}})',
    );
    expect(history[1]).toContain('"where":{"repoFullName":"org/counter","appDeletedAt":null},"data":{"appDeletedAt":"');
  });

  it("changes nothing else when the store refuses", async () => {
    fail.add("store.remove");
    await expect(deleteApp(app)).rejects.toThrow("store.remove failed");
    expect(calls).toEqual(["store.remove(dev.apslop.apps.counter)"]);
  });

  it("keeps the app, marked as a draft, when the repo could not be deleted", async () => {
    fail.add("github.delete");
    await expect(deleteApp(app)).rejects.toThrow();
    expect(calls.map((c) => c.split("(")[0])).toEqual(["store.remove", "db.update", "github.delete"]);
    expect(calls[1]).toContain('"status":"DRAFT"');
  });

  it("skips the store for an app that never reached it", async () => {
    await deleteApp({ ...app, packageName: null, status: "DRAFT" });
    expect(calls.map((c) => c.split("(")[0])).toEqual(["github.delete", "db.history", "db.history", "db.delete"]);
  });
});
