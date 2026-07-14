import { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

/** Wraps an avatar with the "struck by lightning" ring shown when the person has an active story. */
export function StoryRing({
  active,
  children,
  className,
  badgeSize = 16,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
  badgeSize?: number;
}) {
  if (!active) return <>{children}</>;

  return (
    <div className={cn("relative inline-flex", className)}>
      <div className="story-ring">{children}</div>
      <span
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-accent text-on-accent ring-2 ring-bg"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <Logo size={badgeSize * 0.6} />
      </span>
    </div>
  );
}
