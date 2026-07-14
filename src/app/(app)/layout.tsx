import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo, Wordmark } from "@/components/logo";
import { CitySelector } from "@/components/city-selector";
import { LanguageToggle } from "@/components/language-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { CITY_COOKIE } from "@/lib/city-cookie";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import { DEFAULT_CITY, type CitySlug } from "@/lib/constants";
import Link from "next/link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const city = (cookieStore.get(CITY_COOKIE)?.value as CitySlug) ?? DEFAULT_CITY;
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  return (
    <div className="flex flex-col h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto px-4 gap-2">
          <Link href="/feed" className="flex items-center gap-1.5">
            <Logo size={20} className="text-accent" />
            <Wordmark className="text-base" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} />
            <CitySelector initialCity={city} />
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-lg w-full mx-auto flex flex-col">{children}</main>

      <div className="max-w-lg w-full mx-auto">
        <BottomNav profileId={user.id} lang={lang} />
      </div>
    </div>
  );
}
