import { Octokit } from "octokit";
import { env } from "@/lib/env";

export type RepoFile = {
  path: string;
  /** UTF-8 text content, or base64 when `encoding === "base64"`. */
  content: string;
  encoding?: "utf-8" | "base64";
  /** Git file mode; defaults to 100644. Use 100755 for executables (gradlew). */
  mode?: "100644" | "100755";
};

export function adminOctokit(): Octokit {
  return new Octokit({ auth: env().GITHUB_ADMIN_TOKEN });
}

export const GITHUB_SIGNIN_EXPIRED =
  "Your GitHub sign-in is no longer valid. Sign out, sign in with GitHub again, then try once more.";

/**
 * Octokit acting as the signed-in user. GitHub answers 401 "Bad credentials" when the token kept in the
 * session cookie has been revoked (e.g. the user signed in many times or removed the app's access);
 * that is turned into a message the user can act on, with status 401.
 */
export function userOctokit(token: string): Octokit {
  const gh = new Octokit({ auth: token });
  gh.hook.error("request", (error) => {
    if ((error as { status?: number }).status === 401) {
      throw Object.assign(new Error(GITHUB_SIGNIN_EXPIRED), { status: 401 });
    }
    throw error;
  });
  return gh;
}

export function org(): string {
  return env().GITHUB_ORG;
}

export function repoUrl(name: string): string {
  return `https://github.com/${org()}/${name}`;
}

/** Splits "org/name" → name. Accepts bare names too. */
export function repoName(fullName: string): string {
  return fullName.includes("/") ? fullName.split("/")[1] : fullName;
}

/** Invite the user to the org if they are not a member yet. Errors are ignored. */
export async function ensureOrgMember(login: string): Promise<void> {
  try {
    const gh = adminOctokit();
    try {
      await gh.rest.orgs.checkMembershipForUser({ org: org(), username: login });
      return;
    } catch {
      /* not a member */
    }
    await gh.rest.orgs.setMembershipForUser({ org: org(), username: login, role: "member" });
  } catch (e) {
    console.warn(`ensureOrgMember(${login}) failed:`, (e as Error).message);
  }
}

async function pushTree(
  gh: Octokit,
  owner: string,
  repo: string,
  branch: string,
  files: RepoFile[],
  message: string,
  baseSha?: string,
): Promise<string> {
  const blobs = await Promise.all(
    files.map(async (f) => {
      const { data } = await gh.rest.git.createBlob({
        owner,
        repo,
        content: f.content,
        encoding: f.encoding ?? "utf-8",
      });
      return { path: f.path, mode: f.mode ?? "100644", type: "blob" as const, sha: data.sha };
    }),
  );
  let baseTree: string | undefined;
  if (baseSha) {
    const { data: commit } = await gh.rest.git.getCommit({ owner, repo, commit_sha: baseSha });
    baseTree = commit.tree.sha;
  }
  const { data: tree } = await gh.rest.git.createTree({
    owner,
    repo,
    tree: blobs,
    base_tree: baseTree,
  });
  const { data: commit } = await gh.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: baseSha ? [baseSha] : [],
  });
  await gh.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha, force: false });
  return commit.sha;
}

export const WORKFLOWS_NOT_ALLOWED =
  "The server's GitHub token is not allowed to add GitHub Actions workflows (.github/workflows), which every app needs to build. " +
  "Ask the site administrator to give the token the Workflows (read and write) permission, then try again.";

/** True when the org already has a repo with this name (whoever made it). */
export async function repoExists(name: string): Promise<boolean> {
  try {
    await adminOctokit().rest.repos.get({ owner: org(), repo: name });
    return true;
  } catch (e) {
    if ((e as { status?: number }).status === 404) return false;
    throw e;
  }
}

/**
 * Create a public repo in the org, push all files as one commit on `main`,
 * and add the owner as an admin collaborator.
 * If anything fails after the repo exists, the half-made repo is deleted so the same name can be used again.
 */
