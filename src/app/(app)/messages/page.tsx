import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { actionTypeLabel, type ActionTypeSlug } from "@/lib/constants";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import { t } from "@/lib/i18n/dictionary";
import type { Profile } from "@/lib/supabase/types";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cookieStore = await cookies();
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, initiator:profiles!conversations_initiator_id_fkey(*), recipient:profiles!conversations_recipient_id_fkey(*)")
    .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const rows = (conversations ?? []) as Array<{
    id: string;
    action_type: ActionTypeSlug;
    created_at: string;
    initiator_id: string;
    recipient_id: string;
    initiator: Profile;
    recipient: Profile;
  }>;

  let lastMessages = new Map<string, { body: string; created_at: string }>();
  if (rows.length > 0) {
    const { data: messages } = await supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in(
        "conversation_id",
        rows.map((r) => r.id),
      )
      .order("created_at", { ascending: false });

    for (const m of messages ?? []) {
      if (!lastMessages.has(m.conversation_id)) {
        lastMessages.set(m.conversation_id, { body: m.body, created_at: m.created_at });
      }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-lg lg:max-w-2xl mx-auto">
      <h1 className="font-display text-lg font-semibold px-4 pt-5 pb-3">Mesaje</h1>

      {rows.length === 0 ? (
        <EmptyState
          title={t(lang, "empty_messages_title")}
          description={t(lang, "empty_messages_description")}
        />
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((c) => {
            const other = c.initiator_id === user.id ? c.recipient : c.initiator;
            const last = lastMessages.get(c.id);
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors duration-150"
                >
                  <Avatar name={other.full_name} src={other.avatar_url} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text truncate">{other.full_name}</p>
                      <span className="text-[10px] uppercase tracking-wide text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5 shrink-0">
                        {actionTypeLabel(c.action_type)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {last?.body ?? "Fără mesaje încă"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
