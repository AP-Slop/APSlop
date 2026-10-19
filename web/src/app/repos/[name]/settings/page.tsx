import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { org } from "@/lib/github";
import { Card, CardHeader, LinkButton } from "@/components/ui";
import { SignInRequired } from "@/components/SignInRequired";
import { DeleteApp, SummaryForm } from "@/components/AppSettingsForms";

/** Store listing and deletion of the app built from this repo. Only its owner sees it. */
export default async function SettingsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const [session, app] = await Promise.all([
    auth(),
    prisma.app.findUnique({ where: { repoFullName: `${org()}/${name}` } }),
  ]);
  if (!app) notFound();
  if (!session?.user?.id) return <SignInRequired returnTo={`/repos/${name}/settings`} />;
  if (app.ownerId !== session.user.id) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>Store listing</CardHeader>
        <SummaryForm slug={app.slug} summary={app.summary} />
        <dl className="border-t border-border p-4 grid grid-cols-[8rem_1fr] gap-x-4 gap-y-4 text-sm items-start">
          <dt className="text-fg-muted">App name</dt>
          <dd>{app.name}</dd>
          <dt className="text-fg-muted">Icon</dt>
          <dd>
            {app.iconUrl ? (
              <Image src={app.iconUrl} alt="" width={48} height={48} className="rounded-xl border border-border" unoptimized />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-canvas-subtle border border-border flex items-center justify-center text-lg">📱</div>
            )}
          </dd>
          <dt className="text-fg-muted">Description</dt>
          <dd>
            <Link href={`/repos/${name}/blob/README.md`} className="text-accent hover:underline">README.md</Link>
          </dd>
        </dl>
        <div className="px-4 pb-4 flex flex-wrap items-center gap-3 text-sm">
          <p className="text-fg-muted flex-1 min-w-[16rem]">
            These come from the app itself, so the web and the store app always show the same thing. Change them with a
            pull request.
          </p>
          <LinkButton href={`/repos/${name}/ai`}>Create PR with AI</LinkButton>
        </div>
      </Card>
      <div className="rounded-md border border-danger/60 bg-canvas">
        <div className="px-4 py-2.5 border-b border-danger/30 rounded-t-md text-sm font-semibold text-danger">Danger zone</div>
        <DeleteApp slug={app.slug} name={app.name} />
      </div>
    </div>
  );
}
