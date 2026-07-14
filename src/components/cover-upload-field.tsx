"use client";

import { useRef, useState } from "react";
import { uploadProfileImage, imageUploadErrorMessage } from "@/lib/image-upload";
import { updateCoverUrl } from "@/app/actions/profile";
import { ImageCropperModal } from "@/components/image-cropper-modal";
import { cn } from "@/lib/cn";

export function CoverUploadField({ initialUrl }: { initialUrl: string | null }) {
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

    const result = await uploadProfileImage(blob, "cover");
    if (!result.ok) {
      setError(imageUploadErrorMessage(result.error));
      setUploading(false);
      setUrl(initialUrl);
      return;
    }

    const saved = await updateCoverUrl(result.path);
    setUploading(false);
    if (!saved.ok) {
      setError(saved.error);
      setUrl(initialUrl);
      return;
    }
    setUrl(saved.url);
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative w-full h-28 rounded-xl overflow-hidden border border-border-strong group",
          !url && "bg-gradient-to-br from-surface to-surface-2",
        )}
        aria-label="Schimbă imaginea de fundal a profilului"
      >
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 group-hover:bg-black/50 transition-colors duration-150">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              "h-5 w-5 transition-opacity duration-150",
              url ? "text-white opacity-0 group-hover:opacity-100" : "text-text-muted",
            )}
          >
            <path d="M4 7h3l1.5-2h7L17 7h3v12H4V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {!url && <span className="text-xs text-text-muted">Adaugă un fundal de profil</span>}
        </span>
      </button>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">JPG, PNG sau WEBP, maxim 10MB.</p>
        {uploading && <p className="text-xs text-text-muted">Se încarcă…</p>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
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
          shape="banner"
          onCancel={() => setPendingFile(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}
