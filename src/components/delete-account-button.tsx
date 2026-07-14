"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/profile";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <>
      <Button variant="danger" className="w-full" onClick={() => setOpen(true)}>
        Șterge contul
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setConfirmText("");
          setError(null);
        }}
      >
        <p className="font-display text-lg font-semibold mb-1.5">Ștergi contul definitiv?</p>
        <p className="text-sm text-text-muted mb-4 leading-relaxed">
          Postările, mesajele, story-urile și tot ce ține de contul tău vor fi șterse permanent.
          Nu poate fi anulat.
        </p>
        <p className="text-xs text-text-muted mb-1.5">
          Scrie <strong className="text-text">ȘTERGE</strong> ca să confirmi.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full h-10 rounded-lg bg-surface border border-border-strong px-3 text-sm text-text mb-3 focus:outline-none focus:border-accent"
        />

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
            Renunță
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={confirmText !== "ȘTERGE" || isPending}
            onClick={handleDelete}
          >
            {isPending ? "Se șterge…" : "Șterge definitiv"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
