import { getRepo, getRepoTree } from "@/lib/github";
import { Breadcrumbs, FileTree } from "@/components/FileTree";

export default async function TreePage({ params }: { params: Promise<{ name: string; path: string[] }> }) {
  const { name, path } = await params;
  const p = path.map(decodeURIComponent).join("/");
  const repo = await getRepo(name);
  const entries = await getRepoTree(name, p, repo.default_branch);
  return (
    <>
      <Breadcrumbs name={name} path={p} />
      <FileTree name={name} path={p} entries={entries} branch={repo.default_branch} />
    </>
  );
}
