"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" as const };
  if (user.id === targetUserId) return { error: "self" as const };

  const allowed = await checkRateLimit(`follow:${user.id}`, { limit: 60, windowSeconds: 60 });
  if (!allowed) return { error: "rate_limited" as const };

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
    revalidatePath("/feed");
    return { following: false };
  }

  await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
  revalidatePath("/feed");
  return { following: true };
}

export async function toggleSave(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" as const };

  const { data: existing } = await supabase
    .from("saves")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saves").delete().eq("user_id", user.id).eq("post_id", postId);
    revalidatePath("/feed");
    return { saved: false };
  }

  await supabase.from("saves").insert({ user_id: user.id, post_id: postId });
  revalidatePath("/feed");
  return { saved: true };
}
