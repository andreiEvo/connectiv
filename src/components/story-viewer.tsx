"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getUserStories } from "@/app/actions/stories";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import type { StoryWithAuthor } from "@/lib/supabase/types";

export function StoryViewer({
  authorIds,
  startAuthorId,
  onClose,
}: {
  authorIds: string[];
  startAuthorId: string;
  onClose: () => void;
}) {
  const [authorIndex, setAuthorIndex] = useState(() => Math.max(authorIds.indexOf(startAuthorId), 0));
  const [stories, setStories] = useState<StoryWithAuthor[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const authorId = authorIds[authorIndex];

  useEffect(() => {
    let cancelled = false;
    setStories([]);
    setStoryIndex(0);
    getUserStories(authorId).then((data) => {
      if (!cancelled) setStories(data);
    });
    return () => {
      cancelled = true;
    };
  }, [authorId]);

  function goNext() {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
      return;
    }
    if (authorIndex < authorIds.length - 1) {
      setAuthorIndex((i) => i + 1);
      setProgress(0);
      return;
    }
    onClose();
  }

  function goPrev() {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
      return;
    }
    if (authorIndex > 0) {
      setAuthorIndex((i) => i - 1);
      setProgress(0);
      return;
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  if (typeof document === "undefined") return null;

  const story = stories[storyIndex];

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <div className="relative h-full w-full max-w-md">
        {story && (
          <video
            key={story.id}
            ref={videoRef}
            src={story.video_url}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            playsInline
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onEnded={goNext}
          />
        )}

        <div className="absolute top-0 inset-x-0 z-20 flex gap-1 p-2 pt-3">
          {stories.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {story && (
          <div className="absolute top-6 inset-x-0 z-20 flex items-center justify-between px-3">
            <Link href={`/profile/${story.author.id}`} className="flex items-center gap-2">
              <Avatar name={story.author.full_name} src={story.author.avatar_url} size={32} />
              <span className="text-sm font-medium text-white">{story.author.full_name}</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Închide"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-black/40 text-white"
            >
              ×
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label="Story anterior"
          onClick={goPrev}
          className={cn("absolute left-0 top-0 h-full w-1/3")}
        />
        <button
          type="button"
          aria-label="Story următor"
          onClick={goNext}
          className={cn("absolute right-0 top-0 h-full w-2/3")}
        />
      </div>
    </div>,
    document.body,
  );
}
