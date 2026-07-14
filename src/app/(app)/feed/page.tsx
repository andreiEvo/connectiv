import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CITY_COOKIE } from "@/lib/city-cookie";
import { DEFAULT_CITY, type CitySlug } from "@/lib/constants";
import { FeedTabs } from "@/components/feed-tabs";
import { VideoCard } from "@/components/video-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/logo";
import type { PostWithAuthor } from "@/lib/supabase/types";
import Link from "next/link";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "following" ? "following" : "for-you";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cookieStore = await cookies();
  const city = (cookieStore.get(CITY_COOKIE)?.value as CitySlug) ?? DEFAULT_CITY;

  const [{ data: followRows }, { data: saveRows }, { data: spotRows }] = await Promise.all([
    supabase.from("follows").select("following_id").eq("follower_id", user.id),
    supabase.from("saves").select("post_id").eq("user_id", user.id),
    supabase.from("meeting_spots").select("city, name, area"),
  ]);

  const followingIds = (followRows ?? []).map((r) => r.following_id);
  const savedIds = new Set((saveRows ?? []).map((r) => r.post_id));
  const followingSet = new Set(followingIds);

  let posts: PostWithAuthor[] = [];

  if (tab === "following") {
    if (followingIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select("*, author:profiles!posts_author_id_fkey(*)")
        .in("author_id", followingIds)
        .order("created_at", { ascending: false });
      posts = (data as PostWithAuthor[]) ?? [];
    }
  } else {
    const { data } = await supabase
      .from("posts")
      .select("*, author:profiles!posts_author_id_fkey(*)")
      .eq("city", city)
      .order("created_at", { ascending: false });
    posts = (data as PostWithAuthor[]) ?? [];
  }

  const spotsByCity = new Map<string, { name: string; area: string }[]>();
  for (const row of spotRows ?? []) {
    const list = spotsByCity.get(row.city) ?? [];
    list.push({ name: row.name, area: row.area });
    spotsByCity.set(row.city, list);
  }

  return (
    <div className="relative flex-1 min-h-0">
      <FeedTabs active={tab} />

      {posts.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <EmptyState
            icon={<Logo size={32} />}
            title={
              tab === "following"
                ? "Nu urmărești pe nimeni încă"
                : "Feed-ul e gol deocamdată"
            }
            description={
              tab === "following"
                ? "Urmărește progresul cuiva din Pentru tine ca să apară aici."
                : "Fii primul care construiește ceva vizibil aici."
            }
            action={
              <Link
                href="/compose"
                className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent/90 transition-colors"
              >
                Creează prima postare
              </Link>
            }
          />
        </div>
      ) : (
        <div className="h-full overflow-y-scroll no-scrollbar snap-y-mandatory">
          {posts.map((post) => (
            <VideoCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              initialFollowing={followingSet.has(post.author_id)}
              initialSaved={savedIds.has(post.id)}
              meetingSpots={spotsByCity.get(post.city) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
