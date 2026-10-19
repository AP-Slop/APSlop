import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRepo, getRepoCounts } from "@/lib/github";
import { prisma } from "@/lib/db";
import { AppStatusBadge, Badge, Container, LinkButton } from "@/components/ui";
import { RepoTabs } from "@/components/RepoTabs";

export const dynamic = "force-dynamic";

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  let repo: Awaited<ReturnType<typeof getRepo>>;
  try {
    repo = await getRepo(name);
  } catch {
    notFound();
  }
  const [app, counts, session] = await Promise.all([
    prisma.app.findUnique({ where: { repoFullName: repo.full_name } }),
    getRepoCounts(name).catch(() => ({ openIssues: 0, openPulls: 0 })),
    auth(),
  ]);
  const isOwner = !!app && !!session?.user?.id && app.ownerId === session.user.id;

  return (
    <>
      <div className="bg-canvas-subtle border-b border-border">
        <Container className="pb-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-fg-muted">{repo.owner.login} /</span>
            <Link href={`/repos/${name}`} className="text-xl font-semibold text-accent hover:underline">
              {repo.name}
            </Link>
            <Badge>Public</Badge>
            {app && (
              <Link href={`/apps/${app.slug}`}>
                <AppStatusBadge status={app.status} version={app.latestVersion} />
              </Link>
            )}
            <div className="ml-auto flex items-center gap-4">
              <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
                Open on GitHub ↗
              </a>
              <LinkButton href={`/repos/${name}/ai`} variant="primary">Create PR with AI</LinkButton>
            </div>
          </div>
          {repo.description && <p className="text-sm text-fg-muted mt-1">{repo.description}</p>}
          <RepoTabs name={name} openIssues={counts.openIssues} openPulls={counts.openPulls} showSettings={isOwner} />
        </Container>
      </div>
      <Container>{children}</Container>
    </>
  );
}
