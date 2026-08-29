import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getScriptForUser, putScriptForUser } from "@/lib/db/queries";
import type { Script } from "@/lib/lunadial/types";

/** GET /api/script — 读剧本 */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const script = await getScriptForUser(auth.user.id);
  return NextResponse.json({ ok: true, script });
}

/** PUT /api/script — 存剧本（保存即下发） */
export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as Script | null;
  if (!body || !body.sleepTime || !body.guide) {
    return NextResponse.json({ ok: false, error: "invalid script" }, { status: 400 });
  }
  const script = await putScriptForUser(auth.user.id, body);
  return NextResponse.json({ ok: true, script });
}
