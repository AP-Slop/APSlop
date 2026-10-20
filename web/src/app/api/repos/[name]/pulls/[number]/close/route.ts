import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { closePull } from "@/lib/github";

/** Close a pull request without merging, as the signed-in user (GitHub decides whether they may). */
export const POST = handle(async (_req: Request, ctx: { params: Promise<{ name: string; number: string }> }) => {
  const session = await requireSession();
  const { name, number } = await ctx.params;
  const pr = await closePull(session.accessToken, name, Number(number));
  return NextResponse.json({ state: pr.state });
});
