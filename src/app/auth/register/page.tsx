"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n/dictionary";
import { useLang } from "@/lib/i18n/use-lang";
import { passwordIssues, PASSWORD_MIN_LENGTH } from "@/lib/password";
import {
  ACCOUNT_TYPES,
  CITIES,
  DEFAULT_CITY,
  type AccountTypeSlug,
  type CitySlug,
} from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const lang = useLang();
  const [accountType, setAccountType] = useState<AccountTypeSlug>("individual");
  const [fullName, setFullName] = useState("");
  const [buildingWhat, setBuildingWhat] = useState("");
  const [city, setCity] = useState<CitySlug>(DEFAULT_CITY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isCompany = accountType === "companie";
  const missingRequirements = passwordIssues(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (missingRequirements.length > 0) {
      setError(`Parola mai are nevoie de: ${missingRequirements.join(", ")}.`);
      return;
    }
    if (!acceptedTerms) {
      setError("Trebuie să accepți Termenii și Politica de confidențialitate.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("buildingWhat", buildingWhat);
    formData.set("city", city);
    formData.set("accountType", accountType);
    formData.set("email", email);
    formData.set("password", password);
    formData.set("acceptedTerms", String(acceptedTerms));
    const result = await register(formData);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.hasSession) {
      router.push("/feed");
      router.refresh();
    } else {
      router.push("/auth/login?confirmEmail=1");
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">{t(lang, "auth_register_title")}</h1>
      <p className="text-sm text-text-muted mb-6">{t(lang, "auth_register_subtitle")}</p>

      <div className="flex rounded-lg border border-border-strong p-1 mb-5">
        {ACCOUNT_TYPES.map((accType) => (
          <button
            key={accType.slug}
            type="button"
            onClick={() => setAccountType(accType.slug)}
            className={cn(
              "flex-1 h-9 rounded-md text-sm font-medium transition-colors duration-150",
              accountType === accType.slug
                ? "bg-accent text-on-accent"
                : "text-text-muted hover:text-text",
            )}
          >
            {accType.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{isCompany ? "Numele companiei" : "Nume"}</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isCompany ? "Numele companiei tale" : "Numele tău"}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="buildingWhat">
            {isCompany ? "Despre companie" : "Ce construiești?"}
          </Label>
          <Textarea
            id="buildingWhat"
            required
            rows={2}
            maxLength={140}
            value={buildingWhat}
            onChange={(e) => setBuildingWhat(e.target.value)}
            placeholder={
              isCompany
                ? "O propoziție scurtă — ex: organizăm evenimente pentru comunitatea tech din oraș"
                : "O propoziție scurtă — ex: un brand de cafea de specialitate"
            }
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
            placeholder={`minim ${PASSWORD_MIN_LENGTH} caractere`}
          />
          <p className="text-xs text-text-muted">
            Minim {PASSWORD_MIN_LENGTH} caractere, o literă mare și un semn de punctuație /
            caracter special (ex: Cluj2026!).
          </p>
        </div>

        <label className="flex items-start gap-2.5 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong accent-accent"
          />
          <span>
            Sunt de acord cu{" "}
            <Link href="/terms" target="_blank" className="text-accent hover:underline">
              Termenii și Condițiile
            </Link>{" "}
            și{" "}
            <Link href="/privacy" target="_blank" className="text-accent hover:underline">
              Politica de Confidențialitate
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Se creează contul…" : t(lang, "auth_register_button")}
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        {t(lang, "auth_have_account")}{" "}
        <Link href="/auth/login" className="text-accent hover:underline">
          {t(lang, "auth_login_link")}
        </Link>
      </p>
    </div>
  );
}
