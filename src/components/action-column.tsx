"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, toggleSave } from "@/app/actions/social";
import { startConversation } from "@/app/actions/conversations";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { actionTypePromptPrefix, type ActionTypeSlug } from "@/lib/constants";
import type { PostWithAuthor } from "@/lib/supabase/types";

function snippetOf(post: PostWithAuthor): string {
  const source = post.description?.trim() || post.author.building_what?.trim() || "";
  if (source.length <= 70) return source;
  return source.slice(0, 70).trimEnd() + "…";
}

function buildMessage(
  actionType: ActionTypeSlug,
  post: PostWithAuthor,
  meetingSpots: { name: string; area: string }[],
): string {
  const prefix = actionTypePromptPrefix(actionType);
  const snippet = snippetOf(post);
  const base = snippet ? `Salut! ${prefix} "${snippet}".` : `Salut! ${prefix} proiectul tău.`;

  if (actionType === "cafea" && meetingSpots.length > 0) {
    const spotsText = meetingSpots
      .slice(0, 3)
      .map((s) => `${s.name} (${s.area})`)
      .join(", ");
    return `${base} Ce zici de o cafea la una din zonele astea: ${spotsText}?`;
  }

  return base;
}

export function ActionColumn({
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
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [saved, setSaved] = useState(initialSaved);
  const [pendingAction, setPendingAction] = useState<ActionTypeSlug | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [, startTransition] = useTransition();

  const isOwnPost = post.author_id === currentUserId;

  function handleMessageAction(actionType: ActionTypeSlug) {
    if (isOwnPost || pendingAction) return;
    setPendingAction(actionType);
    startTransition(async () => {
      const result = await startConversation({
        recipientId: post.author_id,
        postId: post.id,
        actionType,
        initialMessage: buildMessage(actionType, post, meetingSpots),
      });
      setPendingAction(null);
      if (result.ok) {
        router.push(`/messages/${result.conversationId}`);
      } else if (result.reason === "limit_reached") {
        setLimitReached(true);
      }
    });
  }

  function handleFollow() {
    if (isOwnPost) return;
    setFollowing((v) => !v);
    startTransition(async () => {
      const result = await toggleFollow(post.author_id);
      if (typeof result.following === "boolean") setFollowing(result.following);
    });
  }

  function handleSave() {
    setSaved((v) => !v);
    startTransition(async () => {
      const result = await toggleSave(post.id);
      if (typeof result.saved === "boolean") setSaved(result.saved);
    });
  }

  if (isOwnPost) {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] uppercase tracking-wide text-text-muted rotate-0 bg-surface/80 border border-border rounded-full px-2 py-1">
          Postarea ta
        </span>
        <ActionIconButton onClick={handleSave} active={saved} label="Salvează" icon="save" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3.5">
      <ActionIconButton
        onClick={() => handleMessageAction("sfat")}
        label="Cere sfat"
        icon="advice"
        primary
        loading={pendingAction === "sfat"}
      />
      <ActionIconButton
        onClick={() => handleMessageAction("cafea")}
        label="Hai la o cafea"
        icon="coffee"
        loading={pendingAction === "cafea"}
      />
      <ActionIconButton
        onClick={() => handleMessageAction("colaborare")}
        label="Propune colaborare"
        icon="handshake"
        loading={pendingAction === "colaborare"}
      />
      <ActionIconButton
        onClick={handleFollow}
        active={following}
        label={following ? "Urmărești" : "Urmărește progresul"}
        icon="follow"
      />
      <ActionIconButton onClick={handleSave} active={saved} label="Salvează" icon="save" />

      <Dialog open={limitReached} onClose={() => setLimitReached(false)}>
        <p className="font-display text-lg font-semibold mb-1.5">
          Ai folosit 5/5 conversații luna asta
        </p>
        <p className="text-sm text-text-muted mb-5 leading-relaxed">
          Treci la Premium pentru conversații nelimitate și vizibilitate crescută în feed.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setLimitReached(false)}
          >
            Renunță
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setLimitReached(false);
              router.push("/settings");
            }}
          >
            Treci la Premium
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  advice: (
    <path
      d="M12 3a7 7 0 00-4 12.7V19l4 2 4-2v-3.3A7 7 0 0012 3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  coffee: (
    <path
      d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9z M17 10h1.5a2.5 2.5 0 010 5H17 M8 3c-.5 1 0 1.5-.5 2.5M12 3c-.5 1 0 1.5-.5 2.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
  ),
  handshake: (
    <path
      d="M3 12l4-4 4 3 3-3 3 1 4 4-3 3-2-1-3 3-3-2-3 1z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  follow: (
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
  save: (
    <path
      d="M6 3.5h12v17l-6-3.5-6 3.5v-17z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

function ActionIconButton({
  onClick,
  label,
  icon,
  primary,
  active,
  loading,
}: {
  onClick: () => void;
  label: string;
  icon: keyof typeof ICONS;
  primary?: boolean;
  active?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center justify-center h-11 w-11 rounded-full border transition-all duration-150 active:scale-90 disabled:opacity-60",
        primary
          ? "bg-accent border-accent text-on-accent hover:bg-accent/90"
          : active
            ? "bg-accent/15 border-accent text-accent"
            : "bg-black/40 border-white/15 text-white hover:border-accent hover:text-accent backdrop-blur-sm",
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        {ICONS[icon]}
      </svg>
    </button>
  );
}
