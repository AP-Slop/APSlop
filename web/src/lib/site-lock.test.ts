import { describe, expect, it } from "vitest";
import { basicPassword, siteLock } from "./site-lock";

const URL_ = "https://apslop.example";
const basic = (userPass: string) => `Basic ${btoa(userPass)}`;
const req = (path: string, init: RequestInit = {}) => new Request(`${URL_}${path}`, init);

describe("basicPassword", () => {
  it("reads the password after the first colon", () => {
    expect(basicPassword(basic("me:pa:ss"))).toBe("pa:ss");
    expect(basicPassword(basic(":secret"))).toBe("secret");
  });

  it("rejects anything that is not Basic user:password", () => {
    for (const h of [null, "", "Bearer abc", "Basic", "Basic !!!", basic("nocolon")]) {
      expect(basicPassword(h)).toBeNull();
    }
  });
});

describe("siteLock", () => {
  it("lets everything through when no password is set", async () => {
    expect(await siteLock(req("/"), undefined)).toBeNull();
    expect(await siteLock(req("/"), "")).toBeNull();
  });

  it("asks for the password on pages, APIs, static files and the store", async () => {
    for (const p of ["/", "/new", "/api/generate", "/_next/static/chunks/a.js", "/fdroid/repo/index-v2.json"]) {
      const res = await siteLock(req(p), "secret");
      expect(res?.status).toBe(401);
      expect(res?.headers.get("www-authenticate")).toMatch(/^Basic /);
    }
  });

  it("opens with the right password, whatever the user name", async () => {
    expect(await siteLock(req("/", { headers: { authorization: basic("anyone:secret") } }), "secret")).toBeNull();
    expect(await siteLock(req("/", { headers: { authorization: basic(":secret") } }), "secret")).toBeNull();
  });

  it("stays shut with a wrong password", async () => {
    const res = await siteLock(req("/", { headers: { authorization: basic("me:secreT") } }), "secret");
    expect(res?.status).toBe(401);
  });

  it("lets GitHub webhooks and the store app upload through, since they carry their own secret", async () => {
    expect(await siteLock(req("/api/webhooks/github", { method: "POST" }), "secret")).toBeNull();
    expect(await siteLock(req("/_store/store-app", { method: "PUT" }), "secret")).toBeNull();
    expect((await siteLock(req("/api/webhooks/github"), "secret"))?.status).toBe(401);
    expect((await siteLock(req("/_store/store-app"), "secret"))?.status).toBe(401);
  });
});
