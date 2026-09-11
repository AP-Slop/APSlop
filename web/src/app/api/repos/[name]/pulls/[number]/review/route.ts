import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, readJson } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createReview } from "@/lib/github";

const Body = z.object({
  event: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]),
  body: z.string().max(10000).default(""),
});

export const POST = handle(async (req: Request, ctx: { params: Promise<{ name: string; number: string }> }) => {
  const session = await requireSession();
  const { name, number } = await ctx.params;
  const { event, body } = Body.parse(await readJson(req));
  if (event !== "APPROVE" && !body.trim()) {
    return NextResponse.json({ error: "コメントを入力してください" }, { status: 400 });
  }
  const review = await createReview(session.accessToken, name, Number(number), event, body);
  return NextResponse.json({ id: review.id, state: review.state });
});
