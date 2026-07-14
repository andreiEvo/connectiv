"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMorePosts } from "@/app/actions/feed";
import { VideoCard } from "@/components/video-card";
import type { CitySlug } from "@/lib/constants";
import type { FeedPost } from "@/lib/feed-query";

const VIDEO_RENDER_WINDOW = 1;

export function FeedList({
  initialPosts,
  initialHasMore,
  tab,
  city,
  currentUserId,
  followingIds,
  savedPostIds,
  meetingSpotsByCity,
  anchorPostId,
  pageSize,
}: {
  initialPosts: FeedPost[];
  initialHasMore: boolean;
  tab: "for-you" | "following";
  city: CitySlug;
  currentUserId: string;
  followingIds: string[];
  savedPostIds: string[];
  meetingSpotsByCity: Record<string, { name: string; area: string }[]>;
  anchorPostId: string | null;
  pageSize: number;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [activeIndex, setActiveIndex] = useState(0);
  const loadingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const followingSet = new Set(followingIds);
  const savedSet = new Set(savedPostIds);

  useEffect(() => {
    if (!anchorPostId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-post-id="${anchorPostId}"]`);
    el?.scrollIntoView({ block: "start" });
  }, [anchorPostId]);

  const handleActive = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (!hasMore || loadingRef.current) return;
    if (activeIndex < posts.length - 3) return;

    loadingRef.current = true;
    loadMorePosts({ tab, city, offset: posts.length })
      .then((result) => {
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const fresh = result.posts.filter((p) => !seen.has(p.id));
          return [...prev, ...fresh];
        });
        setHasMore(result.hasMore);
      })
      .finally(() => {
        loadingRef.current = false;
      });
  }, [activeIndex, posts.length, hasMore, tab, city, pageSize]);

  return (
    <div ref={containerRef} className="h-full overflow-y-scroll no-scrollbar snap-y-mandatory">
      {posts.map((post, index) => (
        <div key={post.id} data-post-id={post.id} className="h-full snap-item">
          <VideoCard
            post={post}
            index={index}
            currentUserId={currentUserId}
            initialFollowing={followingSet.has(post.author_id)}
            initialSaved={savedSet.has(post.id)}
            meetingSpots={meetingSpotsByCity[post.city] ?? []}
            renderVideo={Math.abs(index - activeIndex) <= VIDEO_RENDER_WINDOW}
            onActive={handleActive}
          />
        </div>
      ))}
    </div>
  );
}
