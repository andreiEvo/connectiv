import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

export function Tagline({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-1.5 font-display text-sm text-text-muted", className)}>
      connecting
      <Logo size={14} className="text-accent" />
      evolution
    </p>
  );
}
