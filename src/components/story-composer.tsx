"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createStory } from "@/app/actions/stories";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MAX_STORY_DURATION = 30;

export function StoryComposer({
  open,
  onClose,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) return;

    const url = URL.createObjectURL(selected);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (probe.duration > MAX_STORY_DURATION) {
        setError(`Story-ul trebuie să fie sub ${MAX_STORY_DURATION} de secunde.`);
        URL.revokeObjectURL(url);
        return;
      }
      setFile(selected);
      setPreviewUrl(url);
    };
    probe.src = url;
  }

  async function handlePost() {
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Trebuie să fii autentificat.");
      setUploading(false);
      return;
    }
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${user.id}/stories/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      setError("Upload-ul a eșuat. Încearcă din nou.");
      setUploading(false);
      return;
    }

    const result = await createStory(path);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFile(null);
    setPreviewUrl(null);
    onPosted();
  }

  function handleClose() {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <p className="font-display text-base font-semibold mb-1">Story nou</p>
      <p className="text-sm text-text-muted mb-4">
        Un video de maxim {MAX_STORY_DURATION}s — vizibil 24 de ore, cu inelul de fulger pe poza
        ta de profil.
      </p>

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border-strong aspect-[9/16] max-h-72 mx-auto bg-black mb-4">
          <video src={previewUrl} className="h-full w-full object-cover" controls muted />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-border-strong py-8 flex flex-col items-center gap-2 text-text-muted hover:border-accent hover:text-accent transition-colors duration-150 mb-4"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="text-sm">Alege un video</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={handleClose}>
          Renunță
        </Button>
        <Button className="flex-1" onClick={handlePost} disabled={!file || uploading}>
          {uploading ? "Se publică…" : "Publică story"}
        </Button>
      </div>
    </Dialog>
  );
}
