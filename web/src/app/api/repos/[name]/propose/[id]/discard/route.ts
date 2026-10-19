import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireReadyProposal } from "@/lib/proposal-store";

/** Throw away a proposal that is awaiting review. Nothing was sent to GitHub, so nothing to undo there. */
export const POST = handle(async (_req: Request, ctx: { params: Promise<{ name: string; id: string }> }) => {
  const session = await requireSession();
  const { name, id } = await ctx.params;
  const { generation } = await requireReadyProposal(session.user.id, name, id);
  await prisma.generation.update({ where: { id: generation.id }, data: { status: "DISCARDED" } });
  return NextResponse.json({ ok: true });
});
