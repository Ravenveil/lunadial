import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { appAiChat, AppAIUnavailableError } from "@/lib/app-ai/client";
import { listNightsForUser } from "@/lib/db/queries";
import { moonPhaseLabel } from "@/lib/lunadial/moon";
import type { NightSummary } from "@/lib/lunadial/types";

const WATCH_ZHI: Record<string, string> = {
  一更: "戌时", 二更: "亥时", 三更: "子时", 四更: "丑时", 五更: "寅时",
};

/** 把一晚小结压成可读摘要，供 system prompt 注入 */
function nightDigest(n: NightSummary): string {
  const noise = n.events.filter((e) => e.kind === "noise");
  const motion = n.events.filter((e) => e.kind === "motion");
  const peakWatch = [...n.watches].sort((a, b) => b.intensity - a.intensity)[0];
  const noiseDetail = noise.map((e) => `${e.ts}(强度${e.intensity})`).join("、") || "无";
  return [
    `【${n.date}】`,
    `入睡耗时 ${n.sleepLatencyMin} 分钟；`,
    `浅睡窗口${n.lightWindowHit ? "命中（未在体动活跃期被唤醒）" : "未命中（在体动活跃期被唤醒）"}；`,
    `昨夜月相「${moonPhaseLabel(n.moonPhase)}」月龄 ${n.moonAge.toFixed(1)}；`,
    `体动峰值出现在${peakWatch.name}（${WATCH_ZHI[peakWatch.name] ?? peakWatch.zhi}，强度${peakWatch.intensity}）；`,
    `噪音事件 ${noise.length} 次：${noiseDetail}；体动事件 ${motion.length} 次。`,
  ].join(" ");
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    messages?: { role: "user" | "assistant"; content: string }[];
  };
  const history = Array.isArray(body.messages) ? body.messages : [];
  if (history.length === 0) {
    return NextResponse.json({ ok: false, error: "no messages" }, { status: 400 });
  }

  const nights = await listNightsForUser(auth.user.id, 3);
  const context =
    nights.length > 0
      ? nights.map(nightDigest).join("\n")
      : "（暂无夜间数据）";

  const system = [
    "你是「月晷 Lunadial」床头睡眠设备的 AI 睡眠教练，说话温和、专业、简洁，用中文回答。",
    "月晷通过毫米波无接触感知睡眠，不做医学睡眠分期承诺。以入睡耗时、体动强度、噪音事件、浅睡窗口命中、月相等可解释指标为依据。",
    "回答要具体引用下面的真实夜间数据（如「昨晚三更子时有两次噪音事件」），并给出可落到剧本设置（日落时长、日出提前量、音景、月光呼吸、音量）的建议。回答控制在 2–4 句。",
    "以下是该用户最近三晚的小结摘要（越靠前越近）：",
    context,
  ].join("\n");

  try {
    const result = await appAiChat({
      capability: "text",
      viewerUserId: auth.user.id,
      messages: [{ role: "system", content: system }, ...history.slice(-10)],
      params: { temperature: 0.7, max_tokens: 500 },
    });
    return NextResponse.json({ ok: true, text: result.choices[0].message.content });
  } catch (error) {
    if (error instanceof AppAIUnavailableError) {
      return NextResponse.json(
        { code: "app_ai_unavailable", message: "AI 功能暂时不可用。如需继续使用，请联系该应用的创作者。" },
        { status: 402 },
      );
    }
    throw error;
  }
}
