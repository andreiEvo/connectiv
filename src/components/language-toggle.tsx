"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/app/actions/language";
import { cn } from "@/lib/cn";
import type { LangCode } from "@/lib/lang-cookie";

export function LanguageToggle({ lang }: { lang: LangCode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function choose(next: LangCode) {
    if (next === lang || isPending) return;
    startTransition(async () => {
      await setLanguage(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center rounded-full border border-border-strong overflow-hidden">
      <button
        type="button"
        onClick={() => choose("ro")}
        aria-label="Română"
        aria-pressed={lang === "ro"}
        className={cn(
          "flex items-center justify-center h-8 w-9 text-sm transition-colors duration-150",
          lang === "ro" ? "bg-accent" : "hover:bg-surface-2",
        )}
      >
        🇷🇴
      </button>
      <button
        type="button"
        onClick={() => choose("en")}
        aria-label="English"
        aria-pressed={lang === "en"}
        className={cn(
          "flex items-center justify-center h-8 w-9 text-sm transition-colors duration-150",
          lang === "en" ? "bg-accent" : "hover:bg-surface-2",
        )}
      >
        🇬🇧
      </button>
    </div>
  );
}
