"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANG_COOKIE, type LangCode } from "@/lib/lang-cookie";

export async function setLanguage(lang: LangCode) {
  const cookieStore = await cookies();
  cookieStore.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
