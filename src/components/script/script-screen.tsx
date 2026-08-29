"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Loader2, Moon, Drum } from "lucide-react";
import { NightBackground } from "@/components/lunadial/night-background";
import { TabBar } from "@/components/lunadial/tab-bar";
import { LunaLangToggle } from "@/components/lunadial/luna-lang-toggle";
import { ToggleRow } from "@/components/lunadial/toggle-row";
import { AuthGate } from "@/components/lunadial/auth-gate";
import { fetchScript, saveScript } from "@/lib/api";
import type { Script, SoundscapeId } from "@/lib/lunadial/types";

const SUNSETS = [15, 30, 45, 60] as const;
const SCAPES: SoundscapeId[] = ["rain", "waves", "forest", "pinknoise", "meditation"];

function ScriptContent() {
  const { t } = useTranslation();
  const [script, setScript] = useState<Script | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchScript().then(setScript).catch(() => undefined);
  }, []);

  function patch(p: Partial<Script>) {
    setScript((s) => (s ? { ...s, ...p } : s));
  }

  async function save() {
    if (!script) return;
    setSaving(true);
    try {
      const saved = await saveScript(script);
      setScript(saved);
      toast.success(t("script.saved"));
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  function toggleScape(id: SoundscapeId) {
    if (!script) return;
    const has = script.guide.soundscapes.includes(id);
    patch({
      guide: {
        ...script.guide,
        soundscapes: has
          ? script.guide.soundscapes.filter((x) => x !== id)
          : [...script.guide.soundscapes, id],
      },
    });
  }

  return (
    <NightBackground>
      <main
        className="mx-auto flex max-w-md flex-col gap-4 px-5 pb-28"
        style={{ paddingTop: "calc(var(--eazo-safe-area-top) + 8px)" }}
        data-el="script-page"
      >
        <header className="flex items-center justify-between">
          <h1 className="font-heading text-2xl text-foreground">{t("script.title")}</h1>
          <LunaLangToggle />
        </header>

        {script && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="glass-panel rounded-2xl p-4" data-el="field-sleeptime">
                <span className="text-xs text-muted-foreground">{t("script.sleepTime")}</span>
                <input
                  type="time"
                  value={script.sleepTime}
                  onChange={(e) => patch({ sleepTime: e.target.value })}
                  className="mt-1 w-full bg-transparent font-heading text-2xl tabular outline-none"
                />
              </label>
              <label className="glass-panel rounded-2xl p-4" data-el="field-alarm">
                <span className="text-xs text-muted-foreground">{t("script.alarmTime")}</span>
                <input
                  type="time"
                  value={script.alarmTime}
                  onChange={(e) => patch({ alarmTime: e.target.value })}
                  className="mt-1 w-full bg-transparent font-heading text-2xl tabular outline-none"
                />
              </label>
            </div>

            <div className="glass-panel rounded-2xl p-4" data-el="field-sunset">
              <p className="mb-2 text-sm text-foreground">{t("script.sunsetDuration")}</p>
              <div className="flex gap-2">
                {SUNSETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => patch({ sunsetDuration: m })}
                    className={`flex-1 rounded-xl py-2 text-sm tabular transition-colors ${
                      script.sunsetDuration === m
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {m}′
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4" data-el="field-sunrise-lead">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-foreground">{t("script.sunriseLead")}</span>
                <span className="tabular text-primary">{script.sunriseLead}′</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={script.sunriseLead}
                onChange={(e) => patch({ sunriseLead: Number(e.target.value) })}
                className="w-full accent-[var(--primary)]"
              />
            </div>

            <div className="glass-panel flex flex-col divide-y divide-border rounded-2xl px-4">
              <ToggleRow
                icon={<Moon className="h-4 w-4 text-silver" />}
                label={t("script.moonPhaseCompanion")}
                on={script.moonPhaseCompanion}
                onToggle={() => patch({ moonPhaseCompanion: !script.moonPhaseCompanion })}
                el="toggle-moonphase"
              />
              <ToggleRow
                icon={<Drum className="h-4 w-4 text-silver" />}
                label={t("script.drumFifthWatch")}
                on={script.drumFifthWatch}
                onToggle={() => patch({ drumFifthWatch: !script.drumFifthWatch })}
                el="toggle-drum"
              />
              <ToggleRow
                label={t("script.fadeWithSunset")}
                on={script.fadeWithSunset}
                onToggle={() => patch({ fadeWithSunset: !script.fadeWithSunset })}
                el="toggle-fade"
              />
            </div>

            <div className="glass-panel rounded-2xl p-4" data-el="field-guide">
              <p className="mb-2 text-sm text-foreground">{t("script.guide")} · {t("script.soundscape")}</p>
              <div className="flex flex-wrap gap-2">
                {SCAPES.map((id) => (
                  <button
                    key={id}
                    onClick={() => toggleScape(id)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                      script.guide.soundscapes.includes(id)
                        ? "bg-accent text-primary ring-1 ring-primary/40"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {t(`script.${id === "meditation" ? "meditationSound" : id}`)}
                  </button>
                ))}
              </div>

              <p className="mb-2 mt-4 text-sm text-foreground">{t("script.breathLight")}</p>
              <div className="flex gap-2">
                {(["moon478", "off"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => patch({ guide: { ...script.guide, breathLight: v } })}
                    className={`flex-1 rounded-xl py-2 text-sm transition-colors ${
                      script.guide.breathLight === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {v === "moon478" ? t("script.moon478") : t("common.off")}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4" data-el="field-volume">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-foreground">{t("script.volume")}</span>
                <span className="tabular text-primary">{script.volume}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={script.volume}
                onChange={(e) => patch({ volume: Number(e.target.value) })}
                className="w-full accent-[var(--primary)]"
              />
            </div>

            <button
              onClick={() => void save()}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-heading text-base text-primary-foreground disabled:opacity-60"
              data-el="script-save"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? t("script.saving") : t("script.save")}
            </button>
          </>
        )}
      </main>
      <TabBar />
    </NightBackground>
  );
}

export function ScriptScreen() {
  return (
    <AuthGate>
      <ScriptContent />
    </AuthGate>
  );
}
