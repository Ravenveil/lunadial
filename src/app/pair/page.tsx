"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, Wifi, CheckCircle2, XCircle, MoonStar } from "lucide-react";
import { NightBackground } from "@/components/lunadial/night-background";
import { TimeRing } from "@/components/lunadial/time-ring";
import { LunaLangToggle } from "@/components/lunadial/luna-lang-toggle";

type State = "idle" | "testing" | "ok" | "fail";

export default function PairPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [addr, setAddr] = useState("lunadial.local");
  const [tz, setTz] = useState("Asia/Shanghai");
  const [state, setState] = useState<State>("idle");

  async function test() {
    if (!addr.trim()) return;
    setState("testing");
    // 向设备地址发起连接测试（真机期为 GET {addr}/api/status）。
    await new Promise((r) => setTimeout(r, 900));
    const reachable = /\.|:|local/.test(addr.trim());
    setState(reachable ? "ok" : "fail");
  }

  return (
    <NightBackground image="https://cdn.eazo.ai/user-contents/design-variant-images/8807ef2fcff642dea93de48f745dc15e.png" imageOpacity={0.5}>
      <main
        className="mx-auto flex min-h-[100svh] max-w-md flex-col gap-5 px-5 pb-10"
        style={{ paddingTop: "calc(var(--eazo-safe-area-top) + 8px)" }}
        data-el="pair-page"
      >
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoonStar className="h-5 w-5 text-primary" />
            <span className="font-heading text-lg">月晷 Lunadial</span>
          </div>
          <LunaLangToggle />
        </header>

        <div className="flex flex-col items-center pt-2">
          <TimeRing size={200} currentZhi="戌" moonPhases={false} breathing={state === "testing"} />
          <h1 className="mt-1 font-heading text-2xl text-foreground">{t("pair.title")}</h1>
          <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">{t("pair.subtitle")}</p>
        </div>

        <div className="glass-panel rounded-2xl p-4" data-el="pair-address">
          <label className="text-xs text-muted-foreground">{t("pair.address")}</label>
          <div className="mt-2 flex gap-2">
            <input
              value={addr}
              onChange={(e) => { setAddr(e.target.value); setState("idle"); }}
              placeholder={t("pair.addressPlaceholder")}
              className="min-w-0 flex-1 rounded-xl bg-secondary px-3 py-2.5 text-sm outline-none"
            />
            <button
              onClick={() => void test()}
              disabled={state === "testing" || !addr.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
              data-el="pair-test"
            >
              {state === "testing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
              {state === "testing" ? t("pair.testing") : t("pair.test")}
            </button>
          </div>
          {state === "ok" && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-primary"><CheckCircle2 className="h-4 w-4" />{t("pair.connected")}</p>
          )}
          {state === "fail" && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-day-sun"><XCircle className="h-4 w-4" />{t("pair.failed")}</p>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-4" data-el="pair-timezone">
          <label className="text-xs text-muted-foreground">{t("pair.timezone")}</label>
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="mt-2 w-full rounded-xl bg-secondary px-3 py-2.5 text-sm outline-none"
          >
            <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
          </select>
        </div>

        <ol className="glass-panel flex flex-col gap-2.5 rounded-2xl p-4 text-sm text-muted-foreground" data-el="pair-steps">
          <p className="font-heading text-foreground">{t("pair.steps")}</p>
          {[t("pair.step1"), t("pair.step2"), t("pair.step3")].map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs tabular text-primary">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <button
          onClick={() => router.push("/")}
          disabled={state !== "ok"}
          className="mt-auto rounded-full bg-primary py-3.5 font-heading text-base text-primary-foreground disabled:opacity-40"
          data-el="pair-enter"
        >
          {t("pair.enter")}
        </button>
      </main>
    </NightBackground>
  );
}
