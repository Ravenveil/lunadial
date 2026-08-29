import type { MoonPhaseKey } from "./types";
import { SHICHEN } from "./types";

/** 八月相顺序 */
export const MOON_PHASES: { key: MoonPhaseKey; label: string; fraction: number }[] = [
  { key: "new", label: "朔月", fraction: 0 },
  { key: "waxingCrescent", label: "蛾眉月", fraction: 0.15 },
  { key: "firstQuarter", label: "上弦月", fraction: 0.25 },
  { key: "waxingGibbous", label: "盈凸月", fraction: 0.4 },
  { key: "full", label: "望月", fraction: 0.5 },
  { key: "waningGibbous", label: "亏凸月", fraction: 0.6 },
  { key: "lastQuarter", label: "下弦月", fraction: 0.75 },
  { key: "waningCrescent", label: "残月", fraction: 0.9 },
];

export function moonPhaseLabel(key: MoonPhaseKey): string {
  return MOON_PHASES.find((m) => m.key === key)?.label ?? "望月";
}

/** 月龄(0–29.5) → 月相 key */
export function phaseFromAge(age: number): MoonPhaseKey {
  const f = ((age % 29.53) + 29.53) % 29.53 / 29.53;
  if (f < 0.03 || f > 0.97) return "new";
  if (f < 0.22) return "waxingCrescent";
  if (f < 0.28) return "firstQuarter";
  if (f < 0.47) return "waxingGibbous";
  if (f < 0.53) return "full";
  if (f < 0.72) return "waningGibbous";
  if (f < 0.78) return "lastQuarter";
  return "waningCrescent";
}

/** 当前小时 → 时辰地支 */
export function zhiFromHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const idx = Math.floor(((h + 1) % 24) / 2); // 子时 23–01
  return SHICHEN[idx].zhi;
}

/** 时段基调：夜=深蓝，日=暖白 */
export function groundForHour(hour: number): "night" | "day" {
  const h = ((hour % 24) + 24) % 24;
  return h >= 6 && h < 18 ? "day" : "night";
}
