import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { proposeChanges } from "@/lib/ai";
import { env } from "@/lib/env";
import { createBranchCommitAndPr, getAllTextFiles, getRepo } from "@/lib/github";

export const maxDuration = 600;

const Body = z.object({ prompt: z.string().min(5).max(8000) });

export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string }> }) => {
  const session = await requireSession();
  const { name } = await ctx.params;
  const { prompt } = Body.parse(await readJson(req));
  const repo = await getRepo(name);
  const generation = await prisma.generation.create({
    data: {
      userId: session.user.id,
      kind: "MODIFY",
      prompt,
      model: env().ANTHROPIC_MODEL,
      repoFullName: repo.full_name,
    },
  });
  try {
    const current = await getAllTextFiles(name, repo.default_branch);
    const proposal = await proposeChanges(prompt, current);
    const branch = `openap/${proposal.branch}-${Date.now().toString(36)}`;
    const body = `${proposal.body}\n\n---\n_OpenAP の AI が @${session.user.login} の依頼で作成した Pull Request です。_`;
    const pr = await createBranchCommitAndPr(
      session.accessToken,
      name,
      repo.default_branch,
      branch,
      proposal.files,
      proposal.title,
      body,
    );
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "DONE", prNumber: pr.number, finishedAt: new Date() },
    });
    return NextResponse.json({ prNumber: pr.number, url: pr.htmlUrl, title: proposal.title });
  } catch (e) {
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "FAILED", error: (e as Error).message, finishedAt: new Date() },
    });
    throw e;
  }
});
