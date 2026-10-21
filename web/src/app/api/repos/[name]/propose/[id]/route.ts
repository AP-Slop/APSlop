import { NextResponse } from "next/server";
import { handle, jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { findOwnProposal } from "@/lib/proposal-store";

/** Where a proposal stands: PENDING while AI is working, then READY (open the review screen) or FAILED. */
export const GET = handle(async (_req: Request, ctx: { params: Promise<{ name: string; id: string }> }) => {
  const session = await requireSession();
  const { name, id } = await ctx.params;
  const found = await findOwnProposal(session.user.id, name, id);
  if (!found) return jsonError("Proposal not found", 404);
  return NextResponse.json({ status: found.generation.status, error: found.generation.error });
});
