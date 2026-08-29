"use client";

import type { WatchMotion, EnvPoint } from "@/lib/lunadial/types";

/** 五更体动强度热力条：按更分段，色阶由银→铜表示活跃度 */
export function WatchHeatBar({ watches }: { watches: WatchMotion[] }) {
  return (
    <div className="flex gap-1.5" data-el="watch-heatbar">
      {watches.map((w) => {
        const t = w.intensity / 100;
        // 低=冷银，高=暖铜
        const color = `color-mix(in srgb, var(--silver) ${Math.round((1 - t) * 100)}%, var(--bronze) ${Math.round(t * 100)}%)`;
        return (
          <div key={w.name} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-secondary">
              <div
                className="w-full rounded-md transition-all"
                style={{
                  height: `${Math.max(8, w.intensity)}%`,
                  background: color,
                  boxShadow: t > 0.5 ? "0 0 12px rgba(192,136,88,0.4)" : undefined,
                }}
              />
            </div>
            <span className="font-heading text-xs text-foreground">{w.name}</span>
            <span className="text-[10px] text-muted-foreground">{w.zhi}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 温湿度与光照 SVG 折线 */
export function EnvChart({ env }: { env: EnvPoint[] }) {
  const W = 320;
  const H = 120;
  const pad = 8;
  const n = env.length;
  const x = (i: number) => pad + (i / (n - 1)) * (W - pad * 2);

  const line = (vals: number[], min: number, max: number) => {
    const y = (v: number) =>
      H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
    return vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  };

  const temps = env.map((e) => e.temp);
  const hums = env.map((e) => e.humidity);
  const luxes = env.map((e) => e.lux);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" data-el="env-chart" role="img">
      <path d={line(luxes, 0, Math.max(...luxes))} fill="none" stroke="var(--day-sun)" strokeWidth={1.5} opacity={0.85} />
      <path d={line(hums, 40, 80)} fill="none" stroke="var(--silver)" strokeWidth={1.5} opacity={0.85} />
      <path d={line(temps, 22, 28)} fill="none" stroke="var(--moon)" strokeWidth={2} />
      {env.map((e, i) => (
        <text key={e.ts} x={x(i)} y={H - 1} textAnchor="middle" fontSize={7} fill="rgba(240,236,224,0.5)" style={{ fontFamily: "var(--font-mono)" }}>
          {i % 2 === 0 ? e.ts.slice(0, 2) : ""}
        </text>
      ))}
    </svg>
  );
}
