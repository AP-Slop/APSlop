import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { handle, jsonError, readJson } from "@/lib/api";
import { env } from "@/lib/env";
import { JobSchema, runJob } from "@/lib/jobs";

export const maxDuration = 900;

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Runs one background job. Called only by the Queue consumer in cloudflare/worker.ts. */
export const POST = handle(async (req: Request) => {
  const token = req.headers.get("x-apslop-job-token") ?? "";
  if (!timingSafeEqual(digest(token), digest(env().AUTH_SECRET))) return jsonError("Forbidden", 403);
  await runJob(JobSchema.parse(await readJson(req)));
  return NextResponse.json({ ok: true });
});
