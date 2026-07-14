"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CitySlug } from "@/lib/constants";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Trebuie să fii autentificat." };

  const fullName = (formData.get("fullName") as string)?.trim();
  const buildingWhat = (formData.get("buildingWhat") as string)?.trim();
  const city = formData.get("city") as CitySlug;

  if (!fullName) return { error: "Numele nu poate fi gol." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, building_what: buildingWhat, city })
    .eq("id", user.id);

  if (error) return { error: "Nu am putut salva modificările." };

  revalidatePath("/settings");
  revalidatePath(`/profile/${user.id}`);
  return { ok: true };
}

/** MVP toggle for the premium flag — no real billing is wired up yet. */
export async function togglePremiumFlag(nextValue: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Trebuie să fii autentificat." };

  await supabase.from("profiles").update({ is_premium: nextValue }).eq("id", user.id);
  revalidatePath("/settings");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
