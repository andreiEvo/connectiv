"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions/posts";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function DeletePostButton({
  postId,
  onDeleted,
  className,
  iconOnly,
}: {
  postId: string;
  onDeleted?: () => void;
  className?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.ok) {
        setOpen(false);
        onDeleted?.();
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Șterge postarea"
        className={cn(
          "flex items-center justify-center transition-colors duration-150 text-white/85 hover:text-red-400",
          iconOnly ? "h-8 w-8 rounded-full bg-black/40" : "h-11 w-11 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm",
          className,
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0v12a1 1 0 001 1h6a1 1 0 001-1V7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <p className="font-display text-lg font-semibold mb-1.5">Ștergi postarea?</p>
        <p className="text-sm text-text-muted mb-5 leading-relaxed">
          Postarea, reacțiile, comentariile și salvările asociate vor fi șterse permanent.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
            Renunță
          </Button>
          <Button variant="danger" className="flex-1" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Se șterge…" : "Șterge"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
