import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { GuideConfig, MoonPhaseKey, WatchMotion } from "@/lib/lunadial/types";

/** 入睡剧本（每用户一份，与 X5 scripts 表同形） */
export const scripts = pgTable("scripts", {
  userId: varchar("user_id", { length: 128 }).primaryKey(),
  sleepTime: varchar("sleep_time", { length: 5 }).notNull().default("23:00"),
  sunsetDuration: integer("sunset_duration").notNull().default(30),
  alarmTime: varchar("alarm_time", { length: 5 }).notNull().default("06:40"),
  sunriseLead: integer("sunrise_lead").notNull().default(20),
  moonPhaseCompanion: boolean("moon_phase_companion").notNull().default(true),
  drumFifthWatch: boolean("drum_fifth_watch").notNull().default(true),
  guide: jsonb("guide").$type<GuideConfig>().notNull(),
  volume: integer("volume").notNull().default(42),
  fadeWithSunset: boolean("fade_with_sunset").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** 晨间小结（每用户按日期一条） */
export const nights = pgTable(
  "nights",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    date: date("date").notNull(),
    sleepLatencyMin: integer("sleep_latency_min").notNull(),
    lightWindowHit: boolean("light_window_hit").notNull(),
    moonPhase: varchar("moon_phase", { length: 24 }).$type<MoonPhaseKey>().notNull(),
    moonAge: real("moon_age").notNull(),
    tipText: text("tip_text").notNull(),
    watches: jsonb("watches").$type<WatchMotion[]>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userDateIdx: index("nights_user_date_idx").on(t.userId, t.date),
  }),
);

/** 噪音/体动事件 */
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    nightId: integer("night_id").notNull(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    ts: time("ts").notNull(),
    kind: varchar("kind", { length: 12 }).notNull(),
    intensity: integer("intensity").notNull(),
  },
  (t) => ({ nightIdx: index("events_night_idx").on(t.nightId) }),
);

/** 环境日志 */
export const envLogs = pgTable(
  "env_logs",
  {
    id: serial("id").primaryKey(),
    nightId: integer("night_id").notNull(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    ts: varchar("ts", { length: 5 }).notNull(),
    temp: real("temp").notNull(),
    humidity: real("humidity").notNull(),
    lux: real("lux").notNull(),
  },
  (t) => ({ nightIdx: index("env_logs_night_idx").on(t.nightId) }),
);

export type ScriptRow = InferSelectModel<typeof scripts>;
export type NightRow = InferSelectModel<typeof nights>;
export type EventRow = InferSelectModel<typeof events>;
export type EnvLogRow = InferSelectModel<typeof envLogs>;
