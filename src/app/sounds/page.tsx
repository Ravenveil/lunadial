"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, Square, Upload, Loader2, Music, Waves, Trees, CloudRain, AudioLines } from "lucide-react";
import { toast } from "sonner";
import { NightBackground } from "@/components/lunadial/night-background";
import { TabBar } from "@/components/lunadial/tab-bar";
import { LunaLangToggle } from "@/components/lunadial/luna-lang-toggle";
import { AuthGate } from "@/components/lunadial/auth-gate";
import { fetchSounds } from "@/lib/api";
import { playSoundscape } from "@/lib/lunadial/soundscape";
import type { SoundAsset } from "@/lib/lunadial/types";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const ICONS: Record<string, React.ReactNode> = {
  rain: <CloudRain className="h-4 w-4" />,
  waves: <Waves className="h-4 w-4" />,
  forest: <Trees className="h-4 w-4" />,
  pinknoise: <AudioLines className="h-4 w-4" />,
};

export default function SoundsPage() {
  return (
    <AuthGate>
      <SoundsContent />
    </AuthGate>
  );
}

function SoundsContent() {
  const { t } = useTranslation();
  const [sounds, setSounds] = useState<SoundAsset[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const seqRef = useRef(0);
  const handleRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    void fetchSounds().then(setSounds).catch(() => setSounds([]));
    return () => {
      handleRef.current?.stop();
      handleRef.current = null;
    };
  }, []);

  function togglePlay(id: string) {
    // 停止当前播放
    handleRef.current?.stop();
    handleRef.current = null;
    if (playing === id) {
      setPlaying(null);
      return;
    }
    handleRef.current = playSoundscape(id, 0.5);
    setPlaying(id);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("文件超过 10MB");
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setSounds((s) => [
        ...s,
        { id: `up-${(seqRef.current += 1)}`, name: f.name.replace(/\.[^.]+$/, ""), durationSec: 300, builtin: false, sizeKb: Math.round(f.size / 1024) },
      ]);
      setUploading(false);
      toast.success(t("sounds.upload"));
    }, 900);
  }

  const builtin = sounds.filter((s) => s.builtin);
  const custom = sounds.filter((s) => !s.builtin);

  const Row = (s: SoundAsset) => (
    <div key={s.id} className="glass-panel flex items-center gap-3 rounded-2xl p-3.5" data-el="sound-item">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-silver">
        {ICONS[s.id] ?? <Music className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm text-foreground">{s.name}</p>
        <p className="tabular text-xs text-muted-foreground">
          {fmt(s.durationSec)}{s.sizeKb ? ` · ${(s.sizeKb / 1024).toFixed(1)}MB` : ""}
        </p>
      </div>
      <button
        onClick={() => togglePlay(s.id)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-primary-foreground"
        aria-label={playing === s.id ? t("sounds.stop") : t("sounds.play")}
      >
        {playing === s.id ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <NightBackground>
      <main
        className="mx-auto flex max-w-md flex-col gap-4 px-5 pb-28"
        style={{ paddingTop: "calc(var(--eazo-safe-area-top) + 8px)" }}
        data-el="sounds-page"
      >
        <header className="flex items-center justify-between">
          <h1 className="font-heading text-2xl text-foreground">{t("sounds.title")}</h1>
          <LunaLangToggle />
        </header>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-heading text-sm text-muted-foreground">{t("sounds.builtin")}</h2>
          {builtin.map(Row)}
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-heading text-sm text-muted-foreground">{t("sounds.custom")}</h2>
          {custom.map(Row)}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-5 text-sm text-muted-foreground"
            data-el="sound-upload"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{uploading ? t("sounds.uploading") : t("sounds.upload")}</span>
            <span className="text-xs opacity-70">· {t("sounds.uploadHint")}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/mpeg,audio/ogg,.mp3,.ogg"
            className="hidden"
            onChange={onPick}
          />
        </section>
      </main>
      <TabBar />
    </NightBackground>
  );
}
