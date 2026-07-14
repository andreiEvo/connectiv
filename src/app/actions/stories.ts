"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import type { StoryWithAuthor } from "@/lib/supabase/types";

export type CreateStoryResult = { ok: true } | { ok: false; error: string };

export async function createStory(videoPath: string): Promise<CreateStoryResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Trebuie să fii autentificat." };

  if (!videoPath || !videoPath.startsWith(`${user.id}/stories/`)) {
    return { ok: false, error: "Fișier video invalid." };
  }

  const allowed = await checkRateLimit(`story:${user.id}`, { limit: 10, windowSeconds: 60 * 60 });
  if (!allowed) return { ok: false, error: "Ai postat prea multe story-uri recent." };

  const { data } = supabase.storage.from("videos").getPublicUrl(videoPath);

  const { error } = await supabase.from("stories").insert({
    author_id: user.id,
    video_url: data.publicUrl,
  });
  if (error) return { ok: false, error: "Nu am putut publica story-ul. Încearcă din nou." };

  revalidatePath("/home");
  return { ok: true };
}

/** One entry per author with an active story, most recent first — for the stories bar. */
export async function getActiveStoryAuthors(): Promise<
  { author: StoryWithAuthor["author"]; latestStoryId: string; storyCount: number }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, created_at, author:profiles!stories_author_id_fkey(*)")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const rows = (data as unknown as { id: string; created_at: string; author: StoryWithAuthor["author"] }[]) ?? [];

  const byAuthor = new Map<string, { author: StoryWithAuthor["author"]; latestStoryId: string; storyCount: number }>();
  for (const row of rows) {
    const existing = byAuthor.get(row.author.id);
    if (existing) {
      existing.storyCount += 1;
    } else {
      byAuthor.set(row.author.id, { author: row.author, latestStoryId: row.id, storyCount: 1 });
    }
  }
  return [...byAuthor.values()];
}

export async function getUserStories(userId: string): Promise<StoryWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("*, author:profiles!stories_author_id_fkey(*)")
    .eq("author_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true });
  return (data as unknown as StoryWithAuthor[]) ?? [];
}

export async function hasActiveStory(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("stories")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gt("expires_at", new Date().toISOString());
  return (count ?? 0) > 0;
}
