"use client";

import { useLang, useSetLang } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/cn";

export function LanguageToggle() {
  const lang = useLang();
  const setLang = useSetLang();

  return (
    <div className="flex items-center rounded-full border border-border-strong overflow-hidden">
      <button
        type="button"
        onClick={() => setLang("ro")}
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
        onClick={() => setLang("en")}
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
