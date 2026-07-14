import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageThread } from "@/components/message-thread";
import type { ActionTypeSlug } from "@/lib/constants";
import type { Message, Profile } from "@/lib/supabase/types";

type ConversationWithParticipants = {
  id: string;
  initiator_id: string;
  recipient_id: string;
  action_type: ActionTypeSlug;
  initiator: Profile;
  recipient: Profile;
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: conversationData } = await supabase
    .from("conversations")
    .select(
      "*, initiator:profiles!conversations_initiator_id_fkey(*), recipient:profiles!conversations_recipient_id_fkey(*)",
    )
    .eq("id", conversationId)
    .maybeSingle();

  const conversation = conversationData as unknown as ConversationWithParticipants | null;

  if (!conversation) notFound();
  if (conversation.initiator_id !== user.id && conversation.recipient_id !== user.id) notFound();

  const other = (
    conversation.initiator_id === user.id ? conversation.recipient : conversation.initiator
  ) as Profile;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <MessageThread
      conversationId={conversationId}
      currentUserId={user.id}
      otherUser={other}
      actionType={conversation.action_type}
      initialMessages={(messages as Message[]) ?? []}
    />
  );
}
