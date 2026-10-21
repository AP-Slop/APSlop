import { after } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";
import { ModelChoiceSchema } from "@/lib/models";
import { runProposal } from "@/lib/proposal-store";

/** Work that must finish even if the browser that asked for it goes away. */
export const JobSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("propose"), id: z.string().min(1), name: z.string().min(1), model: ModelChoiceSchema }),
]);
export type Job = z.infer<typeof JobSchema>;

type Queue = { send(body: Job): Promise<void> };

/** The Cloudflare Queue for jobs, or undefined under Node (docker / next dev). */
function jobQueue(): Queue | undefined {
  try {
    return (getCloudflareContext().env as { JOBS?: Queue }).JOBS;
  } catch {
    return undefined;
  }
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
  }
}
