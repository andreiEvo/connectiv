import { createClient } from "@/lib/supabase/client";

export const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

export type ImageUploadError = "too_large" | "not_image" | "not_authenticated" | "upload_failed";

export async function uploadProfileImage(
  file: File,
  kind: "avatar" | "cover",
): Promise<{ ok: true; path: string } | { ok: false; error: ImageUploadError }> {
  if (!file.type.startsWith("image/")) return { ok: false, error: "not_image" };
  if (file.size > MAX_PROFILE_IMAGE_BYTES) return { ok: false, error: "too_large" };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return { ok: false, error: "upload_failed" };

  return { ok: true, path };
}

export function imageUploadErrorMessage(error: ImageUploadError): string {
  switch (error) {
    case "too_large":
      return "Imaginea e prea mare (maxim 2MB).";
    case "not_image":
      return "Alege un fișier imagine (JPG, PNG, WEBP).";
    case "not_authenticated":
      return "Trebuie să fii autentificat.";
    default:
      return "Upload-ul a eșuat. Încearcă din nou.";
  }
}
