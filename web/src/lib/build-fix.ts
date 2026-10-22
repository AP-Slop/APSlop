import { prisma } from "@/lib/db";
import { fixBuild } from "@/lib/ai";
import { extractBuildErrors } from "@/lib/build-log";
import { commitFiles, getBranchSha, getFailedJobLog, getTextFilesAt, repoName } from "@/lib/github";
import { choiceForModel } from "@/lib/models";

/** How many times AI may commit a fix before the build is left as failed. */
export const MAX_FIX_ROUNDS = 2;

/** Generation.buildStatus: the CI build of what AI committed. */
export type BuildStatus = "BUILDING" | "FIXING" | "PASSED" | "FAILED";

export function isBuildRunning(status: string | null | undefined): boolean {
  return status === "BUILDING" || status === "FIXING";
}

export type CiRun = { repoFullName: string; branch: string; conclusion: string; runUrl: string };
export type CiOutcome = { action: "ignored" } | { action: "passed" | "failed" | "fix"; id: string; round?: number };

/**
 * Record a finished CI run on the generation waiting for a build of that branch.
 * "fix" means a fix round was started: the caller queues the fix job (jobs.ts imports this module).
 */
export async function recordCiRun(run: CiRun): Promise<CiOutcome> {
  const g = await prisma.generation.findFirst({
    where: { repoFullName: run.repoFullName, buildBranch: run.branch, buildStatus: { in: ["BUILDING", "FIXING"] } },
    orderBy: { createdAt: "desc" },
  });
  if (!g) return { action: "ignored" };
  if (run.conclusion === "success") {
    await prisma.generation.update({ where: { id: g.id }, data: { buildStatus: "PASSED", buildRunUrl: run.runUrl } });
    return { action: "passed", id: g.id };
  }
  // Only a failed build has a log to fix from; a cancelled or timed-out run is just reported.
  if (run.conclusion !== "failure" || g.buildRounds >= MAX_FIX_ROUNDS) {
    await prisma.generation.update({ where: { id: g.id }, data: { buildStatus: "FAILED", buildRunUrl: run.runUrl } });
    return { action: "failed", id: g.id };
  }
  const round = g.buildRounds + 1;
  await prisma.generation.update({
    where: { id: g.id },
    data: { buildStatus: "FIXING", buildRounds: round, buildRunUrl: run.runUrl },
  });
  return { action: "fix", id: g.id, round };
}

/**
 * Ask AI to fix the build that failed in CI run `runId` and commit the fix on the generation's branch.
 * CI runs again on that commit and the webhook records the result (another round, PASSED or FAILED).
 */
export async function runBuildFix(id: string, runId: number): Promise<void> {
  const g = await prisma.generation.findUnique({ where: { id } });
  if (!g || g.buildStatus !== "FIXING" || !g.repoFullName || !g.buildBranch) return;
  const name = repoName(g.repoFullName);
  try {
    const log = await getFailedJobLog(name, runId);
    if (!log) throw new Error("GitHub has no log of the failed job.");
    const errors = extractBuildErrors(log);
    const head = await getBranchSha(name, g.buildBranch);
    const files = await getTextFilesAt(name, head);
    const fix = await fixBuild(errors, files, choiceForModel(g.model));
    if (fix.files.length === 0) throw new Error("AI found nothing to change.");
    await commitFiles(
      name,
      g.buildBranch,
      fix.files,
      `fix: ${fix.summary}\n\nBuild fix ${g.buildRounds}/${MAX_FIX_ROUNDS} by APSlop AI, from the CI log of ${g.buildRunUrl ?? "the failed run"}.`,
    );
  } catch (e) {
    await prisma.generation.update({
      where: { id },
      data: { buildStatus: "FAILED", error: `AI could not fix the build (round ${g.buildRounds}): ${(e as Error).message}` },
    });
  }
}
