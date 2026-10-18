import { structuredPatch } from "diff";
import { z } from "zod";

/** A file touched by an AI proposal: content before (null = new file) and after (null = deleted). */
export const ProposalFileSchema = z.object({
  path: z.string(),
  before: z.string().nullable(),
  after: z.string().nullable(),
});
export type ProposalFile = z.infer<typeof ProposalFileSchema>;

/** What is stored in Generation.result while a proposal waits for review. */
export const StoredProposalSchema = z.object({
  title: z.string(),
  body: z.string(),
  branch: z.string(),
  baseSha: z.string(),
  files: z.array(ProposalFileSchema),
});
export type StoredProposal = z.infer<typeof StoredProposalSchema>;

export type FileDiff = {
  path: string;
  status: "Added" | "Modified" | "Deleted";
  additions: number;
  deletions: number;
  /** Unified diff hunks (starting at the first "@@" line), as rendered by the Diff component. */
  patch: string;
};

export function parseStoredProposal(json: string | null | undefined): StoredProposal | null {
  if (!json) return null;
  try {
    const parsed = StoredProposalSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Unified diff for one file. Files whose content did not change are dropped. */
export function diffFile(file: ProposalFile): FileDiff | null {
  if (file.before === file.after) return null;
  const status = file.before === null ? "Added" : file.after === null ? "Deleted" : "Modified";
  const p = structuredPatch(file.path, file.path, file.before ?? "", file.after ?? "", "", "", { context: 3 });
  let additions = 0;
  let deletions = 0;
  const lines: string[] = [];
  for (const h of p.hunks) {
    // Unified-diff convention (as in jsdiff's formatPatch): an empty side starts one line earlier.
    const oldStart = h.oldLines === 0 ? h.oldStart - 1 : h.oldStart;
    const newStart = h.newLines === 0 ? h.newStart - 1 : h.newStart;
    lines.push(`@@ -${oldStart},${h.oldLines} +${newStart},${h.newLines} @@`);
    for (const l of h.lines) {
      if (l.startsWith("\\")) continue; // "\ No newline at end of file"
      if (l.startsWith("+")) additions++;
      else if (l.startsWith("-")) deletions++;
      lines.push(l);
    }
  }
  if (lines.length === 0) return null;
  return { path: file.path, status, additions, deletions, patch: lines.join("\n") };
}

export function diffProposal(files: ProposalFile[]): FileDiff[] {
  return files.map(diffFile).filter((d): d is FileDiff => d !== null);
}
