"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loadMorePosts } from "@/app/actions/feed";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/constants";
import type { CitySlug } from "@/lib/constants";
import type { FeedPost } from "@/lib/feed-query";

export function HomeGrid({
  initialPosts,
  initialHasMore,
  city,
  pageSize,
}: {
  initialPosts: FeedPost[];
  initialHasMore: boolean;
  city: CitySlug;
  pageSize: number;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const result = await loadMorePosts({ tab: "for-you", city, offset: posts.length });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...result.posts.filter((p) => !seen.has(p.id))];
      });
      setHasMore(result.hasMore);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/feed?post=${post.id}`}
            className="relative aspect-[9/16] rounded-xl overflow-hidden bg-surface-2 border border-border group"
          >
            {post.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.thumbnail_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-active:scale-95"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-3 bg-gradient-to-br from-surface to-surface-2">
                <p className="text-xs text-text-muted text-center line-clamp-5">
                  {post.description}
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wide text-on-accent bg-accent rounded-full px-2 py-0.5">
              {categoryLabel(post.category)}
            </span>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-xs font-medium text-white truncate">{post.author.full_name}</p>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="secondary" onClick={loadMore} disabled={isPending}>
            {isPending ? "Se încarcă…" : "Încarcă mai multe"}
          </Button>
        </div>
      )}
    </div>
  );
}
