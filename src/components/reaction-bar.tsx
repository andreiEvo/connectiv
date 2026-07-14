"use client";

import { useState, useTransition } from "react";
import { toggleReaction } from "@/app/actions/engagement";
import { cn } from "@/lib/cn";
import type { ReactionKind } from "@/lib/constants";

export function ReactionBar({
  postId,
  initialCounts,
  initialMine,
  onOpenComments,
  commentCount,
}: {
  postId: string;
  initialCounts: Record<ReactionKind, number>;
  initialMine: ReactionKind[];
  onOpenComments: () => void;
  commentCount: number;
}) {
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState(new Set(initialMine));
  const [, startTransition] = useTransition();

  function react(kind: ReactionKind) {
    const active = mine.has(kind);
    setMine((prev) => {
      const next = new Set(prev);
      active ? next.delete(kind) : next.add(kind);
      return next;
    });
    setCounts((prev) => ({ ...prev, [kind]: prev[kind] + (active ? -1 : 1) }));
    startTransition(async () => {
      const result = await toggleReaction(postId, kind);
      if ("error" in result) {
        setMine((prev) => {
          const next = new Set(prev);
          active ? next.add(kind) : next.delete(kind);
          return next;
        });
        setCounts((prev) => ({ ...prev, [kind]: prev[kind] + (active ? 1 : -1) }));
      }
    });
  }

  return (
    <div className="flex items-center gap-3 pointer-events-auto">
      <ReactionButton
        active={mine.has("foc")}
        count={counts.foc}
        label="Foc"
        onClick={() => react("foc")}
        icon={
          <path
            d="M12 2c1 3-2 4-2 7a4 4 0 108 0c0-1-.5-2-1-2 .5 2-1 3-2 3-1.5 0-2-1.5-1-3-2 0-3.5 2-3.5 4a5.5 5.5 0 1011 0c0-4-3-6-3-6s.5 2-.5 2c0-2.5-3-3-6-5z"
            fill="currentColor"
          />
        }
      />
      <ReactionButton
        active={mine.has("fulger")}
        count={counts.fulger}
        label="Fulger"
        onClick={() => react("fulger")}
        icon={
          <path
            d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"
            fill="currentColor"
          />
        }
      />
      <button
        type="button"
        onClick={onOpenComments}
        aria-label="Comentarii"
        className="flex items-center gap-1.5 text-white/85 hover:text-accent transition-colors duration-150"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M4 5h16v11H8l-4 4V5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs font-medium tabular-nums">{commentCount}</span>
      </button>
    </div>
  );
}

function ReactionButton({
  active,
  count,
  label,
  onClick,
  icon,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-150 active:scale-90",
        active ? "text-accent" : "text-white/85 hover:text-accent",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        {icon}
      </svg>
      <span className="text-xs font-medium tabular-nums">{count}</span>
    </button>
  );
}
