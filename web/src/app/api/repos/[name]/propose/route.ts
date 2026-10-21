import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { startProposal } from "@/lib/proposal-store";
import { runInBackground } from "@/lib/jobs";
import { ModelChoiceSchema } from "@/lib/models";

const Body = z.object({ prompt: z.string().trim().min(5).max(8000), model: ModelChoiceSchema.default("claude") });

/**
 * Start generating AI changes for review; AI keeps working even if the page is closed.
 * Poll GET ./propose/{id} for the result. The pull request is created later from the review screen.
 */
export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string }> }) => {
  const session = await requireSession();
  const { name } = await ctx.params;
  const { prompt, model } = Body.parse(await readJson(req));
  const id = await startProposal(session.user.id, name, prompt, model);
  await runInBackground({ kind: "propose", id, name, model });
  return NextResponse.json({ id });
});
