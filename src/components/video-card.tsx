"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ActionColumn } from "@/components/action-column";
import { categoryLabel, cityLabel } from "@/lib/constants";
import type { PostWithAuthor } from "@/lib/supabase/types";

export function VideoCard({
  post,
  currentUserId,
  initialFollowing,
  initialSaved,
  meetingSpots,
}: {
  post: PostWithAuthor;
  currentUserId: string;
  initialFollowing: boolean;
  initialSaved: boolean;
  meetingSpots: { name: string; area: string }[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          video.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full snap-item flex-shrink-0 bg-black">
      {post.video_url ? (
        <video
          ref={videoRef}
          src={post.video_url}
          poster={post.thumbnail_url ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted={muted}
          loop
          playsInline
          onClick={() => setMuted((m) => !m)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-surface-2 p-8">
          <p className="font-display text-xl font-medium text-text-muted text-center leading-snug">
            {post.description || "Fără descriere"}
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

      {post.video_url && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-14 w-14 rounded-full bg-black/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 pb-6">
        <Link href={`/profile/${post.author_id}`} className="flex-1 min-w-0 space-y-2">
          <span className="inline-block text-[11px] font-medium uppercase tracking-wide text-on-accent bg-accent rounded-full px-2.5 py-1">
            {categoryLabel(post.category)}
          </span>
          <div className="flex items-center gap-2">
            <Avatar name={post.author.full_name} src={post.author.avatar_url} size={32} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{post.author.full_name}</p>
              <p className="text-xs text-text-muted truncate">{cityLabel(post.city)}</p>
            </div>
          </div>
          <p className="text-sm text-text/90 leading-snug line-clamp-3">{post.description}</p>
        </Link>

        <ActionColumn
          post={post}
          currentUserId={currentUserId}
          initialFollowing={initialFollowing}
          initialSaved={initialSaved}
          meetingSpots={meetingSpots}
        />
      </div>
    </div>
  );
}
