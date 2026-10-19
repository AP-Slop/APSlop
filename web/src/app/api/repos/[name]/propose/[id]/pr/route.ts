import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBranchCommitAndPr, getRepo } from "@/lib/github";
import { requireReadyProposal } from "@/lib/proposal-store";

export const maxDuration = 120;

const Body = z.object({
  title: z.string().trim().min(1).max(256),
  body: z.string().max(60000).default(""),
});

/** Create the branch, commit and pull request for a reviewed proposal, as the signed-in user. */
export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string; id: string }> }) => {
  const session = await requireSession();
  const { name, id } = await ctx.params;
  const { title, body } = Body.parse(await readJson(req));
  const { generation, proposal } = await requireReadyProposal(session.user.id, name, id);
  const repo = await getRepo(name);
  const files = proposal.files
    .filter((f) => f.after !== null && f.after !== f.before)
    .map((f) => ({ path: f.path, content: f.after as string }));
  if (files.length === 0) throw Object.assign(new Error("AI did not change any file"), { status: 400 });
  // Claim the proposal so a second press cannot open a second pull request.
  const claimed = await prisma.generation.updateMany({
    where: { id: generation.id, status: "READY" },
    data: { status: "CREATING" },
  });
  if (claimed.count !== 1) throw Object.assign(new Error("The pull request is already being created"), { status: 409 });
  try {
    const branch = `apslop/${proposal.branch}-${Date.now().toString(36)}`;
    const note = `_Created by APSlop AI at the request of @${session.user.login}._`;
    const pr = await createBranchCommitAndPr(
      session.accessToken,
      name,
      repo.default_branch,
      branch,
      files,
      title,
      body.trim() ? `${body.trim()}\n\n---\n${note}` : note,
      proposal.baseSha,
    );
    await prisma.generation.update({ where: { id: generation.id }, data: { status: "DONE", prNumber: pr.number } });
    return NextResponse.json({ prNumber: pr.number, url: pr.htmlUrl });
  } catch (e) {
    await prisma.generation.update({ where: { id: generation.id }, data: { status: "READY" } });
    throw e;
  }
});
