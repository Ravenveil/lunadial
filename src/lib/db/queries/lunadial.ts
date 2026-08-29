import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../client";
import { scripts, nights, events, envLogs } from "../schema/lunadial";
import type { Script, NightSummary, GuideConfig } from "@/lib/lunadial/types";

const DEFAULT_GUIDE: GuideConfig = {
  soundscapes: ["rain", "forest"],
  meditationMinutes: 10,
  breathLight: "moon478",
};

/** GET /api/script — 读剧本（无则建默认） */
export async function getScriptForUser(userId: string): Promise<Script> {
  const rows = await db.select().from(scripts).where(eq(scripts.userId, userId)).limit(1);
  if (rows[0]) return rowToScript(rows[0]);
  const created = await db
    .insert(scripts)
    .values({ userId, guide: DEFAULT_GUIDE })
    .onConflictDoNothing()
    .returning();
  if (created[0]) return rowToScript(created[0]);
  const again = await db.select().from(scripts).where(eq(scripts.userId, userId)).limit(1);
  return rowToScript(again[0]);
}

/** PUT /api/script — 存剧本 */
export async function putScriptForUser(userId: string, s: Script): Promise<Script> {
  const values = {
    userId,
    sleepTime: s.sleepTime,
    sunsetDuration: s.sunsetDuration,
    alarmTime: s.alarmTime,
    sunriseLead: s.sunriseLead,
    moonPhaseCompanion: s.moonPhaseCompanion,
    drumFifthWatch: s.drumFifthWatch,
    guide: s.guide,
    volume: s.volume,
    fadeWithSunset: s.fadeWithSunset,
    updatedAt: new Date(),
  };
  const rows = await db
    .insert(scripts)
    .values(values)
    .onConflictDoUpdate({ target: scripts.userId, set: values })
    .returning();
  return rowToScript(rows[0]);
}

function rowToScript(r: typeof scripts.$inferSelect): Script {
  return {
    id: r.userId,
    sleepTime: r.sleepTime,
    sunsetDuration: r.sunsetDuration as Script["sunsetDuration"],
    alarmTime: r.alarmTime,
    sunriseLead: r.sunriseLead,
    moonPhaseCompanion: r.moonPhaseCompanion,
    drumFifthWatch: r.drumFifthWatch,
    guide: r.guide,
    volume: r.volume,
    fadeWithSunset: r.fadeWithSunset,
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** 最近 N 晚（含事件与环境），用于小结与教练上下文 */
export async function listNightsForUser(userId: string, limit = 3): Promise<NightSummary[]> {
  const nightRows = await db
    .select()
    .from(nights)
    .where(eq(nights.userId, userId))
    .orderBy(desc(nights.date))
    .limit(limit);

  const out: NightSummary[] = [];
  for (const n of nightRows) {
    const [evs, envs] = await Promise.all([
      db.select().from(events).where(eq(events.nightId, n.id)).orderBy(asc(events.ts)),
      db.select().from(envLogs).where(eq(envLogs.nightId, n.id)).orderBy(asc(envLogs.ts)),
    ]);
    out.push({
      date: n.date,
      sleepLatencyMin: n.sleepLatencyMin,
      lightWindowHit: n.lightWindowHit,
      moonPhase: n.moonPhase,
      moonAge: n.moonAge,
      tipText: n.tipText,
      watches: n.watches,
      events: evs.map((e) => ({ ts: e.ts.slice(0, 5), kind: e.kind as "noise" | "motion", intensity: e.intensity })),
      env: envs.map((e) => ({ ts: e.ts, temp: e.temp, humidity: e.humidity, lux: e.lux })),
    });
  }
  return out;
}

export async function getNightForUser(userId: string, date?: string): Promise<NightSummary | null> {
  const list = await listNightsForUser(userId, 30);
  if (list.length === 0) return null;
  if (date) return list.find((n) => n.date === date) ?? list[0];
  return list[0];
}

/** 更新今晚建议文本 */
export async function updateNightTip(userId: string, date: string, tip: string): Promise<void> {
  await db
    .update(nights)
    .set({ tipText: tip })
    .where(and(eq(nights.userId, userId), eq(nights.date, date)));
}

export async function userHasNights(userId: string): Promise<boolean> {
  const rows = await db.select({ id: nights.id }).from(nights).where(eq(nights.userId, userId)).limit(1);
  return rows.length > 0;
}
