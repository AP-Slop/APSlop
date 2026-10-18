import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createProposal } from "@/lib/proposal-store";
import { ModelChoiceSchema } from "@/lib/models";

export const maxDuration = 600;

const Body = z.object({ prompt: z.string().trim().min(5).max(8000), model: ModelChoiceSchema.default("claude") });

/** Generate AI changes for review. The pull request is created later from the review screen. */
export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string }> }) => {
  const session = await requireSession();
  const { name } = await ctx.params;
  const { prompt, model } = Body.parse(await readJson(req));
  const id = await createProposal(session.user.id, name, prompt, model);
  return NextResponse.json({ id });
});
