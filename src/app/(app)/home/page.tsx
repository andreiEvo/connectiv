import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import { t } from "@/lib/i18n/dictionary";
import { fetchFeedPage, FEED_PAGE_SIZE } from "@/lib/feed-query";
import { getActiveStoryAuthors, hasActiveStory } from "@/app/actions/stories";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeGrid } from "@/components/home-grid";
import { StoriesBar } from "@/components/stories-bar";
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
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  const [{ posts, hasMore }, { data: profile }, storyAuthors, ownsStory] = await Promise.all([
    fetchFeedPage(supabase, { userId: user.id, tab: "for-you", city: null, offset: 0, limit: 12 }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getActiveStoryAuthors(),
    hasActiveStory(user.id),
  ]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 lg:px-8 lg:py-8 w-full max-w-lg lg:max-w-5xl mx-auto">
      <div className="px-1 mb-4">
        <Tagline />
      </div>

      {profile && (
        <div className="mb-5">
          <StoriesBar authors={storyAuthors} currentUser={profile} currentUserHasStory={ownsStory} />
        </div>
      )}

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
        <HomeGrid initialPosts={posts} initialHasMore={hasMore} city={null} pageSize={FEED_PAGE_SIZE} />
      )}
    </div>
  );
}
