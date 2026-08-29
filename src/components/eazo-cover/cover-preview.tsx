"use client";

// 封面预览：自治播放的月晷时辰环 —— 当前时辰高亮沿环推移，
// 月相同步圆缺，环心月相文字随之更替。3–5 秒无限循环，无需交互、无鉴权。
// 仅供 /eazo-cover-preview 使用，切勿被产品路由引用。

import { useEffect, useState } from "react";
import { SHICHEN } from "@/lib/lunadial/types";
import { MOON_PHASES, moonPhaseLabel } from "@/lib/lunadial/moon";

const COVER_PREVIEW_DATA = {
  sequence: [
    { zhiIdx: 10, phase: "waxingCrescent" as const },
    { zhiIdx: 11, phase: "firstQuarter" as const },
    { zhiIdx: 0, phase: "waxingGibbous" as const },
    { zhiIdx: 1, phase: "full" as const },
    { zhiIdx: 2, phase: "waningGibbous" as const },
  ],
};

const TAU = Math.PI * 2;

export function CoverPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % COVER_PREVIEW_DATA.sequence.length),
      900,
    );
    return () => clearInterval(id);
  }, []);

  const cur = COVER_PREVIEW_DATA.sequence[step];
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 34;
  const nodeR = size * 0.05;

  return (
    <div className="night-field flex h-[100svh] w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute h-52 w-52 rounded-full moon-glow"
        style={{ background: "radial-gradient(circle, rgba(240,236,224,0.35), transparent 68%)" }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="cvHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(240,236,224,0.28)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R + 10} fill="url(#cvHalo)" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(159,178,196,0.22)" />
        {SHICHEN.map((s, i) => {
          const a = -Math.PI / 2 + (i / 12) * TAU;
          const x = cx + R * Math.cos(a);
          const y = cy + R * Math.sin(a);
          const active = i === cur.zhiIdx;
          const fraction = (i / 12) % 1;
          const angle = fraction * TAU;
          const rx = Math.abs(Math.cos(angle)) * nodeR;
          const waxing = fraction <= 0.5;
          const cosSign = Math.cos(angle) >= 0;
          const so = waxing ? 1 : 0;
          const si = cosSign ? (waxing ? 1 : 0) : waxing ? 0 : 1;
          return (
            <g key={s.zhi} transform={`translate(${x} ${y})`} style={{ transition: "opacity .4s" }}>
              {active && <circle r={nodeR + 6} fill="none" stroke="var(--moon)" strokeWidth={1.25} />}
              <circle r={nodeR} fill="rgba(159,178,196,0.18)" />
              {fraction > 0.02 && fraction < 0.5 && (
                <path d={`M 0 ${-nodeR} A ${nodeR} ${nodeR} 0 0 ${so} 0 ${nodeR} A ${rx} ${nodeR} 0 0 ${si} 0 ${-nodeR} Z`} fill={active ? "var(--moon)" : "rgba(240,236,224,0.82)"} />
              )}
              {fraction >= 0.5 && <circle r={nodeR} fill={active ? "var(--moon)" : "rgba(240,236,224,0.82)"} />}
              <text y={nodeR + 12} textAnchor="middle" fontSize={size * 0.036} fill={active ? "var(--moon)" : "rgba(240,236,224,0.6)"} style={{ fontFamily: "var(--font-heading)" }}>{s.zhi}</text>
            </g>
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={size * 0.05} fill="rgba(240,236,224,0.6)">月晷</text>
        <text x={cx} y={cy + size * 0.03} textAnchor="middle" fontSize={size * 0.09} fill="var(--moon)" style={{ fontFamily: "var(--font-heading)" }}>{moonPhaseLabel(cur.phase)}</text>
        <text x={cx} y={cy + size * 0.085} textAnchor="middle" fontSize={size * 0.038} fill="var(--bronze)" style={{ fontFamily: "var(--font-mono)" }}>{`${MOON_PHASES.find((m) => m.key === cur.phase) ? "月相流转" : ""}`}</text>
      </svg>
    </div>
  );
}
