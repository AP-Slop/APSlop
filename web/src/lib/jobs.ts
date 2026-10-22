import { after } from "next/server";
import { z } from "zod";
import { cloudflareEnv } from "@/lib/cloudflare";
import { ModelChoiceSchema } from "@/lib/models";
import { runProposal } from "@/lib/proposal-store";
import { runBuildFix } from "@/lib/build-fix";
import { runDraw } from "@/lib/design-store";
import { syncAppBySlug } from "@/lib/store";

/** Work that must finish even if the browser that asked for it goes away. */
export const JobSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("propose"), id: z.string().min(1), name: z.string().min(1), model: ModelChoiceSchema }),
  // A release reached GitHub (webhook): put its APK in the store. Takes a while when the store has to start.
  z.object({ kind: z.literal("sync"), slug: z.string().min(1), tag: z.string().min(1) }),
  // CI failed on a branch AI committed to (webhook): have AI commit a fix.
  z.object({ kind: z.literal("fix"), id: z.string().min(1), runId: z.number().int() }),
  // New app: AI draws the screens of a design before any code is written.
  z.object({ kind: z.literal("draw"), id: z.string().min(1), model: ModelChoiceSchema }),
]);
export type Job = z.infer<typeof JobSchema>;

type Queue = { send(body: Job): Promise<void> };

/** The Cloudflare Queue for jobs, or undefined under Node (docker / next dev). */
function jobQueue(): Queue | undefined {
  return cloudflareEnv<{ JOBS: Queue }>()?.JOBS;
}

/**
 * Run a job after the response is sent. On Cloudflare Workers a request's work stops soon after the
 * client disconnects, so the job goes through a Queue whose consumer (cloudflare/worker.ts) calls
 * POST /api/internal/jobs; under Node it simply runs in this process.
 */
export async function runInBackground(job: Job): Promise<void> {
  const queue = jobQueue();
  if (queue) await queue.send(job);
  else after(() => runJob(job));
}

export async function runJob(job: Job): Promise<void> {
  switch (job.kind) {
    case "propose":
      return runProposal(job.id, job.name, job.model);
    case "fix":
      return runBuildFix(job.id, job.runId);
    case "draw":
      return runDraw(job.id, job.model);
    case "sync":
      // The APK may still be missing (CI running); the next webhook or "Sync to store" catches up.
      await syncAppBySlug(job.slug, job.tag).catch((e) => console.warn(`sync of ${job.slug} failed:`, (e as Error).message));
      return;
  }
}
