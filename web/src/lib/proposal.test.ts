import { describe, expect, it } from "vitest";
import { diffFile, diffProposal, parseStoredProposal } from "./proposal";

describe("diffFile", () => {
  it("marks a modified file and counts lines", () => {
    const d = diffFile({ path: "a.kt", before: "one\ntwo\nthree\n", after: "one\nTWO\nthree\nfour\n" });
    expect(d).not.toBeNull();
    expect(d!.status).toBe("Modified");
    expect(d!.additions).toBe(2);
    expect(d!.deletions).toBe(1);
    expect(d!.patch.split("\n")[0]).toBe("@@ -1,3 +1,4 @@");
    expect(d!.patch).toContain("-two");
    expect(d!.patch).toContain("+TWO");
    expect(d!.patch).toContain("+four");
  });

  it("marks a new file as Added with every line added", () => {
    const d = diffFile({ path: "b.xml", before: null, after: "<a/>\n<b/>\n" });
    expect(d!.status).toBe("Added");
    expect(d!.additions).toBe(2);
    expect(d!.deletions).toBe(0);
    expect(d!.patch.startsWith("@@ -0,0 +1,2 @@")).toBe(true);
  });

  it("marks a removed file as Deleted", () => {
    const d = diffFile({ path: "c.txt", before: "x\n", after: null });
    expect(d!.status).toBe("Deleted");
    expect(d!.deletions).toBe(1);
  });

  it("drops files that did not change", () => {
    expect(diffFile({ path: "same", before: "s\n", after: "s\n" })).toBeNull();
  });

  it("does not count the no-newline marker as a line", () => {
    const d = diffFile({ path: "n", before: "a", after: "b" });
    expect(d!.additions).toBe(1);
    expect(d!.deletions).toBe(1);
    expect(d!.patch).not.toContain("No newline");
  });
});

describe("diffProposal", () => {
  it("keeps only changed files, in order", () => {
    const out = diffProposal([
      { path: "1", before: "a\n", after: "b\n" },
      { path: "2", before: "c\n", after: "c\n" },
      { path: "3", before: null, after: "d\n" },
    ]);
    expect(out.map((d) => d.path)).toEqual(["1", "3"]);
  });
});

describe("parseStoredProposal", () => {
  const ok = { title: "t", body: "b", branch: "br", baseSha: "abc", files: [{ path: "p", before: null, after: "x" }] };
  it("reads a valid proposal", () => {
    expect(parseStoredProposal(JSON.stringify(ok))?.title).toBe("t");
  });
  it("returns null for missing or broken data", () => {
    expect(parseStoredProposal(null)).toBeNull();
    expect(parseStoredProposal("{")).toBeNull();
    expect(parseStoredProposal(JSON.stringify({ title: "t" }))).toBeNull();
  });
});
