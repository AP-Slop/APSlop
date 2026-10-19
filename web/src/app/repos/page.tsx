import Link from "next/link";
import { listOrgRepos } from "@/lib/github";
import { prisma } from "@/lib/db";
import { AppStatusBadge, Card, Container, Empty, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ReposPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let repos: Awaited<ReturnType<typeof listOrgRepos>> = [];
  let error: string | null = null;
  try {
    repos = await listOrgRepos(q);
  } catch (e) {
    error = (e as Error).message;
  }
  const apps = await prisma.app.findMany({ where: { repoFullName: { in: repos.map((r) => r.fullName) } } });
  const appByRepo = new Map(apps.map((a) => [a.repoFullName, a]));

  return (
    <Container>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h1 className="text-xl font-semibold">Repositories</h1>
        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Search repositories" className="rounded-md border border-border px-3 py-1.5 text-sm w-64" />
          <button className="rounded-md border border-border bg-canvas-subtle px-3 py-1.5 text-sm">Search</button>
        </form>
      </div>
      {error ? (
        <Empty>Could not load the repositories: {error}</Empty>
      ) : repos.length === 0 ? (
        <Empty>{q ? "No repositories match your search." : "No repositories yet."}</Empty>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {repos.map((r) => {
              const app = appByRepo.get(r.fullName);
              return (
                <li key={r.fullName} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/repos/${r.name}`} className="text-accent font-semibold hover:underline">
                      {r.name}
                    </Link>
                    <span className="text-[10px] rounded-full border border-border px-1.5 text-fg-muted">Public</span>
                    {app && <AppStatusBadge status={app.status} version={app.latestVersion} />}
                  </div>
                  {r.description && <p className="text-sm text-fg-muted mt-0.5">{r.description}</p>}
                  <div className="text-xs text-fg-muted mt-1 flex gap-4">
                    {r.language && <span>{r.language}</span>}
                    <span>★ {r.stars}</span>
                    <span>Issues {r.openIssues}</span>
                    <span>Pull requests {r.openPulls}</span>
                    <span>Updated {timeAgo(r.updatedAt)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </Container>
  );
}
