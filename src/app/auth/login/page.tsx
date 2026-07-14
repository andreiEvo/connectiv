"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { t } from "@/lib/i18n/dictionary";
import { useLang } from "@/lib/i18n/language-provider";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const lang = useLang();
  const searchParams = useSearchParams();
  const confirmEmail = searchParams.get("confirmEmail") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    const result = await login(formData);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-1">{t(lang, "auth_login_title")}</h1>
      <p className="text-sm text-text-muted mb-6">{t(lang, "auth_login_subtitle")}</p>

      {confirmEmail && (
        <p className="text-sm text-accent bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 mb-4">
          Contul a fost creat. Dacă ți se cere confirmarea emailului, verifică-ți inbox-ul, apoi
          intră în cont.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? t(lang, "auth_login_loading") : t(lang, "auth_login_button")}
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        {t(lang, "auth_no_account")}{" "}
        <Link href="/auth/register" className="text-accent hover:underline">
          {t(lang, "auth_create_one")}
        </Link>
      </p>
    </div>
  );
}
