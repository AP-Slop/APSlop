import { auth } from "@/lib/auth";
import { findOwnProposal } from "@/lib/proposal-store";
import { ProposeForm } from "@/components/ProposeForm";
import { SignInRequired } from "@/components/SignInRequired";
import { choiceForModel, modelOptions, preferredModel } from "@/lib/models";
import { prisma } from "@/lib/db";
import { getIssue } from "@/lib/github";

/** "Create PR with AI" on an issue starts from the issue's title and description. */
async function issuePrompt(name: string, number: number): Promise<string | null> {
  if (!Number.isInteger(number) || number < 1) return null;
  const issue = await getIssue(name, number).catch(() => null);
  if (!issue || issue.pull_request) return null;
  return `Fix issue #${number}: ${issue.title}\n\n${issue.body ?? ""}`.trim().slice(0, 8000);
}

export default async function AiPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ from?: string; issue?: string }>;
}) {
  const { name } = await params;
  const { from, issue } = await searchParams;
  const session = await auth();
  // "Edit request" on the review screen comes back here with the earlier request filled in.
  const previous = session?.user?.id && from ? await findOwnProposal(session.user.id, name, from) : null;
  const fromIssue = !previous && issue ? await issuePrompt(name, Number(issue)) : null;
  const models = modelOptions().map(({ id, label, available }) => ({ id, label, available }));
  const last = session?.user?.id && !previous
    ? await prisma.generation.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, select: { model: true } })
    : null;
  const initialModel = previous ? choiceForModel(previous.generation.model) : preferredModel(last?.model);
  return (
    <div>
      <h2 className="text-lg font-semibold">Create PR with AI</h2>
      <p className="text-sm text-fg-muted mt-1">
        Describe the change you want. AI reads the whole repository and proposes the change. You review the diff before
        the pull request is created. Works on your own repositories and on other people&apos;s.
      </p>
      {session ? (
        <ProposeForm
          name={name}
          initialPrompt={previous?.generation.prompt ?? fromIssue ?? ""}
          models={models}
          initialModel={initialModel}
        />
      ) : (
        <div className="mt-4">
          <SignInRequired returnTo={`/repos/${name}/ai`} compact />
        </div>
      )}
    </div>
  );
}
