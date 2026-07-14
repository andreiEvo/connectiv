"use client";

import { useRef, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES, CITIES, DEFAULT_CITY, type CategorySlug, type CitySlug } from "@/lib/constants";

const MIN_DURATION = 30;
const MAX_DURATION = 90;
const MAX_FILE_BYTES = 200 * 1024 * 1024; // 200MB safety ceiling

type Stage = "idle" | "validating" | "uploading" | "publishing" | "error";

export default function ComposePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [category, setCategory] = useState<CategorySlug>(CATEGORIES[0].slug);
  const [city, setCity] = useState<CitySlug>(DEFAULT_CITY);
  const [description, setDescription] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError(null);
    setDuration(null);
    if (!selected) {
      setFile(null);
      setVideoPreviewUrl(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setError("Fișierul e prea mare (maxim 200MB).");
      return;
    }

    setStage("validating");
    const url = URL.createObjectURL(selected);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const d = probe.duration;
      setDuration(d);
      if (d < MIN_DURATION || d > MAX_DURATION) {
        setError(
          `Video-ul are ${Math.round(d)}s. Trebuie să fie între ${MIN_DURATION} și ${MAX_DURATION} secunde.`,
        );
        setFile(null);
        setVideoPreviewUrl(null);
      } else {
        setFile(selected);
        setVideoPreviewUrl(url);
      }
      setStage("idle");
    };
    probe.src = url;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Adaugă o descriere scurtă.");
      return;
    }
    if (category === "eveniment" && !eventAt) {
      setError("Adaugă data și ora evenimentului.");
      return;
    }

    let videoPath: string | null = null;

    if (file) {
      setStage("uploading");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Trebuie să fii autentificat.");
        setStage("error");
        return;
      }
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setError("Upload-ul video a eșuat. Încearcă din nou.");
        setStage("error");
        return;
      }
      videoPath = path;
    }

    setStage("publishing");
    const formData = new FormData();
    formData.set("category", category);
    formData.set("city", city);
    formData.set("description", description.trim());
    if (videoPath) formData.set("videoPath", videoPath);
    if (category === "eveniment" && eventAt) formData.set("eventAt", eventAt);

    const result = await createPost(formData);
    if (result?.error) {
      setError(result.error);
      setStage("error");
    }
    // on success, createPost redirects to /feed
  }

  const busy = stage === "uploading" || stage === "publishing";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      <h1 className="font-display text-xl font-semibold mb-1">Ce se întâmplă azi?</h1>
      <p className="text-sm text-text-muted mb-6">
        O impresie zilnică, un proiect la care lucrezi sau un eveniment — un video scurt (30-90s)
        sau doar câteva cuvinte.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Video (opțional)</Label>
          {videoPreviewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-border-strong aspect-[9/16] max-h-80 mx-auto bg-black">
              <video src={videoPreviewUrl} className="h-full w-full object-cover" controls muted />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setVideoPreviewUrl(null);
                  setDuration(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                aria-label="Elimină video"
              >
                ×
              </button>
              {duration && (
                <span className="absolute bottom-2 left-2 text-[11px] bg-black/60 text-white rounded-full px-2 py-0.5">
                  {Math.round(duration)}s
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border-strong py-10 flex flex-col items-center gap-2 text-text-muted hover:border-accent hover:text-accent transition-colors duration-150"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="text-sm">Încarcă un video (30-90s)</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-text-muted">
            Fără video? Poți publica doar cu descriere — se afișează ca postare text în feed.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descriere</Label>
          <Textarea
            id="description"
            rows={3}
            maxLength={280}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce faci, unde ești blocat, ce cauți — spune pe scurt povestea."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="category">Categorie</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategorySlug)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Oraș</Label>
            <Select id="city" value={city} onChange={(e) => setCity(e.target.value as CitySlug)}>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {category === "eveniment" && (
          <div className="space-y-1.5">
            <Label htmlFor="eventAt">Data și ora evenimentului</Label>
            <Input
              id="eventAt"
              type="datetime-local"
              required
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy || stage === "validating"}>
          {stage === "uploading"
            ? "Se încarcă video…"
            : stage === "publishing"
              ? "Se publică…"
              : "Publică"}
        </Button>
      </form>
    </div>
  );
}
