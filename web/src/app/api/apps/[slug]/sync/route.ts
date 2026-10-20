import { NextResponse } from "next/server";
import { handle, jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncAppBySlug } from "@/lib/store";

export const maxDuration = 300;

export const POST = handle(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await requireSession();
  const { slug } = await ctx.params;
  // Only the app's owner gets "Sync to store"; releases reach the store on their own through the webhook.
  const owned = await prisma.app.findUnique({ where: { slug }, select: { ownerId: true } });
  if (!owned || owned.ownerId !== session.user.id) return jsonError("App not found.", 404);
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
