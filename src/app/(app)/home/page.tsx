import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CITY_COOKIE } from "@/lib/city-cookie";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import { t } from "@/lib/i18n/dictionary";
import { DEFAULT_CITY, type CitySlug } from "@/lib/constants";
import { fetchFeedPage, FEED_PAGE_SIZE } from "@/lib/feed-query";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeGrid } from "@/components/home-grid";
import { Tagline } from "@/components/tagline";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cookieStore = await cookies();
  const city = (cookieStore.get(CITY_COOKIE)?.value as CitySlug) ?? DEFAULT_CITY;
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  const { posts, hasMore } = await fetchFeedPage(supabase, {
    userId: user.id,
    tab: "for-you",
    city,
    offset: 0,
    limit: 12,
  });

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4">
      <div className="px-1 mb-4">
        <Tagline />
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<Logo size={32} />}
          title={t(lang, "empty_home_title")}
          description={t(lang, "empty_home_description")}
          action={
            <Link
              href="/compose"
              className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent/90 transition-colors"
            >
              {t(lang, "create_first_post")}
            </Link>
          }
        />
      ) : (
        <HomeGrid initialPosts={posts} initialHasMore={hasMore} city={city} pageSize={FEED_PAGE_SIZE} />
      )}
    </div>
  );
}
