import { afterEach, describe, expect, it, vi } from "vitest";
import { GITHUB_SIGNIN_EXPIRED, WORKFLOWS_NOT_ALLOWED, canWriteRepo, createRepoWithFiles, getFailedJobLog, listOrgRepos, pickFailedJob, userOctokit } from "./github";

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

describe("canWriteRepo", () => {
  it("is true for write, maintain and admin, and false for read or an unknown user", async () => {
    vi.stubEnv("GITHUB_ORG", "AP-Slop");
    vi.stubEnv("GITHUB_ADMIN_TOKEN", "t");
    vi.stubEnv("GITHUB_CLIENT_ID", "c");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "s");
    vi.stubEnv("AUTH_SECRET", "a");
    const roles: Record<string, { permission: string; role_name: string } | null> = {
      writer: { permission: "write", role_name: "write" },
      maintainer: { permission: "write", role_name: "maintain" },
      owner: { permission: "admin", role_name: "admin" },
      reader: { permission: "read", role_name: "read" },
      triager: { permission: "read", role_name: "triage" },
      stranger: null,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const login = new URL(url).pathname.split("/")[5];
        const role = roles[login];
        return role ? reply(200, role) : reply(404, { message: "Not Found" });
      }),
    );
    const result = Object.fromEntries(await Promise.all(Object.keys(roles).map(async (l) => [l, await canWriteRepo("counter", l)])));
    expect(result).toEqual({ writer: true, maintainer: true, owner: true, reader: false, triager: false, stranger: false });
  });
});

describe("getFailedJobLog", () => {
  const stubEnvs = () => {
    vi.stubEnv("GITHUB_ORG", "AP-Slop");
    vi.stubEnv("GITHUB_ADMIN_TOKEN", "t");
    vi.stubEnv("GITHUB_CLIENT_ID", "c");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "s");
    vi.stubEnv("AUTH_SECRET", "a");
  };
  const failedStep = { name: "Build", status: "completed", conclusion: "failure" };

  it("picks the job whose step failed even while GitHub still lists the job as in progress", () => {
    const jobs = [
      { id: 1, status: "completed", conclusion: "success", steps: [] },
      { id: 2, status: "in_progress", conclusion: null, steps: [{ conclusion: "success" }, failedStep] },
    ];
    expect(pickFailedJob(jobs)?.id).toBe(2);
    expect(pickFailedJob([{ id: 3, status: "completed", conclusion: "failure" }])?.id).toBe(3);
    expect(pickFailedJob([{ id: 4, status: "in_progress", conclusion: null, steps: [] }])?.id).toBe(4);
    expect(pickFailedJob([{ id: 5, status: "completed", conclusion: "success" }])).toBeNull();
    expect(pickFailedJob([])).toBeNull();
  });

  it("retries while GitHub lists no job yet, then downloads the failed job's log", async () => {
    stubEnvs();
    let listings = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const path = new URL(url).pathname;
        if (path.endsWith("/actions/runs/9/jobs")) {
          listings++;
          return reply(200, { total_count: listings === 1 ? 0 : 1, jobs: listings === 1 ? [] : [{ id: 7, status: "in_progress", conclusion: null, steps: [failedStep] }] });
        }
        if (path.endsWith("/actions/jobs/7/logs")) return new Response("2026-10-22T10:10:18Z e: file:///x.kt:1:1 boom\n", { status: 200 });
        return reply(404, { message: "Not Found" });
      }),
    );
    const log = await getFailedJobLog("cafeteria-review", 9, 1);
    expect(listings).toBe(2);
    expect(log).toContain("boom");
  });

  it("gives up with null when no job ever shows up", async () => {
    stubEnvs();
    vi.stubGlobal("fetch", vi.fn(async () => reply(200, { total_count: 0, jobs: [] })));
    expect(await getFailedJobLog("cafeteria-review", 9, 1)).toBeNull();
  });
});
