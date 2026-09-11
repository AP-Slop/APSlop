import { NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Wraps a route handler, mapping thrown errors to JSON responses. */
export function handle<T extends unknown[]>(fn: (...args: T) => Promise<Response>) {
  return async (...args: T): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof UnauthorizedError) return jsonError(e.message, 401);
      const status = (e as { status?: number }).status;
      const message = e instanceof Error ? e.message : String(e);
      console.error("API error:", e);
      return jsonError(message, status && status >= 400 && status < 600 ? status : 500);
    }
  };
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw Object.assign(new Error("JSON ボディが不正です"), { status: 400 });
  }
}
