import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { fdroidRepoUrl, publicEnv } from "@/lib/env";
import { buttonClass, Card, CardHeader, Container, Empty, timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const apps = await prisma.app.findMany({
    where: { status: "PUBLISHED" },
    include: { owner: true },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });
  const repoUrl = fdroidRepoUrl();

  const storeAppUrl = publicEnv.storeAppUrl;

  return (
    <>
      <section className="bg-canvas-subtle border-b border-border">
        <Container className="py-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            {publicEnv.siteName} — apps made by everyone on campus
          </h1>
          <p className="mt-3 text-fg-muted max-w-2xl">
            Browse apps built by students and install them on your phone. Want to build one? Describe it and AI writes the code.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            {storeAppUrl && (
              <a href={storeAppUrl} className={buttonClass("primary")}>Download the store app</a>
            )}
            <Link href="/new" className="text-accent hover:underline">Build your own app →</Link>
          </div>
        </Container>
      </section>

      <Container>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Published apps</h2>
          <span className="text-xs text-fg-muted">{apps.length} {apps.length === 1 ? "app" : "apps"}</span>
        </div>
        {apps.length === 0 ? (
          <Empty>No apps have been published yet. Build the first one!</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <Link key={app.id} href={`/apps/${app.slug}`} className="block group">
                <Card className="p-4 h-full group-hover:border-accent transition-colors">
                  <div className="flex items-start gap-3">
                    {app.iconUrl ? (
                      <Image src={app.iconUrl} alt="" width={48} height={48} className="rounded-xl border border-border" unoptimized />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-canvas-subtle border border-border flex items-center justify-center text-lg">
                        📱
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-accent group-hover:underline truncate">{app.name}</div>
                      <div className="text-xs text-fg-muted truncate">
                        {app.owner.login} · v{app.latestVersion ?? "-"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm line-clamp-2">{app.summary}</p>
                  <div className="mt-3 text-xs text-fg-muted">Updated {timeAgo(app.updatedAt)}</div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Card className="mt-12 scroll-mt-4" id="install">
          <CardHeader>Install on your phone</CardHeader>
          <ol className="p-4 space-y-4 text-sm">
            <li className="flex flex-wrap items-center gap-3">
              <span>1. Install the {publicEnv.siteName} store app (or any F-Droid client)</span>
              {storeAppUrl && (
                <a href={storeAppUrl} className={`${buttonClass()} ml-auto`}>Download the store app</a>
              )}
            </li>
            <li>
              2. Add the repository <code className="font-mono bg-canvas-subtle px-1 rounded">{repoUrl}</code>{" "}
              <span className="text-fg-muted">(already set in the {publicEnv.siteName} store app)</span>
            </li>
            <li>3. Pick an app from the list and install it</li>
          </ol>
        </Card>
      </Container>
    </>
  );
}
