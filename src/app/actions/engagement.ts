"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ReactionKind } from "@/lib/constants";
import type { CommentWithAuthor } from "@/lib/supabase/types";

export async function toggleReaction(postId: string, kind: ReactionKind) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" as const };

  const allowed = await checkRateLimit(`react:${user.id}`, { limit: 60, windowSeconds: 60 });
  if (!allowed) return { error: "rate_limited" as const };

  const { data: existing } = await supabase
    .from("reactions")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .eq("kind", kind);
    revalidatePath("/feed");
    return { active: false };
  }

  await supabase.from("reactions").insert({ post_id: postId, user_id: user.id, kind });
  revalidatePath("/feed");
  return { active: true };
}

export async function getComments(postId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("*, author:profiles!comments_author_id_fkey(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data as unknown as CommentWithAuthor[]) ?? [];
}

export async function addComment(postId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return { error: "empty" as const };
  if (trimmed.length > 500) return { error: "too_long" as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" as const };

  const allowed = await checkRateLimit(`comment:${user.id}`, { limit: 20, windowSeconds: 60 });
  if (!allowed) return { error: "rate_limited" as const };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed });
  if (error) return { error: "failed" as const };

  revalidatePath("/feed");
  return { ok: true as const };
}
