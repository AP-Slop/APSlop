import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { friendlyApiError } from "./ai";

const headers = new Headers();
const body = { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } };

describe("friendlyApiError", () => {
  it("explains a rejected key without the raw JSON", () => {
    const e = friendlyApiError(Anthropic.APIError.generate(401, body, "401 invalid x-api-key", headers));
    expect(e.message).toContain("key for AI was rejected");
    expect(e.message).toContain("Choose another Model");
    expect(e.message).not.toContain("invalid x-api-key");
    expect((e as { status?: number }).status).toBe(503);
  });

  it("asks to retry when AI is busy", () => {
    const e = friendlyApiError(Anthropic.APIError.generate(429, { error: {} }, "rate limited", headers));
    expect(e.message).toContain("busy");
  });

  it("passes other errors through", () => {
    const original = new Error("something else");
    expect(friendlyApiError(original)).toBe(original);
  });
});