export async function createRepoWithFiles(
  slug: string,
  description: string,
  files: RepoFile[],
  ownerLogin: string,
): Promise<{ fullName: string; htmlUrl: string; defaultBranch: string }> {
  const gh = adminOctokit();
  const owner = org();
  const { data: repo } = await gh.rest.repos.createInOrg({
    org: owner,
    name: slug,
    description: description.slice(0, 300),
    private: false,
    auto_init: true,
    has_issues: true,
    has_wiki: false,
  });
  const branch = repo.default_branch || "main";

  try {
    // auto_init creates an initial commit asynchronously; wait until the ref exists.
    let baseSha: string | undefined;
    for (let i = 0; i < 10 && !baseSha; i++) {
      try {
        const { data: ref } = await gh.rest.git.getRef({ owner, repo: slug, ref: `heads/${branch}` });
        baseSha = ref.object.sha;
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    if (!baseSha) throw new Error("GitHub did not finish setting up the new repository. Try again.");

    await pushTree(gh, owner, slug, branch, files, "Initial commit (generated by APSlop AI)", baseSha);
  } catch (e) {
    await deleteRepo(slug).catch((err) => console.warn(`deleteRepo(${slug}) after a failed create:`, (err as Error).message));
    // A fine-grained token without the Workflows permission gets 403 on any tree that touches .github/workflows.
    if ((e as { status?: number }).status === 403 && files.some((f) => f.path.startsWith(".github/workflows/"))) {
      throw Object.assign(new Error(WORKFLOWS_NOT_ALLOWED), { status: 503 });
    }
    throw e;
  }

  try {
    await gh.rest.repos.addCollaborator({ owner, repo: slug, username: ownerLogin, permission: "admin" });
  } catch (e) {
    console.warn(`addCollaborator(${ownerLogin}) failed:`, (e as Error).message);
  }

  return { fullName: repo.full_name, htmlUrl: repo.html_url, defaultBranch: branch };
}

/** Create a branch from `base`, commit `files`, and open a PR — using the user's token. */
export async function createBranchCommitAndPr(
  userToken: string,
  repo: string,
  base: string,
  branch: string,
  files: RepoFile[],
  title: string,
  body: string,
  /** Commit to branch from; defaults to the current head of `base`. */
  baseSha?: string,
): Promise<{ number: number; htmlUrl: string }> {
  const gh = userOctokit(userToken);
  const owner = org();
  const from = baseSha ?? (await gh.rest.git.getRef({ owner, repo, ref: `heads/${base}` })).data.object.sha;
  await gh.rest.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: from });
  await pushTree(gh, owner, repo, branch, files, title, from);
  const { data: pr } = await gh.rest.pulls.create({ owner, repo, title, body, head: branch, base });
  return { number: pr.number, htmlUrl: pr.html_url };
}

export type RepoSummary = {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  updatedAt: string | null;
  stars: number;
  openIssues: number;
  openPulls: number;
  defaultBranch: string;
  language: string | null;
};

type RepoNode = {
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  updatedAt: string | null;
  stargazerCount: number;
  defaultBranchRef: { name: string } | null;
  primaryLanguage: { name: string } | null;
  issues: { totalCount: number };
  pullRequests: { totalCount: number };
};

