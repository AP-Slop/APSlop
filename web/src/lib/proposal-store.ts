import { prisma } from "@/lib/db";
import { proposeChanges } from "@/lib/ai";
import { env } from "@/lib/env";
import { getBranchSha, getRepo, getTextFileAt, getTextFilesAt } from "@/lib/github";
import { parseStoredProposal, type StoredProposal } from "@/lib/proposal";

function httpError(message: string, status: number): Error {
  return Object.assign(new Error(message), { status });
}

/**
 * Ask AI for changes to a repo and keep them for review. Nothing is sent to GitHub.
 * Returns the Generation id (status READY) or throws after marking it FAILED.
 */
export async function createProposal(userId: string, name: string, prompt: string): Promise<string> {
  const repo = await getRepo(name);
  const generation = await prisma.generation.create({
    data: { userId, kind: "MODIFY", prompt, model: env().ANTHROPIC_MODEL, repoFullName: repo.full_name },
  });
  try {
    const baseSha = await getBranchSha(name, repo.default_branch);
    const current = await getTextFilesAt(name, baseSha);
    const proposal = await proposeChanges(prompt, current);
    const byPath = new Map(current.map((f) => [f.path, f.content]));
    const files = await Promise.all(
      proposal.files.map(async (f) => ({
        path: f.path,
        // Files skipped from the AI context (large, over budget) still need their real "before".
        before: byPath.has(f.path) ? byPath.get(f.path)! : await getTextFileAt(name, f.path, baseSha),
        after: f.content,
      })),
    );
    const stored: StoredProposal = { title: proposal.title, body: proposal.body, branch: proposal.branch, baseSha, files };
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "READY", result: JSON.stringify(stored), finishedAt: new Date() },
    });
    return generation.id;
  } catch (e) {
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "FAILED", error: (e as Error).message, finishedAt: new Date() },
    });
    throw e;
  }
}

/** A MODIFY generation of this repo owned by this user, or null. */
export async function findOwnProposal(userId: string, name: string, id: string) {
  const g = await prisma.generation.findUnique({ where: { id } });
  if (!g || g.userId !== userId || g.kind !== "MODIFY" || !g.repoFullName?.endsWith(`/${name}`)) return null;
  return { generation: g, proposal: parseStoredProposal(g.result) };
}

/** Load a proposal that is still awaiting review, or throw a 4xx error. */
export async function requireReadyProposal(userId: string, name: string, id: string) {
  const found = await findOwnProposal(userId, name, id);
  if (!found) throw httpError("Proposal not found", 404);
  if (found.generation.status !== "READY" || !found.proposal) {
    throw httpError("This proposal is no longer waiting for review", 409);
  }
  return { generation: found.generation, proposal: found.proposal };
}
