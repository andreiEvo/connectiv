import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/profile";
import { SettingsForm } from "@/components/settings-form";
import { PremiumCard } from "@/components/premium-card";
import { DeleteAccountButton } from "@/components/delete-account-button";
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

      <div>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-3">
          Legal
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/terms" className="text-text-muted hover:text-accent transition-colors">
            Termeni și Condiții
          </Link>
          <Link href="/privacy" className="text-text-muted hover:text-accent transition-colors">
            Politica de Confidențialitate
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <form action={signOut}>
          <Button type="submit" variant="secondary" className="w-full">
            Ieși din cont
          </Button>
        </form>

        <DeleteAccountButton />
      </div>

      <p className="text-xs text-text-muted text-center pt-2">
        © {new Date().getFullYear()} connectiv. Toate drepturile rezervate.
      </p>
    </div>
  );
}
