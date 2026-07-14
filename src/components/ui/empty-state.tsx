import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 py-16 gap-3",
        className,
      )}
    >
      {icon && <div className="text-accent mb-1">{icon}</div>}
      <p className="font-display text-lg font-semibold text-text">{title}</p>
      {description && (
        <p className="text-sm text-text-muted max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
