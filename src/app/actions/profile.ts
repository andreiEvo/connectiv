"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CITIES, type CitySlug } from "@/lib/constants";

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  buildingWhat: z.string().trim().max(140),
  city: z.enum(CITIES.map((c) => c.slug) as [CitySlug, ...CitySlug[]]),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Trebuie să fii autentificat." };

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    buildingWhat: formData.get("buildingWhat"),
    city: formData.get("city"),
  });
  if (!parsed.success) return { error: "Numele nu poate fi gol." };
  const { fullName, buildingWhat, city } = parsed.data;

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
