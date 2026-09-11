import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/github";
import { prisma } from "@/lib/db";
import { Badge, Container } from "@/components/ui";
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
  const app = await prisma.app.findUnique({ where: { repoFullName: repo.full_name } });

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
                <Badge tone={app.status === "PUBLISHED" ? "success" : "attention"}>
                  {app.status === "PUBLISHED" ? `ストア公開中 v${app.latestVersion}` : "ストア未公開"}
                </Badge>
              </Link>
            )}
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="ml-auto text-xs text-fg-muted hover:text-accent">
              GitHub で開く ↗
            </a>
          </div>
          {repo.description && <p className="text-sm text-fg-muted mt-1">{repo.description}</p>}
          <RepoTabs name={name} openIssues={repo.open_issues_count} />
        </Container>
      </div>
      <Container>{children}</Container>
    </>
  );
}
