"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Sparkles, Sunrise, CheckCircle2, AlertTriangle } from "lucide-react";
import { NightBackground } from "@/components/lunadial/night-background";
import { TimeRing } from "@/components/lunadial/time-ring";
import { WatchHeatBar, EnvChart } from "@/components/lunadial/night-charts";
import { TabBar } from "@/components/lunadial/tab-bar";
import { LunaLangToggle } from "@/components/lunadial/luna-lang-toggle";
import { AuthGate } from "@/components/lunadial/auth-gate";
import { fetchNights } from "@/lib/api";
import type { NightSummary } from "@/lib/lunadial/types";

function SummaryContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [nights, setNights] = useState<NightSummary[]>([]);
  const [idx, setIdx] = useState(0);
  const [selectedZhi, setSelectedZhi] = useState<string | undefined>();

  useEffect(() => {
    void fetchNights().then((n) => setNights(n)).catch(() => setNights([]));
  }, []);

  const night = nights[idx];
  const locale = i18n.language === "zh-CN" ? "zh-CN" : "en-US";

  return (
    <NightBackground image="https://cdn.eazo.ai/user-contents/design-variant-images/f984eeac1ff143cd982b4e367a17fc4d.png" imageOpacity={0.42}>
      <main
        className="mx-auto flex max-w-md flex-col gap-5 px-5 pb-28"
        style={{ paddingTop: "calc(var(--eazo-safe-area-top) + 8px)" }}
        data-el="summary-page"
      >
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl text-foreground">{t("summary.title")}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {night ? new Date(night.date).toLocaleDateString(locale, { month: "long", day: "numeric", weekday: "short" }) : "…"}
            </p>
          </div>
          <LunaLangToggle />
        </header>

        <div className="flex items-center justify-between rounded-full glass-panel px-2 py-1.5">
          <button
            onClick={() => setIdx((i) => Math.min(nights.length - 1, i + 1))}
            disabled={idx >= nights.length - 1}
            className="rounded-full p-1.5 text-silver disabled:opacity-30"
            data-el="night-prev"
            aria-label="上一晚"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-heading text-sm">{t("summary.lastNight")}</span>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx <= 0}
            className="rounded-full p-1.5 text-silver disabled:opacity-30"
            data-el="night-next"
            aria-label="下一晚"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <section className="flex flex-col items-center" data-el="summary-timering">
          {night && (
            <TimeRing
              size={300}
              currentZhi="寅"
              sleepZhi="亥"
              wakeZhi="卯"
              centerPhase={night.moonPhase}
              centerAge={night.moonAge}
              centerTop={t("summary.lastNight")}
              selectedZhi={selectedZhi}
              onSelectZhi={(z) => setSelectedZhi((p) => (p === z ? undefined : z))}
            />
          )}
          <p className="-mt-1 text-center text-[11px] text-muted-foreground">{t("summary.tapHint")}</p>
        </section>

        {night && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-2xl p-4" data-el="metric-latency">
                <p className="text-xs text-muted-foreground">{t("summary.sleepLatency")}</p>
                <p className="mt-1 font-heading text-2xl">
                  <span className="tabular">{night.sleepLatencyMin}</span>
                  <span className="ml-1 text-sm text-muted-foreground">{t("summary.minutes")}</span>
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-4" data-el="metric-lightwindow">
                <p className="text-xs text-muted-foreground">{t("summary.lightWindow")}</p>
                <p className={`mt-1 flex items-center gap-1.5 font-heading text-lg ${night.lightWindowHit ? "text-primary" : "text-day-sun"}`}>
                  {night.lightWindowHit ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {night.lightWindowHit ? t("summary.hit") : t("summary.missed")}
                </p>
              </div>
            </div>

            <section className="glass-panel rounded-2xl p-4" data-el="watch-section">
              <h2 className="mb-3 font-heading text-sm text-foreground">{t("summary.watchMotion")}</h2>
              <WatchHeatBar watches={night.watches} />
            </section>

            <section className="glass-panel rounded-2xl p-4" data-el="noise-section">
              <h2 className="mb-2 font-heading text-sm text-foreground">{t("summary.noiseEvents")}</h2>
              <ul className="divide-y divide-border">
                {night.events.slice(0, 3).map((e, i) => (
                  <li key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="tabular text-muted-foreground">{e.ts}</span>
                    <span className="text-xs">{e.kind === "noise" ? t("summary.noise") : t("summary.motion")}</span>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${e.intensity}%` }} />
                      </span>
                      <span className="tabular text-xs text-muted-foreground">{e.intensity}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-panel rounded-2xl p-4" data-el="env-section">
              <h2 className="mb-2 font-heading text-sm text-foreground">{t("summary.environment")}</h2>
              <EnvChart env={night.env} />
              <div className="mt-2 flex justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded" style={{ background: "var(--moon)" }} />{t("summary.temp")}</span>
                <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded" style={{ background: "var(--silver)" }} />{t("summary.humidity")}</span>
                <span className="flex items-center gap-1"><i className="h-0.5 w-3 rounded" style={{ background: "var(--day-sun)" }} />{t("summary.lux")}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-primary/30 bg-accent p-4" data-el="tonight-tip">
              <h2 className="mb-1.5 flex items-center gap-1.5 font-heading text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                {t("summary.tonightTip")}
              </h2>
              <p className="text-sm leading-relaxed text-foreground/90">{night.tipText}</p>
            </section>

            <button
              onClick={() => router.push("/moonrise")}
              className="flex items-center justify-center gap-2 rounded-full border border-border bg-secondary py-3 font-heading text-sm text-foreground"
              data-el="enter-moonrise"
            >
              <Sunrise className="h-4 w-4 text-primary" />
              {t("summary.enterMoonrise")}
            </button>
          </>
        )}
      </main>
      <TabBar />
    </NightBackground>
  );
}

export default function SummaryPage() {
  return (
    <AuthGate>
      <SummaryContent />
    </AuthGate>
  );
}
