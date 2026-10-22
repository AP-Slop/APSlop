import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  type Answer,
  createScreen,
  deleteScreen,
  libraryResponse,
  projectResponse,
  putProject,
  putScreen,
  screenResponse,
  templateResponse,
  templatesResponse,
} from "@/lib/wireframe-store";

// The wireframe editor embedded on /wireframe/?design=<id> calls /api/wireframe/<id>/api/... exactly
// as it would call its own server; only the design's owner may.
type Ctx = { params: Promise<{ id: string; path?: string[] }> };

async function serve(req: Request, ctx: Ctx): Promise<Response> {
  const session = await requireSession();
  const { id, path = [] } = await ctx.params;
  const row = await prisma.design.findFirst({ where: { id, userId: session.user.id } });
  if (!row) return NextResponse.json({ error: "No such design." }, { status: 404 });
  const p = "/" + path.map(decodeURIComponent).join("/");
  const answer = await route(req, row, p);
  return answer.status === 204 ? new Response(null, { status: 204 }) : NextResponse.json(answer.body, { status: answer.status });
}

async function route(req: Request, row: Parameters<typeof projectResponse>[0], p: string): Promise<Answer> {
  const body = async () => req.json().catch(() => undefined);
  if (p === "/api/project") {
    if (req.method === "GET") return projectResponse(row);
    if (req.method === "PUT") return putProject(row, await body());
  }
  if (p === "/api/screens" && req.method === "POST") return createScreen(row, await body());
  const screen = /^\/api\/screens\/([a-z0-9][a-z0-9-]*)$/.exec(p);
  if (screen) {
    if (req.method === "GET") return screenResponse(row, screen[1]);
    if (req.method === "PUT") return putScreen(row, screen[1], await body());
    if (req.method === "DELETE") return deleteScreen(row, screen[1]);
  }
  if (p === "/api/templates" && req.method === "GET") return templatesResponse();
  const template = /^\/api\/templates\/(builtin|project)\/([a-z0-9][a-z0-9-]*)$/.exec(p);
  if (template && req.method === "GET") return templateResponse(template[1], template[2]);
  return libraryResponse(req.method, p);
}

export const GET = handle(serve);
export const PUT = handle(serve);
export const POST = handle(serve);
export const DELETE = handle(serve);
export const PATCH = handle(serve);
