import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createRelease } from "@/lib/github";

const Body = z.object({
  tag: z.string().regex(/^v\d+\.\d+\.\d+$/, "タグは v1.2.3 の形式にしてください"),
  name: z.string().max(100).optional(),
  body: z.string().max(10000).optional(),
});

export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string }> }) => {
  const session = await requireSession();
  const { name } = await ctx.params;
  const { tag, name: releaseName, body } = Body.parse(await readJson(req));
  const release = await createRelease(session.accessToken, name, tag, releaseName, body);
  return NextResponse.json({ id: release.id, tag: release.tag_name, url: release.html_url });
});
