import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 rounded-lg bg-surface border border-border-strong px-3.5 text-sm text-text placeholder:text-text-muted",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 focus:border-accent",
        "transition-colors duration-150",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg bg-surface border border-border-strong px-3.5 py-3 text-sm text-text placeholder:text-text-muted resize-none",
      "focus:outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 focus:border-accent",
      "transition-colors duration-150",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-medium text-text-muted uppercase tracking-wide", className)}
      {...props}
    />
  );
}