/** Public repos of the org, most recently updated first, with open issue and pull request counts kept apart. */
export async function listOrgRepos(query?: string): Promise<RepoSummary[]> {
  const gh = adminOctokit();
  const nodes: RepoNode[] = [];
  let cursor: string | null = null;
  do {
    const page: {
      organization: { repositories: { nodes: RepoNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };
    } = await gh.graphql(
      `query($org: String!, $cursor: String) {
        organization(login: $org) {
          repositories(first: 100, after: $cursor, privacy: PUBLIC, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              name nameWithOwner description url updatedAt stargazerCount
              defaultBranchRef { name }
              primaryLanguage { name }
              issues(states: OPEN) { totalCount }
              pullRequests(states: OPEN) { totalCount }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { org: org(), cursor },
    );
    const repos = page.organization.repositories;
    nodes.push(...repos.nodes);
    cursor = repos.pageInfo.hasNextPage ? repos.pageInfo.endCursor : null;
  } while (cursor);

  const q = query?.trim().toLowerCase();
  return nodes
    .filter((r) => !q || r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q))
    .map((r) => ({
      name: r.name,
      fullName: r.nameWithOwner,
      description: r.description ?? null,
      htmlUrl: r.url,
      updatedAt: r.updatedAt ?? null,
      stars: r.stargazerCount,
      openIssues: r.issues.totalCount,
      openPulls: r.pullRequests.totalCount,
      defaultBranch: r.defaultBranchRef?.name ?? "main",
      language: r.primaryLanguage?.name ?? null,
    }));
}

/** Open issue and pull request counts of one repo (GitHub's open_issues_count mixes the two). */
export async function getRepoCounts(name: string): Promise<{ openIssues: number; openPulls: number }> {
  const gh = adminOctokit();
  const data: { repository: { issues: { totalCount: number }; pullRequests: { totalCount: number } } } = await gh.graphql(
    `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        issues(states: OPEN) { totalCount }
        pullRequests(states: OPEN) { totalCount }
      }
    }`,
    { owner: org(), name },
  );
  return { openIssues: data.repository.issues.totalCount, openPulls: data.repository.pullRequests.totalCount };
}

export async function getRepo(name: string) {
  const gh = adminOctokit();
  const { data } = await gh.rest.repos.get({ owner: org(), repo: name });
  return data;
}

/** Set the repo description, which the store uses as the app's one-line summary. */
export async function updateRepoDescription(name: string, description: string) {
  const gh = adminOctokit();
  await gh.rest.repos.update({ owner: org(), repo: name, description });
}

/** Delete a repo in the org. A repo that is already gone counts as deleted. */
export async function deleteRepo(name: string): Promise<void> {
  const gh = adminOctokit();
  try {
    await gh.rest.repos.delete({ owner: org(), repo: name });
  } catch (e) {
    if ((e as { status?: number }).status !== 404) throw e;
  }
}

export type TreeEntry = { name: string; path: string; type: "dir" | "file"; size?: number };

/** List a directory (path "" = root). */
export async function getRepoTree(name: string, path: string, ref?: string): Promise<TreeEntry[]> {
  const gh = adminOctokit();
  const { data } = await gh.rest.repos.getContent({ owner: org(), repo: name, path, ref });
  if (!Array.isArray(data)) throw Object.assign(new Error("Not a folder."), { status: 404 });
  return data
    .map((e) => ({
      name: e.name,
      path: e.path,
      type: e.type === "dir" ? ("dir" as const) : ("file" as const),
      size: e.size,
    }))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));
}

export async function getFileContent(
  name: string,
  path: string,
  ref?: string,
): Promise<{ content: string; size: number; binary: boolean; htmlUrl: string | null }> {
  const gh = adminOctokit();
  const { data } = await gh.rest.repos.getContent({ owner: org(), repo: name, path, ref });
  if (Array.isArray(data) || data.type !== "file") throw Object.assign(new Error("Not a file."), { status: 404 });
  const buf = Buffer.from(data.content ?? "", "base64");
  const binary = buf.subarray(0, 8000).includes(0);
  return { content: binary ? "" : buf.toString("utf-8"), size: data.size, binary, htmlUrl: data.html_url };
}

/** Commit SHA at the head of a branch (default branch when omitted). */
export async function getBranchSha(name: string, branch?: string): Promise<string> {
  const gh = adminOctokit();
  const ref = branch ?? (await getRepo(name)).default_branch;
  const { data } = await gh.rest.git.getRef({ owner: org(), repo: name, ref: `heads/${ref}` });
  return data.object.sha;
}

/** Recursively fetch every text file in the repo (used for AI modification). */
export async function getAllTextFiles(name: string, ref?: string, maxBytes = 400_000): Promise<RepoFile[]> {
  return getTextFilesAt(name, await getBranchSha(name, ref), maxBytes);
}

/** All small text files of the tree at a commit (binaries, large files and overflow beyond maxBytes skipped). */
export async function getTextFilesAt(name: string, commitSha: string, maxBytes = 400_000): Promise<RepoFile[]> {
  const gh = adminOctokit();
  const owner = org();
  const { data: tree } = await gh.rest.git.getTree({ owner, repo: name, tree_sha: commitSha, recursive: "1" });
  const out: RepoFile[] = [];
  let total = 0;
  for (const item of tree.tree) {
    if (item.type !== "blob" || !item.path || !item.sha) continue;
    if (/\.(jar|png|jpg|jpeg|webp|gif|ico|zip|apk|so|ttf|otf)$/i.test(item.path)) continue;
    if ((item.size ?? 0) > 60_000) continue;
    const { data: blob } = await gh.rest.git.getBlob({ owner, repo: name, file_sha: item.sha });
    const text = Buffer.from(blob.content, "base64").toString("utf-8");
    if (text.includes("\u0000")) continue;
    total += text.length;
    if (total > maxBytes) break;
    out.push({ path: item.path, content: text });
  }
  return out;
}

/** UTF-8 content of one file at a commit, or null when it does not exist there. */
export async function getTextFileAt(name: string, path: string, commitSha: string): Promise<string | null> {
  try {
    const { data } = await adminOctokit().rest.repos.getContent({ owner: org(), repo: name, path, ref: commitSha });
    if (Array.isArray(data) || data.type !== "file") return null;
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null;
    throw e;
  }
}

export async function getReadme(name: string): Promise<string | null> {
  try {
    const gh = adminOctokit();
    const { data } = await gh.rest.repos.getReadme({ owner: org(), repo: name });
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export async function listPulls(name: string, state: "open" | "closed" | "all" = "open") {
  const gh = adminOctokit();
  const { data } = await gh.rest.pulls.list({ owner: org(), repo: name, state, per_page: 50 });
  return data;
}

export async function getPull(name: string, number: number) {
  const gh = adminOctokit();
  const { data } = await gh.rest.pulls.get({ owner: org(), repo: name, pull_number: number });
  return data;
}

export async function getPullFiles(name: string, number: number) {
  const gh = adminOctokit();
  const { data } = await gh.rest.pulls.listFiles({ owner: org(), repo: name, pull_number: number, per_page: 100 });
  return data;
}

export async function listPullReviews(name: string, number: number) {
  const gh = adminOctokit();
  const { data } = await gh.rest.pulls.listReviews({ owner: org(), repo: name, pull_number: number });
  return data;
}

export async function listIssueComments(name: string, number: number) {
  const gh = adminOctokit();
  const { data } = await gh.rest.issues.listComments({ owner: org(), repo: name, issue_number: number, per_page: 100 });
  return data;
}

export async function mergePull(userToken: string, name: string, number: number) {
  const gh = userOctokit(userToken);
  const { data } = await gh.rest.pulls.merge({ owner: org(), repo: name, pull_number: number, merge_method: "squash" });
  return data;
}

export async function closePull(userToken: string, name: string, number: number) {
  const gh = userOctokit(userToken);
  const { data } = await gh.rest.pulls.update({ owner: org(), repo: name, pull_number: number, state: "closed" });
  return data;
}

/** Whether a user can push to (and so merge into) a repo of the org. */
export async function canWriteRepo(name: string, login: string): Promise<boolean> {
  try {
    const { data } = await adminOctokit().rest.repos.getCollaboratorPermissionLevel({ owner: org(), repo: name, username: login });
    return ["admin", "maintain", "write"].includes(data.role_name ?? data.permission);
  } catch {
    return false;
  }
}

export async function createReview(
  userToken: string,
  name: string,
  number: number,
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  body: string,
) {
  const gh = userOctokit(userToken);
  const { data } = await gh.rest.pulls.createReview({
    owner: org(),
    repo: name,
    pull_number: number,
    event,
    body: body || undefined,
  });
  return data;
}

export async function listIssues(name: string, state: "open" | "closed" | "all" = "open") {
  const gh = adminOctokit();
  const { data } = await gh.rest.issues.listForRepo({ owner: org(), repo: name, state, per_page: 50 });
  return data.filter((i) => !i.pull_request);
}

export async function getIssue(name: string, number: number) {
  const gh = adminOctokit();
  const { data } = await gh.rest.issues.get({ owner: org(), repo: name, issue_number: number });
  return data;
}

export async function createIssueComment(userToken: string, name: string, number: number, body: string) {
  const gh = userOctokit(userToken);
  const { data } = await gh.rest.issues.createComment({ owner: org(), repo: name, issue_number: number, body });
  return data;
}

export async function setIssueState(userToken: string, name: string, number: number, state: "open" | "closed") {
  const gh = userOctokit(userToken);
  const { data } = await gh.rest.issues.update({ owner: org(), repo: name, issue_number: number, state });
  return data;
}

export async function createIssue(userToken: string, name: string, title: string, body: string) {
  const gh = userOctokit(userToken);
  const { data } = await gh.rest.issues.create({ owner: org(), repo: name, title, body });
  return data;
}

export async function listReleases(name: string) {
  const gh = adminOctokit();
  const { data } = await gh.rest.repos.listReleases({ owner: org(), repo: name, per_page: 30 });
  return data;
}

/** Create a tag on the default branch head and a GitHub Release for it. */
export async function createRelease(
  token: string,
  name: string,
  tag: string,
  releaseName?: string,
  body?: string,
) {
  const gh = userOctokit(token);
  const owner = org();
  const repo = await getRepo(name);
  const { data: ref } = await gh.rest.git.getRef({ owner, repo: name, ref: `heads/${repo.default_branch}` });
  try {
    await gh.rest.git.createRef({ owner, repo: name, ref: `refs/tags/${tag}`, sha: ref.object.sha });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status !== 422) throw e; // 422 = tag already exists
  }
  const { data } = await gh.rest.repos.createRelease({
    owner,
    repo: name,
    tag_name: tag,
    name: releaseName || tag,
    body: body || "",
    draft: false,
    prerelease: false,
  });
  return data;
}

/** The log of the first failed job of a workflow run, or null when no job failed. */
export async function getFailedJobLog(name: string, runId: number): Promise<string | null> {
  const gh = adminOctokit();
  const owner = org();
  const { data } = await gh.rest.actions.listJobsForWorkflowRun({ owner, repo: name, run_id: runId, per_page: 50 });
  const job = data.jobs.find((j) => j.conclusion === "failure");
  if (!job) return null;
  // GitHub answers with a redirect to the plain-text log, which Octokit follows.
  const res = await gh.rest.actions.downloadJobLogsForWorkflowRun({ owner, repo: name, job_id: job.id });
  return typeof res.data === "string" ? res.data : new TextDecoder().decode(res.data as ArrayBuffer);
}

/** Commit `files` on top of the current head of `branch`, as the server (AI build fixes). */
export async function commitFiles(name: string, branch: string, files: RepoFile[], message: string): Promise<string> {
  const base = await getBranchSha(name, branch);
  return pushTree(adminOctokit(), org(), name, branch, files, message, base);
}

export async function listWorkflowRuns(name: string) {
  const gh = adminOctokit();
  const { data } = await gh.rest.actions.listWorkflowRunsForRepo({ owner: org(), repo: name, per_page: 10 });
  return data.workflow_runs;
}
