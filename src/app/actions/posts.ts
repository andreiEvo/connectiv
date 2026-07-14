"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CategorySlug, CitySlug } from "@/lib/constants";

export type CreatePostResult = { error: string } | undefined;

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Trebuie să fii autentificat." };

  const category = formData.get("category") as CategorySlug | null;
  const city = formData.get("city") as CitySlug | null;
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const videoPath = formData.get("videoPath") as string | null;

  if (!category || !city) {
    return { error: "Completează categoria și orașul." };
  }
  if (!description) {
    return { error: "Adaugă o descriere scurtă." };
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
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: "Nu am putut publica postarea. Încearcă din nou." };
  }

  revalidatePath("/feed");
  redirect("/feed");
}
