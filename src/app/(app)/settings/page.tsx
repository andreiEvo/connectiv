import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/profile";
import { SettingsForm } from "@/components/settings-form";
import { PremiumCard } from "@/components/premium-card";
import { Button } from "@/components/ui/button";
import { currentMonthKey } from "@/lib/month";
import type { Profile } from "@/lib/supabase/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: usage }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("usage_counters")
      .select("conversations_started")
      .eq("user_id", user.id)
      .eq("month", currentMonthKey())
      .maybeSingle(),
  ]);

  if (!profile) redirect("/auth/login");

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      <h1 className="font-display text-xl font-semibold">Setări</h1>

      <PremiumCard
        initialIsPremium={(profile as Profile).is_premium}
        conversationsUsed={usage?.conversations_started ?? 0}
      />

      <div>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
          Profil
        </h2>
        <SettingsForm profile={profile as Profile} email={user.email ?? ""} />
      </div>

      <form action={signOut}>
        <Button type="submit" variant="danger" className="w-full">
          Ieși din cont
        </Button>
      </form>
    </div>
  );
}
