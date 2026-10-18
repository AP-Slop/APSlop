import { auth } from "@/lib/auth";
import { findOwnProposal } from "@/lib/proposal-store";
import { ProposeForm } from "@/components/ProposeForm";
import { choiceForModel, modelOptions } from "@/lib/models";

export default async function AiPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { name } = await params;
  const { from } = await searchParams;
  const session = await auth();
  // "Edit request" on the review screen comes back here with the earlier request filled in.
  const previous = session?.user?.id && from ? await findOwnProposal(session.user.id, name, from) : null;
  const models = modelOptions().map(({ id, label, available }) => ({ id, label, available }));
  const initialModel = previous ? choiceForModel(previous.generation.model) : models.find((m) => m.available)?.id ?? "claude";
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
          initialPrompt={previous?.generation.prompt ?? ""}
          models={models}
          initialModel={initialModel}
        />
      ) : (
        <p className="mt-4 text-sm text-fg-muted">Sign in with GitHub to use this.</p>
      )}
    </div>
  );
}
