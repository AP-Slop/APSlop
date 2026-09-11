import { getReadme, getRepo, getRepoTree } from "@/lib/github";
import { FileTree } from "@/components/FileTree";
import { Markdown } from "@/components/Markdown";
import { Card, CardHeader } from "@/components/ui";

export default async function RepoHome({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const repo = await getRepo(name);
  const [entries, readme] = await Promise.all([
    getRepoTree(name, "", repo.default_branch).catch(() => []),
    getReadme(name),
  ]);
  return (
    <div className="space-y-6">
      <FileTree name={name} path="" entries={entries} branch={repo.default_branch} />
      {readme && (
        <Card>
          <CardHeader>README.md</CardHeader>
          <div className="p-6">
            <Markdown>{readme}</Markdown>
          </div>
        </Card>
      )}
    </div>
  );
}
