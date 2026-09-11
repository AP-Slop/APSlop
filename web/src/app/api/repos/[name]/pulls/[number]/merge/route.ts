import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { mergePull } from "@/lib/github";

export const POST = handle(async (_req: Request, ctx: { params: Promise<{ name: string; number: string }> }) => {
  const session = await requireSession();
  const { name, number } = await ctx.params;
  const result = await mergePull(session.accessToken, name, Number(number));
  return NextResponse.json({ merged: result.merged, sha: result.sha, message: result.message });
});
