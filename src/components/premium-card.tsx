"use client";

import { useState, useTransition } from "react";
import { togglePremiumFlag } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { FREE_MONTHLY_CONVERSATIONS, PREMIUM_MONTHLY_PRICE_EUR } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function PremiumCard({
  initialIsPremium,
  conversationsUsed,
}: {
  initialIsPremium: boolean;
  conversationsUsed: number;
}) {
  const [isPremium, setIsPremium] = useState(initialIsPremium);
  const [, startTransition] = useTransition();

  const remaining = Math.max(FREE_MONTHLY_CONVERSATIONS - conversationsUsed, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-base font-semibold">
          {isPremium ? "Cont Premium" : "Cont gratuit"}
        </h2>
        {isPremium && (
          <span className="text-[10px] uppercase tracking-wide text-on-accent bg-accent rounded-full px-2 py-0.5">
            Activ
          </span>
        )}
      </div>

      {!isPremium ? (
        <>
          <p className="text-sm text-text-muted mb-3">
            Ai folosit{" "}
            <strong className="text-text">
              {Math.min(conversationsUsed, FREE_MONTHLY_CONVERSATIONS)}/{FREE_MONTHLY_CONVERSATIONS}
            </strong>{" "}
            conversații luna asta.
          </p>
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden mb-4">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                remaining === 0 ? "bg-red-400" : "bg-accent",
              )}
              style={{
                width: `${Math.min((conversationsUsed / FREE_MONTHLY_CONVERSATIONS) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-sm text-text-muted mb-4 leading-relaxed">
            Premium îți dă conversații nelimitate și vizibilitate crescută a profilului în feed, la{" "}
            {PREMIUM_MONTHLY_PRICE_EUR}€/lună.
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setIsPremium(true);
              startTransition(async () => {
                await togglePremiumFlag(true);
              });
            }}
          >
            Treci la Premium
          </Button>
          <p className="text-[11px] text-text-muted text-center mt-2">
            Plățile reale nu sunt încă active — acesta e un demo al fluxului.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-text-muted mb-4">
            Conversații nelimitate și vizibilitate crescută în feed sunt active pe contul tău.
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setIsPremium(false);
              startTransition(async () => {
                await togglePremiumFlag(false);
              });
            }}
          >
            Anulează Premium
          </Button>
        </>
      )}
    </div>
  );
}
