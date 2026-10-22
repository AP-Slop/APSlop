import { afterEach, describe, expect, it, vi } from "vitest";

const after = vi.fn();
const runProposal = vi.fn(async () => {});
const syncAppBySlug = vi.fn(async () => ({}));
const runBuildFix = vi.fn(async () => {});
const getCloudflareContext = vi.fn();

vi.mock("next/server", () => ({ after }));
vi.mock("@/lib/proposal-store", () => ({ runProposal }));
vi.mock("@/lib/store", () => ({ syncAppBySlug }));
vi.mock("@/lib/build-fix", () => ({ runBuildFix }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext }));
vi.mock("@/lib/models", async () => {
  const { z } = await import("zod");
  return { ModelChoiceSchema: z.enum(["claude", "deepseek"]) };
});

const job = { kind: "propose", id: "g1", name: "repo", model: "claude" } as const;

afterEach(() => vi.clearAllMocks());

describe("runInBackground", () => {
  it("sends the job to the Queue on Cloudflare", async () => {
    const send = vi.fn(async () => {});
    getCloudflareContext.mockReturnValue({ env: { JOBS: { send } } });
    const { runInBackground } = await import("./jobs");
    await runInBackground(job);
    expect(send).toHaveBeenCalledWith(job);
    expect(after).not.toHaveBeenCalled();
  });

  it("runs the job after the response under Node", async () => {
    getCloudflareContext.mockImplementation(() => {
      throw new Error("not on Cloudflare");
    });
    const { runInBackground } = await import("./jobs");
    await runInBackground(job);
    expect(after).toHaveBeenCalledTimes(1);
    await after.mock.calls[0][0]();
    expect(runProposal).toHaveBeenCalledWith("g1", "repo", "claude");
  });
});

describe("runJob", () => {
  it("syncs a release into the store and swallows a failure", async () => {
    const { runJob } = await import("./jobs");
    syncAppBySlug.mockRejectedValueOnce(new Error("no APK yet"));
    await expect(runJob({ kind: "sync", slug: "timer", tag: "v1.0.0" })).resolves.toBeUndefined();
    expect(syncAppBySlug).toHaveBeenCalledWith("timer", "v1.0.0");
  });

  it("has AI fix a failed build", async () => {
    const { runJob } = await import("./jobs");
    await runJob({ kind: "fix", id: "g1", runId: 42 });
    expect(runBuildFix).toHaveBeenCalledWith("g1", 42);
  });
});

describe("JobSchema", () => {
  it("rejects unknown jobs", async () => {
    const { JobSchema } = await import("./jobs");
    expect(JobSchema.safeParse({ kind: "nope" }).success).toBe(false);
  });
});
