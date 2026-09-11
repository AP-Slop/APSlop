import { getFileContent, getRepo } from "@/lib/github";
import { Breadcrumbs } from "@/components/FileTree";
import { Markdown } from "@/components/Markdown";
import { Card, CardHeader } from "@/components/ui";

export default async function BlobPage({ params }: { params: Promise<{ name: string; path: string[] }> }) {
  const { name, path } = await params;
  const p = path.map(decodeURIComponent).join("/");
  const repo = await getRepo(name);
  const file = await getFileContent(name, p, repo.default_branch);
  const isMd = /\.md$/i.test(p);
  const lines = file.content.split("\n");
  return (
    <>
      <Breadcrumbs name={name} path={p} />
      <Card>
        <CardHeader>
          <span>{p.split("/").pop()}</span>
          <span className="text-fg-muted font-normal">{lines.length} 行 · {file.size} B</span>
          {file.htmlUrl && (
            <a href={file.htmlUrl} target="_blank" rel="noreferrer" className="ml-auto text-xs font-normal text-accent hover:underline">
              GitHub で編集 ↗
            </a>
          )}
        </CardHeader>
        {file.binary ? (
          <div className="p-6 text-fg-muted text-sm">バイナリファイルは表示できません。</div>
        ) : isMd ? (
          <div className="p-6">
            <Markdown>{file.content}</Markdown>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="font-mono text-xs w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-canvas-subtle">
                    <td className="select-none text-right text-fg-muted pr-4 pl-3 w-12 align-top">{i + 1}</td>
                    <td className="whitespace-pre pr-4">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
