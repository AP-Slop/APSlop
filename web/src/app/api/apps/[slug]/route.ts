import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SummarySchema, deleteApp, updateSummary } from "@/lib/app-settings";

type Ctx = { params: Promise<{ slug: string }> };

/** The app, if the signed-in user owns it. Anyone else gets the same 404 as for an app that does not exist. */
async function ownApp(ctx: Ctx) {
  const session = await requireSession();
  const { slug } = await ctx.params;
  const app = await prisma.app.findUnique({ where: { slug } });
  return app && app.ownerId === session.user.id ? app : null;
}

const PatchBody = z.object({ summary: SummarySchema });

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const app = await ownApp(ctx);
  if (!app) return jsonError("App not found.", 404);
  const parsed = PatchBody.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(parsed.error.issues[0].message);
  const updated = await updateSummary(app, parsed.data.summary);
  return NextResponse.json({ summary: updated.summary, published: updated.status === "PUBLISHED" });
});

const DeleteBody = z.object({ confirm: z.string() });

/** The body must repeat the app's repository name, as typed by the user. */
export const DELETE = handle(async (req: Request, ctx: Ctx) => {
  const app = await ownApp(ctx);
  if (!app) return jsonError("App not found.", 404);
  const { confirm } = DeleteBody.parse(await readJson(req));
  if (confirm.trim() !== app.slug) return jsonError(`Type ${app.slug} to confirm.`);
  await deleteApp(app);
  return NextResponse.json({ deleted: app.slug });
});
