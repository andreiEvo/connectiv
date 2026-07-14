import { createClient } from "@/lib/supabase/client";

export const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export type ImageUploadError = "too_large" | "not_image" | "not_authenticated" | "upload_failed";

function extensionFor(blob: Blob): string {
  if (blob instanceof File) {
    const fromName = blob.name.split(".").pop();
    if (fromName) return fromName;
  }
  const fromType = blob.type.split("/").pop();
  return fromType || "jpg";
}

export async function uploadProfileImage(
  blob: Blob,
  kind: "avatar" | "cover",
): Promise<{ ok: true; path: string } | { ok: false; error: ImageUploadError }> {
  if (!blob.type.startsWith("image/")) return { ok: false, error: "not_image" };
  if (blob.size > MAX_PROFILE_IMAGE_BYTES) return { ok: false, error: "too_large" };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const path = `${user.id}/${kind}.${extensionFor(blob)}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) return { ok: false, error: "upload_failed" };

  return { ok: true, path };
}

export function imageUploadErrorMessage(error: ImageUploadError): string {
  switch (error) {
    case "too_large":
      return "Imaginea e prea mare (maxim 10MB).";
    case "not_image":
      return "Alege un fișier imagine (JPG, PNG, WEBP).";
    case "not_authenticated":
      return "Trebuie să fii autentificat.";
    default:
      return "Upload-ul a eșuat. Încearcă din nou.";
  }
}
