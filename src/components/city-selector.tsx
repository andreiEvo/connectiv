"use client";

import { useState, useTransition } from "react";
import { setCity } from "@/app/actions/city";
import { CITIES, cityLabel, type CitySlug } from "@/lib/constants";
import { useLang } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/cn";

export function CitySelector({ initialCity }: { initialCity: CitySlug }) {
  const lang = useLang();
  const [city, setCityState] = useState<CitySlug>(initialCity);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function choose(next: CitySlug) {
    setCityState(next);
    setOpen(false);
    startTransition(() => {
      setCity(next);
    });
  }

  const label = cityLabel(city, lang);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-full border border-border-strong bg-surface text-xs font-medium text-text",
          "hover:border-accent transition-colors duration-150",
          isPending && "opacity-60",
        )}
      >
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={cn("transition-transform", open && "rotate-180")}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl border border-border-strong bg-surface-2 shadow-2xl shadow-black/50 py-1.5 overflow-hidden"
          >
            {CITIES.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.slug === city}
                  onClick={() => choose(c.slug)}
                  className={cn(
                    "w-full text-left px-3.5 py-2 text-sm transition-colors duration-150 hover:bg-surface",
                    c.slug === city ? "text-accent font-medium" : "text-text",
                  )}
                >
                  {cityLabel(c.slug, lang)}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
