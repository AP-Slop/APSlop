import { afterEach, describe, expect, it, vi } from "vitest";
import { GITHUB_SIGNIN_EXPIRED, listOrgRepos, userOctokit } from "./github";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("userOctokit", () => {
  it("turns GitHub's Bad credentials into a sign-in-again message", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => reply(401, { message: "Bad credentials", documentation_url: "https://docs.github.com/rest" })));
    const err = await userOctokit("revoked").rest.users.getAuthenticated().catch((e) => e);
    expect(err.message).toBe(GITHUB_SIGNIN_EXPIRED);
    expect(err.status).toBe(401);
  });

  it("leaves other errors as they are", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => reply(404, { message: "Not Found" })));
    const err = await userOctokit("ok").rest.repos.get({ owner: "o", repo: "r" }).catch((e) => e);
    expect(err.status).toBe(404);
    expect(err.message).toContain("Not Found");
  });
});

describe("listOrgRepos", () => {
  function node(name: string, description: string | null, issues: number, pulls: number) {
    return {
      name,
      nameWithOwner: `AP-Slop/${name}`,
      description,
      url: `https://github.com/AP-Slop/${name}`,
      updatedAt: "2026-10-19T00:00:00Z",
      stargazerCount: 2,
      defaultBranchRef: { name: "main" },
      primaryLanguage: name === "empty" ? null : { name: "Kotlin" },
      issues: { totalCount: issues },
      pullRequests: { totalCount: pulls },
    };
  }

  it("keeps open issues and pull requests apart, follows pages, and filters by the search", async () => {
    vi.stubEnv("GITHUB_ORG", "AP-Slop");
    vi.stubEnv("GITHUB_ADMIN_TOKEN", "t");
    vi.stubEnv("GITHUB_CLIENT_ID", "c");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "s");
    vi.stubEnv("AUTH_SECRET", "a");
    const pages = [
      { nodes: [node("attendance-counter", "Count class attendance", 2, 3)], pageInfo: { hasNextPage: true, endCursor: "c1" } },
      { nodes: [node("empty", null, 0, 0)], pageInfo: { hasNextPage: false, endCursor: null } },
    ];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const { variables } = JSON.parse(String(init.body));
      return reply(200, { data: { organization: { repositories: pages[variables.cursor ? 1 : 0] } } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const all = await listOrgRepos();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(all.map((r) => r.name)).toEqual(["attendance-counter", "empty"]);
    expect(all[0]).toMatchObject({ fullName: "AP-Slop/attendance-counter", openIssues: 2, openPulls: 3, language: "Kotlin", defaultBranch: "main" });
    expect(all[1].language).toBeNull();

    const found = await listOrgRepos("attendance");
    expect(found.map((r) => r.name)).toEqual(["attendance-counter"]);
  });
});
