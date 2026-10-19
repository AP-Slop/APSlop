import { describe, expect, it } from "vitest";
import { isDeveloperPath, safeReturnPath } from "./site";

describe("isDeveloperPath", () => {
  it("treats the dashboard, repositories and new app pages as developer pages", () => {
    for (const p of ["/dashboard", "/repos", "/repos/attendance-counter/pulls/3", "/new"]) {
      expect(isDeveloperPath(p)).toBe(true);
    }
  });

  it("treats the store and unknown pages as visitor pages", () => {
    for (const p of ["/", "/apps/attendance-counter", "/newsletter", "/nope"]) {
      expect(isDeveloperPath(p)).toBe(false);
    }
  });
});

describe("safeReturnPath", () => {
  it("keeps paths on this site", () => {
    expect(safeReturnPath("/repos/attendance-counter/issues/2")).toBe("/repos/attendance-counter/issues/2");
    expect(safeReturnPath("/dashboard?tab=1")).toBe("/dashboard?tab=1");
  });

  it("sends anything else to the top page", () => {
    for (const v of ["https://evil.example", "//evil.example", "/\\evil.example", "", null, undefined]) {
      expect(safeReturnPath(v)).toBe("/");
    }
  });
});
