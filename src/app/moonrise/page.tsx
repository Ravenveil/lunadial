"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { NightBackground } from "@/components/lunadial/night-background";
import { TimeRing } from "@/components/lunadial/time-ring";

// 4-7-8 呼吸节律（秒）
const PHASES = [
  { key: "breatheIn", sec: 4 },
  { key: "hold", sec: 7 },
  { key: "breatheOut", sec: 8 },
] as const;

export default function MoonrisePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [locked, setLocked] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setPhaseIdx((i) => (i + 1) % PHASES.length),
      PHASES[phaseIdx].sec * 1000,
    );
    return () => clearTimeout(timer);
  }, [phaseIdx]);

  const phase = PHASES[phaseIdx];
  const scale = phase.key === "breatheIn" ? 1.18 : phase.key === "breatheOut" ? 0.9 : 1.08;

  return (
    <NightBackground image="https://cdn.eazo.ai/user-contents/design-variant-images/8807ef2fcff642dea93de48f745dc15e.png" imageOpacity={0.62}>
      <main
        className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center px-6"
        style={{ paddingTop: "var(--eazo-safe-area-top)", paddingBottom: "var(--eazo-safe-area-bottom)" }}
        data-el="moonrise-page"
      >
        {!locked && (
          <button
            onClick={() => router.push("/")}
            className="mr-auto mt-2 flex items-center gap-1 text-sm text-muted-foreground"
            data-el="moonrise-back"
          >
            <ArrowLeft className="h-4 w-4" /> {t("moonrise.back")}
          </button>
        )}

        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {/* 升起的月 + 时辰环 */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute h-56 w-56 rounded-full moon-glow"
              style={{
                background: "radial-gradient(circle, rgba(240,236,224,0.9), rgba(240,236,224,0.15) 60%, transparent 72%)",
                transform: `scale(${scale})`,
                transition: `transform ${phase.sec}s cubic-bezier(.4,0,.4,1)`,
              }}
              aria-hidden
            />
            <TimeRing size={280} currentZhi="戌" moonPhases breathing centerPhase="waxingGibbous" />
          </div>

          {!locked ? (
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-heading text-xl text-foreground">{t("moonrise.currentZhi", { zhi: "戌" })}</p>
              <p className="tabular text-sm text-muted-foreground">{t("moonrise.untilSleep", { min: 28 })}</p>
              <p
                className="mt-4 font-heading text-3xl text-primary transition-opacity"
                style={{ opacity: 0.95 }}
                data-el="breath-phase"
              >
                {t(`moonrise.${phase.key}`)}
              </p>
              <p className="text-xs text-muted-foreground">{t("moonrise.breathStandby")}</p>
            </div>
          ) : (
            <p className="font-heading text-lg text-muted-foreground">{t("moonrise.locked")}</p>
          )}
        </div>

        <button
          onClick={() => setLocked((l) => !l)}
          className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary text-primary"
          aria-label={locked ? t("moonrise.unlock") : t("moonrise.lock")}
          data-el="moonrise-lock"
        >
          {locked ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
        </button>
        <p className="mb-2 text-xs text-muted-foreground">
          {locked ? t("moonrise.unlock") : t("moonrise.lock")}
        </p>
      </main>
    </NightBackground>
  );
}
