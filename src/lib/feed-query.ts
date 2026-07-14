import type { createClient } from "@/lib/supabase/server";
import type { CitySlug, ReactionKind } from "@/lib/constants";
import type { PostWithAuthor } from "@/lib/supabase/types";

export const FEED_PAGE_SIZE = 6;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type FeedPost = PostWithAuthor & {
  reactionCounts: Record<ReactionKind, number>;
  myReactions: ReactionKind[];
  commentCount: number;
};

export async function fetchFeedPage(
  supabase: SupabaseServerClient,
  params: {
    userId: string;
    tab: "for-you" | "following";
    city: CitySlug;
    offset: number;
    limit?: number;
  },
): Promise<{ posts: FeedPost[]; hasMore: boolean }> {
  const limit = params.limit ?? FEED_PAGE_SIZE;
  const from = params.offset;
  const to = params.offset + limit - 1;

  let posts: PostWithAuthor[] = [];

  if (params.tab === "following") {
    const { data: followRows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", params.userId);
    const followingIds = (followRows ?? []).map((r) => r.following_id);

    if (followingIds.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select("*, author:profiles!posts_author_id_fkey(*)")
        .in("author_id", followingIds)
        .order("created_at", { ascending: false })
        .range(from, to);
      posts = (data as PostWithAuthor[]) ?? [];
    }
  } else {
    const { data } = await supabase
      .from("posts")
      .select("*, author:profiles!posts_author_id_fkey(*)")
      .eq("city", params.city)
      .order("created_at", { ascending: false })
      .range(from, to);
    posts = (data as PostWithAuthor[]) ?? [];
  }

  const postIds = posts.map((p) => p.id);
  const enriched = await attachReactionsAndComments(supabase, posts, params.userId);

  return { posts: enriched, hasMore: postIds.length === limit };
}

export async function fetchSinglePost(
  supabase: SupabaseServerClient,
  postId: string,
  userId: string,
): Promise<FeedPost | null> {
  const { data } = await supabase
    .from("posts")
    .select("*, author:profiles!posts_author_id_fkey(*)")
    .eq("id", postId)
    .maybeSingle();
  if (!data) return null;
  const [enriched] = await attachReactionsAndComments(supabase, [data as PostWithAuthor], userId);
  return enriched;
}

async function attachReactionsAndComments(
  supabase: SupabaseServerClient,
  posts: PostWithAuthor[],
  userId: string,
): Promise<FeedPost[]> {
  const postIds = posts.map((p) => p.id);
  if (postIds.length === 0) return [];

  const [{ data: reactionRows }, { data: commentRows }] = await Promise.all([
    supabase.from("reactions").select("post_id, user_id, kind").in("post_id", postIds),
    supabase.from("comments").select("post_id").in("post_id", postIds),
  ]);

  const reactionCountsByPost = new Map<string, Record<ReactionKind, number>>();
  const myReactionsByPost = new Map<string, ReactionKind[]>();
  for (const row of reactionRows ?? []) {
    const counts = reactionCountsByPost.get(row.post_id) ?? { foc: 0, fulger: 0 };
    counts[row.kind as ReactionKind] += 1;
    reactionCountsByPost.set(row.post_id, counts);

    if (row.user_id === userId) {
      const mine = myReactionsByPost.get(row.post_id) ?? [];
      mine.push(row.kind as ReactionKind);
      myReactionsByPost.set(row.post_id, mine);
    }
  }

  const commentCountByPost = new Map<string, number>();
  for (const row of commentRows ?? []) {
    commentCountByPost.set(row.post_id, (commentCountByPost.get(row.post_id) ?? 0) + 1);
  }

  return posts.map((post) => ({
    ...post,
    reactionCounts: reactionCountsByPost.get(post.id) ?? { foc: 0, fulger: 0 },
    myReactions: myReactionsByPost.get(post.id) ?? [],
    commentCount: commentCountByPost.get(post.id) ?? 0,
  }));
}
