// 月晷 Lunadial — 领域类型（与 X5 REST 契约同形）

/** 十二时辰（地支） */
export const SHICHEN = [
  { zhi: "子", label: "子时", range: "23–01", start: 23 },
  { zhi: "丑", label: "丑时", range: "01–03", start: 1 },
  { zhi: "寅", label: "寅时", range: "03–05", start: 3 },
  { zhi: "卯", label: "卯时", range: "05–07", start: 5 },
  { zhi: "辰", label: "辰时", range: "07–09", start: 7 },
  { zhi: "巳", label: "巳时", range: "09–11", start: 9 },
  { zhi: "午", label: "午时", range: "11–13", start: 11 },
  { zhi: "未", label: "未时", range: "13–15", start: 13 },
  { zhi: "申", label: "申时", range: "15–17", start: 15 },
  { zhi: "酉", label: "酉时", range: "17–19", start: 17 },
  { zhi: "戌", label: "戌时", range: "19–21", start: 19 },
  { zhi: "亥", label: "亥时", range: "21–23", start: 21 },
] as const;

/** 五更（一更戌…五更寅） */
export const WUGENG = [
  { name: "一更", zhi: "戌", range: "19–21" },
  { name: "二更", zhi: "亥", range: "21–23" },
  { name: "三更", zhi: "子", range: "23–01" },
  { name: "四更", zhi: "丑", range: "01–03" },
  { name: "五更", zhi: "寅", range: "03–05" },
] as const;

export type SoundscapeId =
  | "rain"
  | "waves"
  | "forest"
  | "pinknoise"
  | "meditation";

export type BreathLight = "off" | "moon478";

export interface GuideConfig {
  soundscapes: SoundscapeId[];
  meditationMinutes: 5 | 10 | 15;
  breathLight: BreathLight;
}

export interface Script {
  id: string;
  sleepTime: string; // "23:00"
  sunsetDuration: 15 | 30 | 45 | 60; // 日落时长（分钟）
  alarmTime: string; // "06:40"
  sunriseLead: number; // 日出提前量（分钟）
  moonPhaseCompanion: boolean; // 月相伴眠
  drumFifthWatch: boolean; // 五更轻鼓
  guide: GuideConfig;
  volume: number; // 0–100
  fadeWithSunset: boolean; // 随日落渐弱
  updatedAt?: string;
}

export type MoonPhaseKey =
  | "new"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "full"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent";

export interface NightEvent {
  ts: string; // "01:12"
  kind: "noise" | "motion";
  intensity: number; // 0–100
}

export interface EnvPoint {
  ts: string; // "23:00"
  temp: number; // ℃
  humidity: number; // %
  lux: number; // lx
}

/** 每一更的体动强度（雷达） */
export interface WatchMotion {
  name: string; // 一更…
  zhi: string;
  intensity: number; // 0–100
}

export interface NightSummary {
  date: string; // "2026-08-26"
  sleepLatencyMin: number; // 入睡耗时
  lightWindowHit: boolean; // 浅睡窗口命中（未在体动活跃期被唤醒）
  moonPhase: MoonPhaseKey;
  moonAge: number; // 月龄
  tipText: string; // 今晚建议（LLM）
  watches: WatchMotion[];
  events: NightEvent[];
  env: EnvPoint[];
}

export interface DeviceStatus {
  connected: boolean;
  state: "idle" | "winddown" | "asleep" | "sunrise";
  currentZhi: string; // 当前时辰地支
  ringPosition: number; // 月光环位置 0–1
}

export interface SoundAsset {
  id: string;
  name: string;
  durationSec: number;
  builtin: boolean;
  sizeKb?: number;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
