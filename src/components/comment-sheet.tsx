"use client";

import { useEffect, useState, FormEvent } from "react";
import { getComments, addComment } from "@/app/actions/engagement";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CommentWithAuthor } from "@/lib/supabase/types";

export function CommentSheet({
  postId,
  open,
  onClose,
}: {
  postId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getComments(postId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [open, postId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    const result = await addComment(postId, body);
    if (!("error" in result)) {
      setDraft("");
      const fresh = await getComments(postId);
      setComments(fresh);
    }
    setSending(false);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-base font-semibold">Comentarii</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide"
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-2 text-text-muted"
        >
          ×
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-3 mb-4 -mx-1 px-1">
        {loading ? (
          <p className="text-sm text-text-muted text-center py-6">Se încarcă…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">
            Niciun comentariu încă — fii primul.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar name={c.author.full_name} src={c.author.avatar_url} size={30} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-text">{c.author.full_name}</p>
                <p className="text-sm text-text/90 leading-snug break-words">{c.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Scrie un comentariu…"
          maxLength={500}
          className="flex-1 h-10 rounded-full bg-surface border border-border-strong px-3.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-150"
        />
        <Button type="submit" size="sm" disabled={!draft.trim() || sending}>
          Trimite
        </Button>
      </form>
    </Dialog>
  );
}
