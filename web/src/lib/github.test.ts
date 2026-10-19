import { afterEach, describe, expect, it, vi } from "vitest";
import { GITHUB_SIGNIN_EXPIRED, userOctokit } from "./github";

afterEach(() => vi.unstubAllGlobals());

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
