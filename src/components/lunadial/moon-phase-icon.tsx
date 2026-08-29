import type { MoonPhaseKey } from "@/lib/lunadial/types";
import { MOON_PHASES } from "@/lib/lunadial/moon";

interface MoonPhaseIconProps {
  phase: MoonPhaseKey;
  size?: number;
  lit?: string; // 亮面色
  dark?: string; // 暗面色
  className?: string;
}

/**
 * SVG 月相图标：以两条半椭圆的相位差绘出阴晴圆缺。
 * fraction 0=朔月(全暗) 0.5=望月(全亮) 1=朔月。
 */
export function MoonPhaseIcon({
  phase,
  size = 28,
  lit = "var(--moon)",
  dark = "rgba(159,178,196,0.22)",
  className,
}: MoonPhaseIconProps) {
  const fraction = MOON_PHASES.find((m) => m.key === phase)?.fraction ?? 0.5;
  const r = size / 2;
  // 光照角：0→朔，0.5→望
  const angle = fraction * 2 * Math.PI; // 0..2π
  // 明暗分界椭圆的横向半径（负值表示反向弯曲）
  const rx = Math.abs(Math.cos(angle)) * r;
  const waxing = fraction <= 0.5; // 上弦（右亮）
  const cosSign = Math.cos(angle) >= 0;

  // 亮面 path：由外圆的一侧 + 中间椭圆构成
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = cosSign ? (waxing ? 1 : 0) : (waxing ? 0 : 1);

  const litPath =
    `M ${r} 0 ` +
    `A ${r} ${r} 0 0 ${sweepOuter} ${r} ${size} ` +
    `A ${rx} ${r} 0 0 ${sweepInner} ${r} 0 Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden
    >
      <circle cx={r} cy={r} r={r} fill={dark} />
      {fraction > 0.02 && fraction < 0.98 && (
        <path d={litPath} fill={lit} />
      )}
      {fraction >= 0.98 && <circle cx={r} cy={r} r={r} fill={lit} />}
      <circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(240,236,224,0.35)" strokeWidth={0.75} />
    </svg>
  );
}
