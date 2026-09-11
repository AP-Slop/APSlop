import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createIssue } from "@/lib/github";

const Body = z.object({ title: z.string().min(1).max(200), body: z.string().max(20000).default("") });

export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string }> }) => {
  const session = await requireSession();
  const { name } = await ctx.params;
  const { title, body } = Body.parse(await readJson(req));
  const issue = await createIssue(session.accessToken, name, title, body);
  return NextResponse.json({ number: issue.number, url: issue.html_url });
});
