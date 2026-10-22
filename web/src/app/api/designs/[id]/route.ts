import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runInBackground } from "@/lib/jobs";
import { choiceForModel } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

const Patch = z.object({ plan: z.string().max(4000).optional(), redraw: z.boolean().optional() });

/** Edits to the plan text, or "draw again" after a failure. */
export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { id } = await ctx.params;
  const body = Patch.parse(await readJson(req));
  const design = await prisma.design.findFirst({ where: { id, userId: session.user.id } });
  if (!design) return NextResponse.json({ error: "No such design." }, { status: 404 });
  if (body.redraw) {
    await prisma.design.update({ where: { id }, data: { status: "DRAWING", error: null } });
    await runInBackground({ kind: "draw", id, model: choiceForModel(design.model) });
    return NextResponse.json({ ok: true });
  }
  if (body.plan !== undefined) await prisma.design.update({ where: { id }, data: { plan: body.plan } });
  return NextResponse.json({ ok: true });
});
