import type { NightSummary } from "./types";
import { WUGENG } from "./types";

// 服务端播种用的示例夜间数据（仅被 DB seeder 引用，不进入任何产品路由）。

function watches(intensities: number[]) {
  return WUGENG.map((w, i) => ({
    name: w.name,
    zhi: w.zhi,
    intensity: intensities[i],
  }));
}

export const SEED_NIGHTS: NightSummary[] = [
  {
    date: "2026-08-26",
    sleepLatencyMin: 18,
    lightWindowHit: true,
    moonPhase: "waxingGibbous",
    moonAge: 12.4,
    tipText:
      "昨夜三更子时有两次噪音扰动，入睡尚快。今晚可将日落时长延至 45 分钟，并把引导音量调低两成，助你更快沉入深眠。",
    watches: watches([22, 34, 68, 41, 28]),
    events: [
      { ts: "23:58", kind: "noise", intensity: 61 },
      { ts: "00:12", kind: "noise", intensity: 54 },
      { ts: "03:24", kind: "motion", intensity: 47 },
    ],
    env: [
      { ts: "23:00", temp: 26.4, humidity: 58, lux: 12 },
      { ts: "00:00", temp: 25.8, humidity: 60, lux: 3 },
      { ts: "01:00", temp: 25.2, humidity: 62, lux: 2 },
      { ts: "02:00", temp: 24.9, humidity: 63, lux: 2 },
      { ts: "03:00", temp: 24.6, humidity: 64, lux: 4 },
      { ts: "04:00", temp: 24.8, humidity: 63, lux: 8 },
      { ts: "05:00", temp: 25.1, humidity: 61, lux: 26 },
      { ts: "06:00", temp: 25.6, humidity: 59, lux: 64 },
    ],
  },
  {
    date: "2026-08-25",
    sleepLatencyMin: 31,
    lightWindowHit: false,
    moonPhase: "firstQuarter",
    moonAge: 11.4,
    tipText:
      "昨夜入睡偏慢，且在五更寅时的体动活跃期被唤醒。建议提前半小时开始日落引导，闹钟改用日出提前量以避开活跃期。",
    watches: watches([30, 46, 52, 58, 74]),
    events: [
      { ts: "23:40", kind: "noise", intensity: 58 },
      { ts: "02:10", kind: "motion", intensity: 63 },
      { ts: "04:52", kind: "noise", intensity: 70 },
    ],
    env: [
      { ts: "23:00", temp: 27.0, humidity: 56, lux: 18 },
      { ts: "00:00", temp: 26.3, humidity: 58, lux: 5 },
      { ts: "01:00", temp: 25.7, humidity: 60, lux: 3 },
      { ts: "02:00", temp: 25.3, humidity: 61, lux: 3 },
      { ts: "03:00", temp: 25.0, humidity: 62, lux: 5 },
      { ts: "04:00", temp: 25.2, humidity: 61, lux: 10 },
      { ts: "05:00", temp: 25.6, humidity: 59, lux: 34 },
      { ts: "06:00", temp: 26.1, humidity: 57, lux: 72 },
    ],
  },
  {
    date: "2026-08-24",
    sleepLatencyMin: 14,
    lightWindowHit: true,
    moonPhase: "waxingCrescent",
    moonAge: 10.4,
    tipText:
      "昨夜睡得安稳，噪音与体动都很低。保持当前剧本即可，若想更深沉可尝试加入海浪音景与月光呼吸组合。",
    watches: watches([16, 24, 30, 22, 19]),
    events: [
      { ts: "00:30", kind: "motion", intensity: 28 },
      { ts: "02:40", kind: "noise", intensity: 33 },
      { ts: "05:05", kind: "motion", intensity: 25 },
    ],
    env: [
      { ts: "23:00", temp: 25.8, humidity: 59, lux: 9 },
      { ts: "00:00", temp: 25.2, humidity: 61, lux: 2 },
      { ts: "01:00", temp: 24.8, humidity: 62, lux: 2 },
      { ts: "02:00", temp: 24.5, humidity: 63, lux: 1 },
      { ts: "03:00", temp: 24.4, humidity: 64, lux: 3 },
      { ts: "04:00", temp: 24.6, humidity: 63, lux: 6 },
      { ts: "05:00", temp: 24.9, humidity: 61, lux: 22 },
      { ts: "06:00", temp: 25.4, humidity: 60, lux: 58 },
    ],
  },
];

export const DEFAULT_SOUNDS = [
  { id: "rain", name: "檐下听雨", durationSec: 1800, builtin: true },
  { id: "waves", name: "潮汐海浪", durationSec: 1800, builtin: true },
  { id: "forest", name: "深林夜籁", durationSec: 1800, builtin: true },
  { id: "pinknoise", name: "粉红噪音", durationSec: 1800, builtin: true },
] as const;
