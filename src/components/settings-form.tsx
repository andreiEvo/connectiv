"use client";

import { useState, FormEvent } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AvatarUploadField } from "@/components/avatar-upload-field";
import { CoverUploadField } from "@/components/cover-upload-field";
import { CITIES, type CitySlug } from "@/lib/constants";
import type { Profile } from "@/lib/supabase/types";

export function SettingsForm({ profile, email }: { profile: Profile; email: string }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [buildingWhat, setBuildingWhat] = useState(profile.building_what);
  const [city, setCity] = useState<CitySlug>(profile.city);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("buildingWhat", buildingWhat);
    formData.set("city", city);

    const result = await updateProfile(formData);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Fundal de profil</Label>
        <CoverUploadField initialUrl={profile.cover_url} />
      </div>

      <div className="space-y-1.5">
        <Label>Poză de profil</Label>
        <AvatarUploadField fullName={profile.full_name} initialUrl={profile.avatar_url} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nume</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buildingWhat">Ce construiești?</Label>
          <Textarea
            id="buildingWhat"
            rows={2}
            maxLength={140}
            value={buildingWhat}
            onChange={(e) => setBuildingWhat(e.target.value)}
          />
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

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Se salvează…" : saved ? "Salvat ✓" : "Salvează modificările"}
        </Button>
      </form>
    </div>
  );
}
