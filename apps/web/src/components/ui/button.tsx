import { Loader2 } from "lucide-react";
import Link, { type LinkProps } from "next/link";
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-amber-700 hover:bg-amber-800 text-white focus:ring-amber-600 shadow-sm",
    secondary:
      "bg-stone-100 hover:bg-stone-200 text-stone-900 focus:ring-stone-400 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-100",
    outline:
      "border border-stone-300 hover:bg-stone-100 text-stone-700 focus:ring-stone-400 dark:border-stone-700 dark:hover:bg-stone-800 dark:text-stone-200",
    ghost:
      "hover:bg-stone-100 text-stone-700 focus:ring-stone-400 dark:hover:bg-stone-800 dark:text-stone-200",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-2.5 gap-2.5",
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
