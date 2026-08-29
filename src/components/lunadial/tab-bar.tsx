"use client";

import { usePathname, useRouter } from "next/navigation";
import { Moon, SlidersHorizontal, MessageCircle, Music } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/utils";

const TABS = [
  { route: "/", key: "summary", Icon: Moon },
  { route: "/script", key: "script", Icon: SlidersHorizontal },
  { route: "/coach", key: "coach", Icon: MessageCircle },
  { route: "/sounds", key: "sounds", Icon: Music },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <nav
      className="glass-panel fixed inset-x-0 bottom-0 z-40 border-t"
      style={{ paddingBottom: "var(--eazo-safe-area-bottom)" }}
      data-el="tab-bar"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {TABS.map(({ route, key, Icon }) => {
          const active =
            route === "/" ? pathname === "/" : pathname.startsWith(route);
          return (
            <button
              key={key}
              onClick={() => router.push(route)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
              data-el={`nav-${key}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[11px] font-medium">{t(`nav.${key}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
