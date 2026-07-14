"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/actions/conversations";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { actionTypeLabel, type ActionTypeSlug } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Message, Profile } from "@/lib/supabase/types";

export function MessageThread({
  conversationId,
  currentUserId,
  otherUser,
  actionType,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherUser: Profile;
  actionType: ActionTypeSlug;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setDraft("");

    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const result = await sendMessage(conversationId, body);
    setSending(false);
    if (!result.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-lg lg:max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={otherUser.full_name} src={otherUser.avatar_url} size={36} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{otherUser.full_name}</p>
            <p className="text-xs text-text-muted truncate">{otherUser.building_what}</p>
          </div>
        </Link>
        <span className="text-[10px] uppercase tracking-wide text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5 shrink-0">
          {actionTypeLabel(actionType)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  mine
                    ? "bg-accent text-on-accent rounded-br-sm"
                    : "bg-surface border border-border text-text rounded-bl-sm",
                )}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Scrie un mesaj…"
          className="flex-1 h-11 rounded-full bg-surface border border-border-strong px-4 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-150"
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || sending} aria-label="Trimite">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M4 12l16-7-6 16-2.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
          </svg>
        </Button>
      </form>
    </div>
  );
}
