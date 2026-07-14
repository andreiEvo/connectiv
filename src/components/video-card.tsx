"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ActionColumn } from "@/components/action-column";
import { ReactionBar } from "@/components/reaction-bar";
import { CommentSheet } from "@/components/comment-sheet";
import { Logo } from "@/components/logo";
import { categoryLabel, cityLabel } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { downloadEventIcs } from "@/lib/ics";
import { useLang } from "@/lib/i18n/language-provider";
import type { FeedPost } from "@/lib/feed-query";

export function VideoCard({
  post,
  index,
  currentUserId,
  initialFollowing,
  initialSaved,
  meetingSpots,
  renderVideo,
  onActive,
}: {
  post: FeedPost;
  index: number;
  currentUserId: string;
  initialFollowing: boolean;
  initialSaved: boolean;
  meetingSpots: { name: string; area: string }[];
  renderVideo: boolean;
  onActive: (index: number) => void;
}) {
  const lang = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [spark, setSpark] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const wasActive = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const active = entry.isIntersecting && entry.intersectionRatio > 0.6;
        if (active && !wasActive.current) {
          onActive(index);
          setSpark(true);
          window.setTimeout(() => setSpark(false), 260);
        }
        wasActive.current = active;

        const video = videoRef.current;
        if (!video) return;
        if (active) {
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
  }, [index, onActive]);

  const showVideoElement = renderVideo && !!post.video_url;

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      {showVideoElement ? (
        <video
          ref={videoRef}
          src={post.video_url!}
          poster={post.thumbnail_url ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onClick={() => setMuted((m) => !m)}
        />
      ) : post.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbnail_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-surface-2 p-8">
          <p className="font-display text-xl font-medium text-text-muted text-center leading-snug">
            {post.description || "Fără descriere"}
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

      <div
        aria-hidden
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-200 ease-out",
          spark ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(circle at 85% 90%, color-mix(in srgb, var(--color-accent) 35%, transparent), transparent 55%)",
        }}
      >
        <Logo
          size={22}
          className="absolute bottom-24 right-6 text-accent drop-shadow-[0_0_8px_var(--color-accent)]"
        />
      </div>

      {showVideoElement && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-14 w-14 rounded-full bg-black/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 pb-6">
        <div className="flex-1 min-w-0 space-y-2">
          <Link href={`/profile/${post.author_id}`} className="block space-y-2">
            <span className="inline-block text-[11px] font-medium uppercase tracking-wide text-on-accent bg-accent rounded-full px-2.5 py-1">
              {categoryLabel(post.category, lang)}
            </span>
            <div className="flex items-center gap-2">
              <Avatar name={post.author.full_name} src={post.author.avatar_url} size={32} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text truncate">{post.author.full_name}</p>
                <p className="text-xs text-text-muted truncate">{cityLabel(post.city, lang)}</p>
              </div>
            </div>
            <p className="text-sm text-text/90 leading-snug line-clamp-3">{post.description}</p>
          </Link>

          {post.category === "eveniment" && post.event_at && (
            <AddToCalendarButton post={post} />
          )}

          <ReactionBar
            postId={post.id}
            initialCounts={post.reactionCounts}
            initialMine={post.myReactions}
            commentCount={post.commentCount}
            onOpenComments={() => setCommentsOpen(true)}
          />
        </div>

        <ActionColumn
          post={post}
          currentUserId={currentUserId}
          initialFollowing={initialFollowing}
          initialSaved={initialSaved}
          meetingSpots={meetingSpots}
        />
      </div>

      <CommentSheet postId={post.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}

function AddToCalendarButton({ post }: { post: FeedPost }) {
  const dateLabel = post.event_at
    ? new Date(post.event_at).toLocaleString("ro-RO", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <button
      type="button"
      onClick={() =>
        downloadEventIcs({
          id: post.id,
          title: `${post.author.full_name} — ${categoryLabel(post.category)}`,
          description: post.description,
          startsAt: post.event_at!,
          location: cityLabel(post.city),
        })
      }
      className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-accent bg-accent/10 border border-accent/30 rounded-full px-2.5 py-1 hover:bg-accent/20 transition-colors duration-150"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      Adaugă în calendar · {dateLabel}
    </button>
  );
}
