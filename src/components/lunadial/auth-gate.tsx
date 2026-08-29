"use client";

import { MoonStar, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "@eazo/sdk";
import { useEazo } from "@eazo/sdk/react";
import { NightBackground } from "@/components/lunadial/night-background";

/** 登录门：用户数据（剧本/小结/教练）需登录后访问 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const user = useEazo((s) => s.auth.user);
  const loading = useEazo((s) => s.auth.loading);

  if (loading) {
    return (
      <NightBackground>
        <div className="flex min-h-[100svh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </NightBackground>
    );
  }

  if (!user) {
    return (
      <NightBackground image="https://cdn.eazo.ai/user-contents/design-variant-images/8807ef2fcff642dea93de48f745dc15e.png" imageOpacity={0.5}>
        <div
          className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center gap-6 px-8 text-center"
          data-el="auth-gate"
        >
          <MoonStar className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-heading text-3xl text-foreground">月晷 Lunadial</h1>
            <p className="mt-2 text-sm text-muted-foreground">登录后查看你的入睡剧本与晨间小结</p>
          </div>
          <button
            onClick={() => auth.login().catch(() => undefined)}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-heading text-base text-primary-foreground"
            data-el="auth-signin"
          >
            <UserRound className="h-4 w-4" />
            {t("common.signIn")}
          </button>
        </div>
      </NightBackground>
    );
  }

  return <>{children}</>;
}
