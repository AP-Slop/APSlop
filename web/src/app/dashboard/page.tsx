import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { repoName } from "@/lib/github";
import { AppStatusBadge, Badge, Card, CardHeader, Container, Empty, LinkButton, formatDate } from "@/components/ui";

export const dynamic = "force-dynamic";

/** Where an AI history row leads: the PR, the review screen of a pending proposal, or the repo. */
function generationHref(g: { id: string; repoFullName: string | null; prNumber: number | null; status: string; kind: string }) {
  const repo = `/repos/${repoName(g.repoFullName!)}`;
  if (g.prNumber) return `${repo}/pulls/${g.prNumber}`;
  if (g.kind === "MODIFY" && g.status === "READY") return `${repo}/ai/${g.id}`;
  return repo;
}

function generationState(status: string): { label: string; tone: "muted" | "success" | "danger" | "attention" } {
  switch (status) {
    case "DONE":
      return { label: "Done", tone: "success" };
    case "FAILED":
      return { label: "Failed", tone: "danger" };
    case "READY":
      return { label: "Ready to review", tone: "attention" };
    case "DISCARDED":
      return { label: "Discarded", tone: "muted" };
    default:
      return { label: "Running", tone: "muted" };
  }
}

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");
  const [apps, generations] = await Promise.all([
    prisma.app.findMany({ where: { ownerId: session.user.id }, orderBy: { updatedAt: "desc" } }),
    prisma.generation.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <LinkButton href="/new" variant="primary">New app</LinkButton>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>My apps ({apps.length})</CardHeader>
          {apps.length === 0 ? (
            <Empty>You have no apps yet.</Empty>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {apps.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/repos/${repoName(a.repoFullName)}`} className="font-semibold text-accent hover:underline">{a.name}</Link>
                    <div className="text-xs text-fg-muted truncate">{a.repoFullName}</div>
                  </div>
                  <AppStatusBadge status={a.status} version={a.latestVersion} />
                  <Link href={`/repos/${repoName(a.repoFullName)}/settings`} className="text-xs text-accent hover:underline">Settings</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader>AI history</CardHeader>
          {generations.length === 0 ? (
            <Empty>Nothing yet.</Empty>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {generations.map((g) => {
                const state = generationState(g.status);
                return (
                  <li key={g.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge>{g.kind === "CREATE" ? "New app" : "PR"}</Badge>
                      <Badge tone={state.tone}>{state.label}</Badge>
                      <span className="text-xs text-fg-muted">{formatDate(g.createdAt)}</span>
                      {g.repoFullName && (
                        <Link href={generationHref(g)} className="text-xs text-accent hover:underline ml-auto">
                          {repoName(g.repoFullName)}{g.prNumber ? ` #${g.prNumber}` : ""}
                        </Link>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2">{g.prompt}</p>
                    {g.error && <p className="mt-1 text-xs text-danger">{g.error}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </Container>
  );
}
