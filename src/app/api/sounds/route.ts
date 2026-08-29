import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DEFAULT_SOUNDS } from "@/lib/lunadial/seed-data";

/** GET /api/sounds — 音源列表（内置库） */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, sounds: DEFAULT_SOUNDS });
}
