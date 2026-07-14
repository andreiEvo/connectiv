"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { StoryRing } from "@/components/story-ring";
import { StoryComposer } from "@/components/story-composer";
import { StoryViewer } from "@/components/story-viewer";
import type { Profile } from "@/lib/supabase/types";

export function StoriesBar({
  authors,
  currentUser,
  currentUserHasStory,
}: {
  authors: { author: Profile; storyCount: number }[];
  currentUser: Profile;
  currentUserHasStory: boolean;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewerAuthorId, setViewerAuthorId] = useState<string | null>(null);
  const [hasStory, setHasStory] = useState(currentUserHasStory);

  const others = authors.filter((a) => a.author.id !== currentUser.id);
  const orderedAuthorIds = [
    ...(hasStory ? [currentUser.id] : []),
    ...others.map((a) => a.author.id),
  ];

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 px-1">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => (hasStory ? setViewerAuthorId(currentUser.id) : setComposerOpen(true))}
            aria-label={hasStory ? "Vezi story-ul tău" : "Adaugă un story"}
          >
            {hasStory ? (
              <StoryRing active>
                <Avatar name={currentUser.full_name} src={currentUser.avatar_url} size={56} />
              </StoryRing>
            ) : (
              <Avatar
                name={currentUser.full_name}
                src={currentUser.avatar_url}
                size={56}
                className="opacity-90"
              />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setComposerOpen(true);
            }}
            aria-label="Adaugă un story nou"
            className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-accent text-on-accent ring-2 ring-bg text-xs font-bold"
          >
            +
          </button>
        </div>
        <span className="text-[11px] text-text-muted">Tu</span>
      </div>

      {others.map(({ author }) => (
        <button
          key={author.id}
          type="button"
          onClick={() => setViewerAuthorId(author.id)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <StoryRing active>
            <Avatar name={author.full_name} src={author.avatar_url} size={56} />
          </StoryRing>
          <span className="text-[11px] text-text-muted max-w-[56px] truncate">
            {author.full_name.split(" ")[0]}
          </span>
        </button>
      ))}

      <StoryComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPosted={() => {
          setComposerOpen(false);
          setHasStory(true);
        }}
      />

      {viewerAuthorId && (
        <StoryViewer
          authorIds={orderedAuthorIds}
          startAuthorId={viewerAuthorId}
          onClose={() => setViewerAuthorId(null)}
        />
      )}
    </div>
  );
}
