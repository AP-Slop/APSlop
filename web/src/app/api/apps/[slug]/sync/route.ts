import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { syncAppBySlug } from "@/lib/store";

export const maxDuration = 300;

export const POST = handle(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  await requireSession();
  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { tag?: string };
  const app = await syncAppBySlug(slug, body.tag);
  return NextResponse.json({
    slug: app.slug,
    status: app.status,
    latestVersion: app.latestVersion,
    latestVersionCode: app.latestVersionCode,
    apkName: app.latestApkName,
  });
});
