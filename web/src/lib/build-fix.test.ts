import { afterEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const findUnique = vi.fn();
const update = vi.fn(async () => ({}));
const getFailedJobLog = vi.fn(async (): Promise<string | null> => "2026-10-22T10:10:18.3176261Z e: file:///home/runner/work/r/r/A.kt:1:1 Unresolved reference: foo");
const getBranchSha = vi.fn(async () => "head1");
const getTextFilesAt = vi.fn(async () => [{ path: "A.kt", content: "foo" }]);
const commitFiles = vi.fn(async () => "commit1");
const fixBuild = vi.fn();

vi.mock("@/lib/db", () => ({ prisma: { generation: { findFirst, findUnique, update } } }));
vi.mock("@/lib/github", () => ({
  repoName: (full: string) => full.split("/")[1],
  getFailedJobLog,
  getBranchSha,
  getTextFilesAt,
  commitFiles,
}));
vi.mock("@/lib/ai", () => ({ fixBuild }));
vi.mock("@/lib/models", () => ({ choiceForModel: (m: string) => (m.startsWith("deepseek") ? "deepseek" : "claude") }));

const { MAX_FIX_ROUNDS, recordCiRun, runBuildFix } = await import("./build-fix");

const run = { repoFullName: "AP-Slop/r", branch: "main", conclusion: "failure", runUrl: "https://github.com/AP-Slop/r/actions/runs/1" };
const waiting = { id: "g1", buildRounds: 0 };

afterEach(() => vi.clearAllMocks());

describe("recordCiRun", () => {
  it("ignores a run no generation waits for", async () => {
    findFirst.mockResolvedValueOnce(null);
    expect(await recordCiRun(run)).toEqual({ action: "ignored" });
    expect(update).not.toHaveBeenCalled();
  });

  it("marks a successful build as passed", async () => {
    findFirst.mockResolvedValueOnce(waiting);
    expect(await recordCiRun({ ...run, conclusion: "success" })).toEqual({ action: "passed", id: "g1" });
    expect(update).toHaveBeenCalledWith({ where: { id: "g1" }, data: { buildStatus: "PASSED", buildRunUrl: run.runUrl } });
  });

  it("starts a fix round on a failed build", async () => {
    findFirst.mockResolvedValueOnce(waiting);
    expect(await recordCiRun(run)).toEqual({ action: "fix", id: "g1", round: 1 });
    expect(update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { buildStatus: "FIXING", buildRounds: 1, buildRunUrl: run.runUrl },
    });
  });

  it("gives up after the last round", async () => {
    findFirst.mockResolvedValueOnce({ ...waiting, buildRounds: MAX_FIX_ROUNDS });
    expect(await recordCiRun(run)).toEqual({ action: "failed", id: "g1" });
    expect(update).toHaveBeenCalledWith({ where: { id: "g1" }, data: { buildStatus: "FAILED", buildRunUrl: run.runUrl } });
  });

  it("does not try to fix a cancelled run", async () => {
    findFirst.mockResolvedValueOnce(waiting);
    expect(await recordCiRun({ ...run, conclusion: "cancelled" })).toEqual({ action: "failed", id: "g1" });
  });
});

describe("runBuildFix", () => {
  const fixing = { id: "g1", buildStatus: "FIXING", buildRounds: 1, repoFullName: "AP-Slop/r", buildBranch: "main", model: "claude-opus-5", buildRunUrl: run.runUrl };

  it("commits what AI changed on the generation's branch", async () => {
    findUnique.mockResolvedValueOnce(fixing);
    fixBuild.mockResolvedValueOnce({ summary: "rename the setter", files: [{ path: "A.kt", content: "bar" }] });
    await runBuildFix("g1", 1);
    expect(fixBuild).toHaveBeenCalledWith("e: A.kt:1:1 Unresolved reference: foo", [{ path: "A.kt", content: "foo" }], "claude");
    expect(commitFiles).toHaveBeenCalledWith("r", "main", [{ path: "A.kt", content: "bar" }], expect.stringContaining("fix: rename the setter"));
    expect(update).not.toHaveBeenCalled();
  });

  it("does nothing for a generation that is not fixing", async () => {
    findUnique.mockResolvedValueOnce({ ...fixing, buildStatus: "PASSED" });
    await runBuildFix("g1", 1);
    expect(fixBuild).not.toHaveBeenCalled();
  });

  it("marks the build failed when AI changes nothing", async () => {
    findUnique.mockResolvedValueOnce(fixing);
    fixBuild.mockResolvedValueOnce({ summary: "nothing", files: [] });
    await runBuildFix("g1", 1);
    expect(commitFiles).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { buildStatus: "FAILED", error: expect.stringContaining("AI found nothing to change") },
    });
  });

  it("marks the build failed when the log is gone", async () => {
    findUnique.mockResolvedValueOnce(fixing);
    getFailedJobLog.mockResolvedValueOnce(null);
    await runBuildFix("g1", 1);
    expect(update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { buildStatus: "FAILED", error: expect.stringContaining("no log") },
    });
  });
});
