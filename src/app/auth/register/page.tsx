"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CITIES, DEFAULT_CITY, type CitySlug } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [buildingWhat, setBuildingWhat] = useState("");
  const [city, setCity] = useState<CitySlug>(DEFAULT_CITY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          building_what: buildingWhat,
          city,
        },
      },
    });
    setLoading(false);

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Există deja un cont cu acest email."
          : "Nu am putut crea contul. Încearcă din nou.",
      );
      return;
    }

    if (data.session) {
      router.push("/feed");
      router.refresh();
    } else {
      setError(null);
      router.push("/auth/login?confirmEmail=1");
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">Hai să construim</h1>
      <p className="text-sm text-text-muted mb-6">
        Câteva detalii, apoi ești în feed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nume</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Numele tău"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="buildingWhat">Ce construiești?</Label>
          <Textarea
            id="buildingWhat"
            required
            rows={2}
            maxLength={140}
            value={buildingWhat}
            onChange={(e) => setBuildingWhat(e.target.value)}
            placeholder="O propoziție scurtă — ex: un brand de cafea de specialitate"
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

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@exemplu.ro"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Parolă</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="minimum 6 caractere"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Se creează contul…" : "Creează cont"}
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        Ai deja cont?{" "}
        <Link href="/auth/login" className="text-accent hover:underline">
          Intră
        </Link>
      </p>
    </div>
  );
}
