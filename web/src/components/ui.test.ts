import { afterEach, describe, expect, it, vi } from "vitest";
import { formatSize, timeAgo } from "./ui";

afterEach(() => vi.useRealTimers());

describe("timeAgo", () => {
  it("reads like the English screens", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T12:00:00Z"));
    expect(timeAgo("2026-10-19T11:59:30Z")).toBe("just now");
    expect(timeAgo("2026-10-19T11:59:00Z")).toBe("1 minute ago");
    expect(timeAgo("2026-10-19T09:00:00Z")).toBe("3 hours ago");
    expect(timeAgo("2026-10-16T12:00:00Z")).toBe("3 days ago");
    expect(timeAgo("2026-08-01T12:00:00Z")).toBe("on Aug 1, 2026");
  });
});

describe("formatSize", () => {
  it("uses B below 1 KB and one decimal above", () => {
    expect(formatSize(812)).toBe("812 B");
    expect(formatSize(1024)).toBe("1.0 KB");
    expect(formatSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
