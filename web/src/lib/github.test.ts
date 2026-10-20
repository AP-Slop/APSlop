import { afterEach, describe, expect, it, vi } from "vitest";
import { GITHUB_SIGNIN_EXPIRED, WORKFLOWS_NOT_ALLOWED, createRepoWithFiles, listOrgRepos, userOctokit } from "./github";

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

describe("createRepoWithFiles", { timeout: 20_000 }, () => {
  // octokit spaces out write requests by about a second each, so these take several seconds.
  function stubGitHub(treeStatus: number) {
    vi.stubEnv("GITHUB_ORG", "AP-Slop");
    vi.stubEnv("GITHUB_ADMIN_TOKEN", "t");
    vi.stubEnv("GITHUB_CLIENT_ID", "c");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "s");
    vi.stubEnv("AUTH_SECRET", "a");
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        const path = decodeURIComponent(new URL(url).pathname);
        const call = `${init.method} ${path}`;
        calls.push(call);
        if (call === "POST /orgs/AP-Slop/repos") {
          return reply(201, { full_name: "AP-Slop/counter", html_url: "https://github.com/AP-Slop/counter", default_branch: "main" });
        }
        if (path.endsWith("/git/ref/heads/main")) return reply(200, { object: { sha: "base" } });
        if (path.endsWith("/git/blobs")) return reply(201, { sha: "blob" });
        if (path.endsWith("/git/commits/base")) return reply(200, { tree: { sha: "basetree" } });
        if (path.endsWith("/git/trees")) {
          return treeStatus === 201 ? reply(201, { sha: "tree" }) : reply(treeStatus, { message: "Resource not accessible by personal access token" });
        }
        if (path.endsWith("/git/commits")) return reply(201, { sha: "commit" });
        if (path.endsWith("/git/refs/heads/main")) return reply(200, {});
        if (call === "DELETE /repos/AP-Slop/counter") return new Response(null, { status: 204 });
        if (path.includes("/collaborators/")) return new Response(null, { status: 204 });
        return reply(404, { message: `unexpected ${call}` });
      }),
    );
    return calls;
  }
  const files = [
    { path: "README.md", content: "# Counter" },
    { path: ".github/workflows/release.yml", content: "on: push" },
  ];

  it("deletes the half-made repo and explains the missing Workflows permission", async () => {
    const calls = stubGitHub(403);
    const err = await createRepoWithFiles("counter", "Count", files, "someone").catch((e) => e);
    expect(err.message).toBe(WORKFLOWS_NOT_ALLOWED);
    expect(calls).toContain("DELETE /repos/AP-Slop/counter");
  });

  it("keeps the repo when everything was pushed", async () => {
    const calls = stubGitHub(201);
    const repo = await createRepoWithFiles("counter", "Count", files, "someone");
    expect(repo.fullName).toBe("AP-Slop/counter");
    expect(calls).not.toContain("DELETE /repos/AP-Slop/counter");
  });
});
