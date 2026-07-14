"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { CITIES, ACCOUNT_TYPES, type CitySlug, type AccountTypeSlug } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(formData: FormData): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Completează email și parolă." };

  const ip = await clientIp();
  const [byEmail, byIp] = await Promise.all([
    checkRateLimit(`login:${parsed.data.email}`, { limit: 5, windowSeconds: 15 * 60 }),
    checkRateLimit(`login-ip:${ip}`, { limit: 20, windowSeconds: 15 * 60 }),
  ]);
  if (!byEmail || !byIp) {
    return { ok: false, error: "Prea multe încercări. Așteaptă câteva minute și reîncearcă." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: "Email sau parolă greșită. Încearcă din nou." };

  return { ok: true };
}

const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  buildingWhat: z.string().trim().min(1).max(140),
  city: z.enum(CITIES.map((c) => c.slug) as [CitySlug, ...CitySlug[]]),
  accountType: z.enum(ACCOUNT_TYPES.map((a) => a.slug) as [AccountTypeSlug, ...AccountTypeSlug[]]),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
});

export type RegisterResult =
  | { ok: true; hasSession: boolean }
  | { ok: false; error: string };

export async function register(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    buildingWhat: formData.get("buildingWhat"),
    city: formData.get("city"),
    accountType: formData.get("accountType"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Completează toate câmpurile corect." };
  }

  const ip = await clientIp();
  const allowed = await checkRateLimit(`register-ip:${ip}`, { limit: 8, windowSeconds: 60 * 60 });
  if (!allowed) {
    return { ok: false, error: "Prea multe conturi create recent de la această conexiune." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        building_what: parsed.data.buildingWhat,
        city: parsed.data.city,
        account_type: parsed.data.accountType,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      error: error.message.includes("already registered")
        ? "Există deja un cont cu acest email."
        : "Nu am putut crea contul. Încearcă din nou.",
    };
  }

  return { ok: true, hasSession: !!data.session };
}
