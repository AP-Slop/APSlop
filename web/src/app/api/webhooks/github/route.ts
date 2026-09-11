import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { syncAppBySlug } from "@/lib/store";

export const maxDuration = 300;

function verify(raw: string, signature: string | null): boolean {
  const secret = env().GITHUB_WEBHOOK_SECRET;
  if (!secret) return true; // not configured: accept (dev only)
  if (!signature?.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

type ReleaseEvent = {
  action: string;
  release?: { tag_name: string; draft: boolean; prerelease: boolean };
  repository?: { full_name: string };
};

type WorkflowRunEvent = {
  action: string;
  workflow_run?: { name: string; event: string; conclusion: string | null; head_branch: string | null };
  repository?: { full_name: string };
};

/** Sync an app's release into the store; APK may still be missing (CI running), so never fail the hook. */
async function syncForRepo(fullName: string, tag: string) {
  const app = await prisma.app.findUnique({ where: { repoFullName: fullName } });
  if (!app) return NextResponse.json({ ignored: "unknown app" });
  try {
    const updated = await syncAppBySlug(app.slug, tag);
    return NextResponse.json({ synced: updated.slug, version: updated.latestVersion });
  } catch (e) {
    console.warn("webhook sync failed:", (e as Error).message);
    return NextResponse.json({ synced: false, error: (e as Error).message }, { status: 202 });
  }
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verify(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "署名が一致しません" }, { status: 401 });
  }
  const event = req.headers.get("x-github-event");
  if (event === "ping") return NextResponse.json({ ok: true });

  // Reliable path: the template's "Release" workflow finished (APK is attached by then).
  if (event === "workflow_run") {
    const payload = JSON.parse(raw) as WorkflowRunEvent;
    const run = payload.workflow_run;
    const fullName = payload.repository?.full_name;
    if (payload.action !== "completed" || run?.conclusion !== "success" || !fullName) {
      return NextResponse.json({ ignored: "workflow not completed successfully" });
    }
    // head_branch carries the tag name for tag-triggered runs.
    const tag = run.event === "push" && run.head_branch?.startsWith("v") ? run.head_branch : undefined;
    if (!tag) return NextResponse.json({ ignored: "not a release tag run" });
    return syncForRepo(fullName, tag);
  }

  // Best-effort path: release created by hand with the APK already attached.
  if (event !== "release") return NextResponse.json({ ignored: event });
  const payload = JSON.parse(raw) as ReleaseEvent;
  if (!["published", "released", "edited"].includes(payload.action)) {
    return NextResponse.json({ ignored: payload.action });
  }
  const fullName = payload.repository?.full_name;
  const tag = payload.release?.tag_name;
  if (!fullName || !tag || payload.release?.draft) return NextResponse.json({ ignored: "no release" });
  return syncForRepo(fullName, tag);
}
