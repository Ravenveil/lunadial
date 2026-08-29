import { request } from "./request";
import type {
  Script,
  NightSummary,
  SoundAsset,
  CoachMessage,
} from "@/lib/lunadial/types";

export async function fetchScript(): Promise<Script> {
  const res = await request("/api/script");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { ok: boolean; script: Script };
  return json.script;
}

export async function saveScript(script: Script): Promise<Script> {
  const res = await request("/api/script", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(script),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { ok: boolean; script: Script };
  return json.script;
}

export async function fetchNight(date?: string): Promise<NightSummary | null> {
  const res = await request(`/api/nights${date ? `?date=${date}` : ""}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { ok: boolean; night: NightSummary | null };
  return json.night;
}

export async function fetchNights(): Promise<NightSummary[]> {
  const res = await request("/api/nights?list=1");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { ok: boolean; nights: NightSummary[] };
  return json.nights;
}

export async function fetchSounds(): Promise<SoundAsset[]> {
  const res = await request("/api/sounds");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { ok: boolean; sounds: SoundAsset[] };
  return json.sounds;
}

export async function sendCoachMessage(messages: CoachMessage[]): Promise<string> {
  const res = await request("/api/coach/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { ok: boolean; text: string };
  return json.text;
}
