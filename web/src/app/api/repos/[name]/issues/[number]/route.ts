import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { setIssueState } from "@/lib/github";

const Body = z.object({ state: z.enum(["open", "closed"]) });

/** Close or reopen an issue as the signed-in user. */
export const PATCH = handle(async (req: Request, ctx: { params: Promise<{ name: string; number: string }> }) => {
  const session = await requireSession();
  const { name, number } = await ctx.params;
  const { state } = Body.parse(await readJson(req));
  const issue = await setIssueState(session.accessToken, name, Number(number), state);
  return NextResponse.json({ state: issue.state });
});
