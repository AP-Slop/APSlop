import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createIssueComment } from "@/lib/github";

const Body = z.object({ body: z.string().trim().min(1).max(20000) });

export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string; number: string }> }) => {
  const session = await requireSession();
  const { name, number } = await ctx.params;
  const { body } = Body.parse(await readJson(req));
  const comment = await createIssueComment(session.accessToken, name, Number(number), body);
  return NextResponse.json({ id: comment.id });
});
