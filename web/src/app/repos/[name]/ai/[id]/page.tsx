import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { diffProposal } from "@/lib/proposal";
import { findOwnProposal } from "@/lib/proposal-store";
import { Card, CardHeader, LinkButton } from "@/components/ui";
import { Diff } from "@/components/Diff";
import { ReviewActions } from "@/components/ReviewActions";

export const dynamic = "force-dynamic";

function Notice({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Create PR with AI</h2>
      <p className="text-sm text-fg-muted">{children}</p>
      <LinkButton href={`/repos/${name}/ai`} variant="primary">Create PR with AI</LinkButton>
    </div>
  );
}

export default async function ReviewPage({ params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=/repos/${name}/ai/${id}`);
  const found = await findOwnProposal(session.user.id, name, id);
  if (!found) notFound();
  const { generation, proposal } = found;

  if (generation.status === "DONE" && generation.prNumber) redirect(`/repos/${name}/pulls/${generation.prNumber}`);
  if (generation.status === "CREATING") {
    return <Notice name={name}>The pull request is being created. Reload this page in a moment.</Notice>;
  }
  if (generation.status === "DISCARDED") return <Notice name={name}>This proposal was discarded.</Notice>;
  if (generation.status !== "READY" || !proposal) {
    return <Notice name={name}>{generation.error ?? "This proposal is not available."}</Notice>;
  }

  const diffs = diffProposal(proposal.files);
  const additions = diffs.reduce((a, d) => a + d.additions, 0);
  const deletions = diffs.reduce((a, d) => a + d.deletions, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Create PR with AI — review changes</h2>
        <p className="text-sm text-fg-muted mt-1">
          Nothing has been sent to GitHub yet. Check what AI changed, then create the pull request.
        </p>
      </div>

      <Card>
        <CardHeader>Your request</CardHeader>
        <div className="p-4 flex items-start gap-4 text-sm">
          <p className="flex-1 whitespace-pre-wrap">{generation.prompt}</p>
          <Link href={`/repos/${name}/ai?from=${generation.id}`} className="text-xs text-accent hover:underline shrink-0">
            Edit request
          </Link>
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          Files changed ({diffs.length}) <span className="ml-3 text-sm text-success">+{additions}</span>{" "}
          <span className="text-sm text-danger">−{deletions}</span>
        </h3>
        {diffs.length === 0 ? (
          <p className="text-sm text-fg-muted">AI did not change any file. Try Edit request or Regenerate.</p>
        ) : (
          <div className="space-y-4">
            {diffs.map((d) => (
              <Diff key={d.path} filename={d.path} status={d.status} additions={d.additions} deletions={d.deletions} patch={d.patch} />
            ))}
          </div>
        )}
      </div>

      <ReviewActions name={name} id={generation.id} prompt={generation.prompt} title={proposal.title} body={proposal.body} canCreate={diffs.length > 0} />
    </div>
  );
}
