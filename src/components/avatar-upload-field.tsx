"use client";

import { useRef, useState } from "react";
import { uploadProfileImage, imageUploadErrorMessage } from "@/lib/image-upload";
import { updateAvatarUrl } from "@/app/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { ImageCropperModal } from "@/components/image-cropper-modal";

export function AvatarUploadField({
  fullName,
  initialUrl,
}: {
  fullName: string;
  initialUrl: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPendingFile(file);
  }

  async function handleCropped(blob: Blob) {
    setPendingFile(null);
    setUploading(true);
    const previewUrl = URL.createObjectURL(blob);
    setUrl(previewUrl);

    const result = await uploadProfileImage(blob, "avatar");
    if (!result.ok) {
      setError(imageUploadErrorMessage(result.error));
      setUploading(false);
      setUrl(initialUrl);
      return;
    }

    const saved = await updateAvatarUrl(result.path);
    setUploading(false);
    if (!saved.ok) {
      setError(saved.error);
      setUrl(initialUrl);
      return;
    }
    setUrl(saved.url);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative group shrink-0"
        aria-label="Schimbă poza de profil"
      >
        <Avatar name={fullName} src={url} size={64} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors duration-150">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <path
              d="M4 7h3l1.5-2h7L17 7h3v12H4V7z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      </button>
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-accent hover:underline disabled:opacity-60"
        >
          {uploading ? "Se încarcă…" : "Schimbă poza"}
        </button>
        <p className="text-xs text-text-muted mt-0.5">JPG, PNG sau WEBP, maxim 2MB.</p>
        {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        value=""
      />

      {pendingFile && (
        <ImageCropperModal
          file={pendingFile}
          shape="circle"
          onCancel={() => setPendingFile(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}
