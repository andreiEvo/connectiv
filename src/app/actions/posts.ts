"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { CATEGORIES, CITIES, type CategorySlug, type CitySlug } from "@/lib/constants";

export type CreatePostResult = { error: string } | undefined;

const postSchema = z.object({
  category: z.enum(CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]]),
  city: z.enum(CITIES.map((c) => c.slug) as [CitySlug, ...CitySlug[]]),
  description: z.string().trim().min(1).max(280),
  videoPath: z.string().max(300).nullable(),
  eventAt: z.string().max(60).nullable(),
});

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Trebuie să fii autentificat." };

  const parsed = postSchema.safeParse({
    category: formData.get("category"),
    city: formData.get("city"),
    description: formData.get("description"),
    videoPath: formData.get("videoPath") as string | null,
    eventAt: formData.get("eventAt") as string | null,
  });
  if (!parsed.success) {
    return { error: "Completează categoria, orașul și o descriere scurtă." };
  }
  const { category, city, description, videoPath, eventAt } = parsed.data;

  if (category === "eveniment" && !eventAt) {
    return { error: "Adaugă data și ora evenimentului." };
  }
  if (videoPath && !videoPath.startsWith(`${user.id}/`)) {
    return { error: "Fișier video invalid." };
  }

  const allowed = await checkRateLimit(`post:${user.id}`, { limit: 10, windowSeconds: 60 * 60 });
  if (!allowed) {
    return { error: "Ai publicat prea multe postări recent. Încearcă mai târziu." };
  }

  let videoUrl: string | null = null;
  if (videoPath) {
    const { data } = supabase.storage.from("videos").getPublicUrl(videoPath);
    videoUrl = data.publicUrl;
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      category,
      city,
      description,
      video_url: videoUrl,
      event_at: category === "eveniment" && eventAt ? new Date(eventAt).toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: "Nu am putut publica postarea. Încearcă din nou." };
  }

  revalidatePath("/feed");
  redirect("/feed");
}
