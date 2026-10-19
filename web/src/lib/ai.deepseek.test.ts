import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  Object.assign(process.env, {
    GITHUB_ORG: "org",
    GITHUB_ADMIN_TOKEN: "x",
    GITHUB_CLIENT_ID: "x",
    GITHUB_CLIENT_SECRET: "x",
    AUTH_SECRET: "x",
    ANTHROPIC_API_KEY: "anthropic-test",
    DEEPSEEK_API_KEY: "deepseek-test",
    DEEPSEEK_BASE_URL: "https://deepseek.example/anthropic",
  });
});

afterEach(() => vi.unstubAllGlobals());

function sse(blocks: [string, unknown][], stopReason: string): Response {
  const events: [string, unknown][] = [
    ["message_start", { type: "message_start", message: { id: "m1", type: "message", role: "assistant", model: "deepseek-flash", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 0 } } }],
    ...blocks,
    ["message_delta", { type: "message_delta", delta: { stop_reason: stopReason, stop_sequence: null }, usage: { output_tokens: 5 } }],
    ["message_stop", { type: "message_stop" }],
  ];
  const body = events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join("");
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

/** A streamed reply: a thinking block, then one tool call with `input` (DeepSeek thinks by default). */
function sseToolReply(input: unknown, stopReason = "tool_use"): Response {
  return sse(
    [
      ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } }],
      ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Plan the change." } }],
      ["content_block_stop", { type: "content_block_stop", index: 0 }],
      ["content_block_start", { type: "content_block_start", index: 1, content_block: { type: "tool_use", id: "t1", name: "submit_result", input: {} } }],
      ["content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: JSON.stringify(input) } }],
      ["content_block_stop", { type: "content_block_stop", index: 1 }],
    ],
    stopReason,
  );
}

/** A streamed reply that answers in plain text instead of calling the tool. */
function sseTextReply(text: string): Response {
  return sse(
    [
      ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
      ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } }],
      ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ],
    "end_turn",
  );
}

const proposal = {
  title: "Support dark mode",
  body: "Follow the system theme.",
  branch: "dark-mode",
  files: [{ path: "app/Theme.kt", content: "dark" }],
};

describe("proposeChanges with DeepSeek", () => {
  it("calls DeepSeek's endpoint with the result tool (auto choice) and reads the tool input", async () => {
    const fetchMock = vi.fn(async () => sseToolReply(proposal));
    vi.stubGlobal("fetch", fetchMock);
    const { proposeChanges } = await import("./ai");
    const out = await proposeChanges("Support dark mode", [{ path: "a", content: "b" }], "deepseek");
    expect(out).toEqual(proposal);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(url)).toBe("https://deepseek.example/anthropic/v1/messages");
    expect(new Headers(init.headers).get("x-api-key")).toBe("deepseek-test");
    const sent = JSON.parse(String(init.body));
    expect(sent.model).toBe("deepseek-flash");
    expect(sent.output_config).toBeUndefined();
    // Thinking mode (DeepSeek's default) rejects a forced tool_choice.
    expect(sent.tool_choice).toEqual({ type: "auto" });
    expect(sent.thinking).toBeUndefined();
    expect(JSON.stringify(sent.system)).toContain("submit_result");
    expect(sent.tools[0].input_schema.type).toBe("object");
    expect(sent.tools[0].input_schema.$schema).toBeUndefined();
  });

  it("accepts the same JSON written as text, even in a code fence", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sseTextReply("```json\n" + JSON.stringify(proposal) + "\n```")));
    const { proposeChanges } = await import("./ai");
    expect(await proposeChanges("x", [], "deepseek")).toEqual(proposal);
  });

  it("reports a reply with neither a tool call nor JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sseTextReply("Sure, here is what I would change...")));
    const { proposeChanges } = await import("./ai");
    await expect(proposeChanges("x", [], "deepseek")).rejects.toThrow("no result");
  });

  it("reports an answer that does not match the schema", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sseToolReply({ title: "only a title" })));
    const { proposeChanges } = await import("./ai");
    await expect(proposeChanges("x", [], "deepseek")).rejects.toThrow("not in the expected form");
  });

  it("reports a cut-off answer", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sseToolReply(proposal, "max_tokens")));
    const { proposeChanges } = await import("./ai");
    await expect(proposeChanges("x", [], "deepseek")).rejects.toThrow("途中で切れました");
  });
});
