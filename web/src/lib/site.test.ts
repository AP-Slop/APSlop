import { describe, expect, it } from "vitest";
import { isDeveloperPath } from "./site";

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
