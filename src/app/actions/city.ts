"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { CitySlug } from "@/lib/constants";
import { CITY_COOKIE } from "@/lib/city-cookie";

export async function setCity(city: CitySlug) {
  const cookieStore = await cookies();
  cookieStore.set(CITY_COOKIE, city, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/feed");
}
