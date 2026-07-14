"use client";

import { useEffect, useState } from "react";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";

export function useLang(): LangCode {
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG);
  useEffect(() => {
    const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=(ro|en)`));
    if (match) setLang(match[1] as LangCode);
  }, []);
  return lang;
}
