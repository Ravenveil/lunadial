import { eq } from "drizzle-orm";
import { db } from "../client";
import { nights, events, envLogs } from "../schema/lunadial";
import { SEED_NIGHTS } from "@/lib/lunadial/seed-data";

/**
 * 为新用户播种最近三晚的示例睡眠数据（无接触感知不便临时采集，
 * 首登时提供可解释的样例，让小结与教练立即可用）。幂等：已有则跳过。
 */
export async function seedNightsForUser(userId: string): Promise<void> {
  const existing = await db
    .select({ id: nights.id })
    .from(nights)
    .where(eq(nights.userId, userId))
    .limit(1);
  if (existing.length > 0) return;

  for (const n of SEED_NIGHTS) {
    const inserted = await db
      .insert(nights)
      .values({
        userId,
        date: n.date,
        sleepLatencyMin: n.sleepLatencyMin,
        lightWindowHit: n.lightWindowHit,
        moonPhase: n.moonPhase,
        moonAge: n.moonAge,
        tipText: n.tipText,
        watches: n.watches,
      })
      .returning({ id: nights.id });
    const nightId = inserted[0].id;

    if (n.events.length) {
      await db.insert(events).values(
        n.events.map((e) => ({
          nightId,
          userId,
          ts: `${e.ts}:00`,
          kind: e.kind,
          intensity: e.intensity,
        })),
      );
    }
    if (n.env.length) {
      await db.insert(envLogs).values(
        n.env.map((p) => ({
          nightId,
          userId,
          ts: p.ts,
          temp: p.temp,
          humidity: p.humidity,
          lux: p.lux,
        })),
      );
    }
  }
}
