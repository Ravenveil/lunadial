import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getNightForUser, listNightsForUser } from "@/lib/db/queries";

/** GET /api/nights?date=YYYY-MM-DD — 单晚小结；无 date 时返回最近列表 */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const date = request.nextUrl.searchParams.get("date");
  const listOnly = request.nextUrl.searchParams.get("list");

  if (listOnly) {
    const nights = await listNightsForUser(auth.user.id, 30);
    return NextResponse.json({ ok: true, nights });
  }

  const night = await getNightForUser(auth.user.id, date ?? undefined);
  return NextResponse.json({ ok: true, night });
}
