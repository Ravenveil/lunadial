"use client";

import { useMemo } from "react";
import { SHICHEN, type MoonPhaseKey } from "@/lib/lunadial/types";
import { MOON_PHASES, moonPhaseLabel } from "@/lib/lunadial/moon";

interface TimeRingProps {
  /** 当前时辰地支，如 "戌" */
  currentZhi?: string;
  /** 高亮弧段（入睡→日出）起止地支 */
  sleepZhi?: string;
  wakeZhi?: string;
  /** 十二时辰是否以月相小图呈现（签名） */
  moonPhases?: boolean;
  /** 环内月相与月龄 */
  centerPhase?: MoonPhaseKey;
  centerAge?: number;
  centerTop?: string;
  centerBottom?: string;
  size?: number;
  onSelectZhi?: (zhi: string) => void;
  selectedZhi?: string;
  /** 呼吸光晕（月升锁境用） */
  breathing?: boolean;
  className?: string;
}

const TAU = Math.PI * 2;

/**
 * 时辰环：SVG 圆环，十二时辰沿环排布，当前时辰高亮，与设备实体灯环同构。
 * moonPhases 打开时，十二时辰化为十二个月相小图（新月→满月→残月）。
 */
export function TimeRing({
  currentZhi,
  sleepZhi,
  wakeZhi,
  moonPhases = true,
  centerPhase,
  centerAge,
  centerTop,
  centerBottom,
  size = 300,
  onSelectZhi,
  selectedZhi,
  breathing = false,
  className,
}: TimeRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 30; // 节点环半径
  const nodeR = size * 0.052;

  const nodes = useMemo(
    () =>
      SHICHEN.map((s, i) => {
        // 子时置顶，顺时针
        const a = -Math.PI / 2 + (i / 12) * TAU;
        return {
          ...s,
          x: cx + R * Math.cos(a),
          y: cy + R * Math.sin(a),
          angle: a,
          phaseFraction: (i / 12) % 1,
        };
      }),
    [cx, cy, R],
  );

  const idxOf = (zhi?: string) =>
    zhi ? SHICHEN.findIndex((s) => s.zhi === zhi) : -1;

  // 入睡→日出高亮弧
  const arc = useMemo(() => {
    const s = idxOf(sleepZhi);
    const w = idxOf(wakeZhi);
    if (s < 0 || w < 0) return null;
    const a0 = -Math.PI / 2 + (s / 12) * TAU;
    const a1 = -Math.PI / 2 + (w / 12) * TAU;
    const large = ((w - s + 12) % 12) > 6 ? 1 : 0;
    return {
      d:
        `M ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} ` +
        `A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}`,
    };
  }, [sleepZhi, wakeZhi, cx, cy, R]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      data-eazo-component="time-ring"
    >
      <defs>
        <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9FB2C4" />
          <stop offset="50%" stopColor="#F0ECE0" />
          <stop offset="100%" stopColor="#C08858" />
        </linearGradient>
        <radialGradient id="ringHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(240,236,224,0.28)" />
          <stop offset="70%" stopColor="rgba(159,178,196,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* 月华光晕 */}
      <circle
        cx={cx}
        cy={cy}
        r={R + nodeR + 6}
        fill="url(#ringHalo)"
        style={breathing ? { transformOrigin: "center", animation: "breathe 7s ease-in-out infinite" } : undefined}
      />

      {/* 基环 */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(159,178,196,0.22)" strokeWidth={1} />

      {/* 入睡→日出高亮弧 */}
      {arc && (
        <path
          d={arc.d}
          fill="none"
          stroke="url(#ringStroke)"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.9}
        />
      )}

      {/* 十二时辰节点 */}
      {nodes.map((n) => {
        const isCurrent = n.zhi === currentZhi;
        const isSelected = n.zhi === selectedZhi;
        const phaseKey =
          MOON_PHASES[Math.round(n.phaseFraction * (MOON_PHASES.length - 1))]?.key ??
          "full";
        return (
          <g
            key={n.zhi}
            transform={`translate(${n.x} ${n.y})`}
            onClick={onSelectZhi ? () => onSelectZhi(n.zhi) : undefined}
            style={{ cursor: onSelectZhi ? "pointer" : "default" }}
            data-el={`time-ring-node-${n.zhi}`}
          >
            {(isCurrent || isSelected) && (
              <circle
                r={nodeR + 6}
                fill="none"
                stroke="var(--moon)"
                strokeWidth={1.25}
                opacity={0.85}
              />
            )}
            {moonPhases ? (
              <MoonNode fraction={n.phaseFraction} r={nodeR} bright={isCurrent || isSelected} phaseKey={phaseKey} />
            ) : (
              <circle r={nodeR} fill={isCurrent ? "var(--moon)" : "rgba(159,178,196,0.28)"} />
            )}
            <text
              y={nodeR + 13}
              textAnchor="middle"
              fontSize={size * 0.037}
              fill={isCurrent ? "var(--moon)" : "rgba(240,236,224,0.62)"}
              className="font-heading"
            >
              {n.zhi}
            </text>
          </g>
        );
      })}

      {/* 环心：月相 + 月龄 */}
      {centerTop && (
        <text x={cx} y={cy - size * 0.06} textAnchor="middle" fontSize={size * 0.045} fill="rgba(240,236,224,0.6)">
          {centerTop}
        </text>
      )}
      {centerPhase !== undefined && (
        <text x={cx} y={cy + size * 0.02} textAnchor="middle" fontSize={size * 0.085} fill="var(--moon)" className="font-heading">
          {moonPhaseLabel(centerPhase)}
        </text>
      )}
      {centerAge !== undefined && (
        <text x={cx} y={cy + size * 0.075} textAnchor="middle" fontSize={size * 0.04} fill="var(--bronze)" style={{ fontFamily: "var(--font-mono)" }}>
          {`月龄 ${centerAge.toFixed(1)}`}
        </text>
      )}
      {centerBottom && (
        <text x={cx} y={cy + size * 0.11} textAnchor="middle" fontSize={size * 0.04} fill="rgba(240,236,224,0.6)">
          {centerBottom}
        </text>
      )}
    </svg>
  );
}

function MoonNode({
  fraction,
  r,
  bright,
  phaseKey,
}: {
  fraction: number;
  r: number;
  bright: boolean;
  phaseKey: MoonPhaseKey;
}) {
  // 依据 fraction 画月相小图
  const litColor = bright ? "var(--moon)" : "rgba(240,236,224,0.82)";
  const darkColor = "rgba(159,178,196,0.18)";
  const angle = fraction * TAU;
  const rx = Math.abs(Math.cos(angle)) * r;
  const waxing = fraction <= 0.5;
  const cosSign = Math.cos(angle) >= 0;
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = cosSign ? (waxing ? 1 : 0) : (waxing ? 0 : 1);
  const litPath =
    `M 0 ${-r} A ${r} ${r} 0 0 ${sweepOuter} 0 ${r} ` +
    `A ${rx} ${r} 0 0 ${sweepInner} 0 ${-r} Z`;
  const isFull = phaseKey === "full";
  const isNew = phaseKey === "new";
  return (
    <g>
      <circle r={r} fill={darkColor} />
      {!isNew && !isFull && <path d={litPath} fill={litColor} />}
      {isFull && <circle r={r} fill={litColor} />}
    </g>
  );
}
