"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/app/actions/language";
import type { LangCode } from "@/lib/lang-cookie";

const LanguageContext = createContext<{
  lang: LangCode;
  setLang: (lang: LangCode) => void;
} | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: LangCode;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<LangCode>(initialLang);
  const router = useRouter();

  function setLang(next: LangCode) {
    if (next === lang) return;
    setLangState(next);
    setLanguage(next).then(() => router.refresh());
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLang(): LangCode {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx.lang;
}

export function useSetLang(): (lang: LangCode) => void {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useSetLang must be used within a LanguageProvider");
  return ctx.setLang;
}
