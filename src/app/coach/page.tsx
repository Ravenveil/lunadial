"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Loader2, Sparkles } from "lucide-react";
import { NightBackground } from "@/components/lunadial/night-background";
import { TabBar } from "@/components/lunadial/tab-bar";
import { LunaLangToggle } from "@/components/lunadial/luna-lang-toggle";
import { AuthGate } from "@/components/lunadial/auth-gate";
import { sendCoachMessage } from "@/lib/api";
import { AppAIClientUnavailableError } from "@/lib/api/app-ai-request";
import type { CoachMessage } from "@/lib/lunadial/types";

function CoachContent() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy) return;
    const uid = `u-${(seqRef.current += 1)}`;
    const userMsg: CoachMessage = { id: uid, role: "user", content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const reply = await sendCoachMessage(history);
      setMessages((m) => [...m, { id: `a-${(seqRef.current += 1)}`, role: "assistant", content: reply }]);
    } catch (error) {
      if (!(error instanceof AppAIClientUnavailableError)) {
        setMessages((m) => [
          ...m,
          { id: `a-${(seqRef.current += 1)}`, role: "assistant", content: "抱歉，教练暂时无法回应，请稍后再试。" },
        ]);
      }
    } finally {
      setBusy(false);
    }
  }

  const quicks = [t("coach.quick1"), t("coach.quick2"), t("coach.quick3")];
  const isFresh = messages.length === 0;

  return (
    <NightBackground>
      <div className="mx-auto flex h-[100svh] max-w-md flex-col" data-el="coach-page">
        <header
          className="flex items-center justify-between px-5 pb-3"
          style={{ paddingTop: "calc(var(--eazo-safe-area-top) + 8px)" }}
        >
          <div>
            <h1 className="font-heading text-2xl text-foreground">{t("coach.title")}</h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> {t("coach.subtitle")}
            </p>
          </div>
          <LunaLangToggle />
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          <div className="flex justify-start" data-el="coach-msg-greeting">
            <div className="glass-panel max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-foreground">
              {t("coach.greeting")}
            </div>
          </div>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              data-el={`coach-msg-${m.role}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-panel text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="glass-panel flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("coach.thinking")}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="px-5" style={{ paddingBottom: "calc(var(--eazo-safe-area-bottom) + 76px)" }}>
          {isFresh && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quicks.map((q) => (
                <button
                  key={q}
                  onClick={() => void send(q)}
                  className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground"
                  data-el="coach-quick"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="glass-panel flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("coach.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              data-el="coach-input"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
              aria-label={t("coach.send")}
              data-el="coach-send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      <TabBar />
    </NightBackground>
  );
}

export default function CoachPage() {
  return (
    <AuthGate>
      <CoachContent />
    </AuthGate>
  );
}
