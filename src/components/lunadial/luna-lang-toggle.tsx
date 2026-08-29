"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  changeLocale,
  getLocalePreference,
  normalizeLocale,
  type LocaleCode,
  type LocalePreference,
} from "@/i18n";
import { cn } from "@/utils/utils";

/** 月晷风格的语言切换：月白/青铜胶囊，循环 系统→中文→English */
export function LunaLangToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const subscribe = useCallback(
    (sync: () => void) => {
      i18n.on("languageChanged", sync);
      window.addEventListener("eazo-locale-preference-changed", sync);
      window.addEventListener("storage", sync);
      return () => {
        i18n.off("languageChanged", sync);
        window.removeEventListener("eazo-locale-preference-changed", sync);
        window.removeEventListener("storage", sync);
      };
    },
    [i18n],
  );

  const preference = useSyncExternalStore(
    subscribe,
    getLocalePreference,
    () => "system" as LocalePreference,
  );

  const active = normalizeLocale(i18n.resolvedLanguage || i18n.language) ?? "en-US";
  const label = active === "zh-CN" ? "中" : "EN";

  async function cycle() {
    const next: LocaleCode = active === "zh-CN" ? "en-US" : "zh-CN";
    await changeLocale(next);
  }

  return (
    <button
      onClick={() => void cycle()}
      className={cn(
        "glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground",
        className,
      )}
      aria-label="切换语言 / Switch language"
      data-el="lang-toggle"
      title={preference === "system" ? "跟随系统" : label}
    >
      <Languages className="h-3.5 w-3.5 text-silver" aria-hidden />
      <span className="tabular">{label}</span>
    </button>
  );
}
