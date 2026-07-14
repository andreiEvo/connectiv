import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CITY_COOKIE } from "@/lib/city-cookie";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import { t } from "@/lib/i18n/dictionary";
import { DEFAULT_CITY, type CitySlug } from "@/lib/constants";
import { fetchFeedPage, fetchSinglePost, FEED_PAGE_SIZE, type FeedPost } from "@/lib/feed-query";
import { FeedTabs } from "@/components/feed-tabs";
import { FeedList } from "@/components/feed-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; post?: string }>;
}) {
  const { tab: tabParam, post: anchorPostId } = await searchParams;
  const tab = tabParam === "following" ? "following" : "for-you";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cookieStore = await cookies();
  const city = (cookieStore.get(CITY_COOKIE)?.value as CitySlug) ?? DEFAULT_CITY;
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  const [{ data: followRows }, { data: saveRows }, { data: spotRows }, page] = await Promise.all([
    supabase.from("follows").select("following_id").eq("follower_id", user.id),
    supabase.from("saves").select("post_id").eq("user_id", user.id),
    supabase.from("meeting_spots").select("city, name, area"),
    fetchFeedPage(supabase, { userId: user.id, tab, city, offset: 0 }),
  ]);

  const followingSet = new Set((followRows ?? []).map((r) => r.following_id));
  const savedIds = new Set((saveRows ?? []).map((r) => r.post_id));

  let posts: FeedPost[] = page.posts;
  let hasMore = page.hasMore;

  if (anchorPostId && !posts.some((p) => p.id === anchorPostId)) {
    const anchor = await fetchSinglePost(supabase, anchorPostId, user.id);
    if (anchor) posts = [anchor, ...posts];
  }

  const spotsByCity = new Map<string, { name: string; area: string }[]>();
  for (const row of spotRows ?? []) {
    const list = spotsByCity.get(row.city) ?? [];
    list.push({ name: row.name, area: row.area });
    spotsByCity.set(row.city, list);
  }

  return (
    <div className="relative flex-1 min-h-0">
      <FeedTabs active={tab} lang={lang} />

      {posts.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <EmptyState
            icon={<Logo size={32} />}
            title={
              tab === "following"
                ? t(lang, "empty_following_title")
                : t(lang, "empty_feed_title")
            }
            description={
              tab === "following"
                ? t(lang, "empty_following_description")
                : t(lang, "empty_feed_description")
            }
            action={
              <Link
                href="/compose"
                className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent/90 transition-colors"
              >
                {t(lang, "create_first_post")}
              </Link>
            }
          />
        </div>
      ) : (
        <FeedList
          initialPosts={posts}
          initialHasMore={hasMore}
          tab={tab}
          city={city}
          currentUserId={user.id}
          followingIds={[...followingSet]}
          savedPostIds={[...savedIds]}
          meetingSpotsByCity={Object.fromEntries(spotsByCity)}
          anchorPostId={anchorPostId ?? null}
          pageSize={FEED_PAGE_SIZE}
        />
      )}
    </div>
  );
}
