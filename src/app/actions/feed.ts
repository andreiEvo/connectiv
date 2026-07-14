"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchFeedPage, type FeedPost } from "@/lib/feed-query";
import type { CitySlug } from "@/lib/constants";

export async function loadMorePosts(input: {
  tab: "for-you" | "following";
  city: CitySlug;
  offset: number;
}): Promise<{ posts: FeedPost[]; hasMore: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { posts: [], hasMore: false };

  return fetchFeedPage(supabase, { userId: user.id, ...input });
}
