import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-accent/90 active:bg-accent/80 disabled:bg-accent/40",
  secondary:
    "bg-surface-2 text-text border border-border-strong hover:bg-surface hover:border-text-muted disabled:opacity-40",
  outline:
    "bg-transparent text-text border border-border-strong hover:border-accent hover:text-accent disabled:opacity-40",
  ghost: "bg-transparent text-text hover:bg-surface disabled:opacity-40",
  danger: "bg-transparent text-red-400 border border-red-400/40 hover:bg-red-400/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
