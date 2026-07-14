"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey } from "@/lib/month";
import { FREE_MONTHLY_CONVERSATIONS, type ActionTypeSlug } from "@/lib/constants";

export type StartConversationInput = {
  recipientId: string;
  postId: string | null;
  actionType: ActionTypeSlug;
  initialMessage: string;
};

export type StartConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; reason: "not_authenticated" | "self" | "limit_reached" };

export async function startConversation(
  input: StartConversationInput,
): Promise<StartConversationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: "not_authenticated" };
  if (user.id === input.recipientId) return { ok: false, reason: "self" };

  // Reuse an existing thread for the same pair + action type instead of spawning duplicates.
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("initiator_id", user.id)
    .eq("recipient_id", input.recipientId)
    .eq("action_type", input.actionType)
    .maybeSingle();

  if (existing) {
    revalidatePath("/messages");
    return { ok: true, conversationId: existing.id };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const month = currentMonthKey();
  const { data: usage } = await supabase
    .from("usage_counters")
    .select("conversations_started")
    .eq("user_id", user.id)
    .eq("month", month)
    .maybeSingle();

  const used = usage?.conversations_started ?? 0;
  if (!profile?.is_premium && used >= FREE_MONTHLY_CONVERSATIONS) {
    return { ok: false, reason: "limit_reached" };
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      initiator_id: user.id,
      recipient_id: input.recipientId,
      post_id: input.postId,
      action_type: input.actionType,
    })
    .select("id")
    .single();

  if (convError || !conversation) {
    return { ok: false, reason: "limit_reached" };
  }

  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    body: input.initialMessage,
  });

  if (usage) {
    await supabase
      .from("usage_counters")
      .update({ conversations_started: used + 1 })
      .eq("user_id", user.id)
      .eq("month", month);
  } else {
    await supabase
      .from("usage_counters")
      .insert({ user_id: user.id, month, conversations_started: 1 });
  }

  revalidatePath("/messages");
  return { ok: true, conversationId: conversation.id };
}

export async function sendMessage(conversationId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: trimmed });

  if (error) return { ok: false as const };

  revalidatePath(`/messages/${conversationId}`);
  return { ok: true as const };
}
