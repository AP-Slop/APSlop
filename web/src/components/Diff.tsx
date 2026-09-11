import { Card, CardHeader } from "@/components/ui";

type Props = { filename: string; status: string; additions: number; deletions: number; patch?: string };

type Row = { cls: string; oldNo: number | ""; newNo: number | ""; text: string };

function parsePatch(patch: string): Row[] {
  let oldNo = 0;
  let newNo = 0;
  return patch.split("\n").map((line) => {
    if (line.startsWith("@@")) {
      const m = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (m) {
        oldNo = Number(m[1]);
        newNo = Number(m[2]);
      }
      return { cls: "bg-[#ddf4ff] text-fg-muted", oldNo: "", newNo: "", text: line };
    }
    if (line.startsWith("+")) return { cls: "bg-diff-add", oldNo: "", newNo: newNo++, text: line };
    if (line.startsWith("-")) return { cls: "bg-diff-del", oldNo: oldNo++, newNo: "", text: line };
    return { cls: "", oldNo: oldNo++, newNo: newNo++, text: line };
  });
}

export function Diff({ filename, status, additions, deletions, patch }: Props) {
  const rows = patch ? parsePatch(patch) : [];
  return (
    <Card>
      <CardHeader>
        <span className="font-mono text-xs">{filename}</span>
        <span className="font-normal text-xs text-fg-muted">{status}</span>
        <span className="ml-auto font-normal text-xs">
          <span className="text-success">+{additions}</span> <span className="text-danger">−{deletions}</span>
        </span>
      </CardHeader>
      {rows.length === 0 ? (
        <div className="p-4 text-xs text-fg-muted">差分を表示できません (バイナリまたは大きすぎるファイル)。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full border-collapse">
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.cls}>
                  <td className="select-none text-right text-fg-muted/70 w-10 pr-2 pl-2 align-top">{r.oldNo}</td>
                  <td className="select-none text-right text-fg-muted/70 w-10 pr-2 align-top">{r.newNo}</td>
                  <td className="whitespace-pre pr-4 pl-2">{r.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
