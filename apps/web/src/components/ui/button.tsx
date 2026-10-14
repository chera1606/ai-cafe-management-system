"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "amber"
    | "dark"
    | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-7 py-3.5 gap-2.5",
      icon: "p-2.5 rounded-full aspect-square",
    };

    const variantStyles = {
      primary:
        "bg-meadow hover:bg-meadow-alt active:bg-meadow-dark text-white shadow-forest border border-meadow-alt/30",
      secondary: "bg-cream-alt hover:bg-cream text-forest border border-border",
      outline:
        "border-2 border-meadow text-forest hover:bg-meadow-tint active:bg-meadow-tint/80 bg-transparent",
      ghost:
        "text-forest hover:text-meadow-dark hover:bg-meadow-tint bg-transparent",
      amber:
        "bg-amber hover:bg-amber-alt text-white shadow-sm border border-amber/30",
      dark: "bg-forest hover:bg-forest-2 text-white shadow-forest border border-white/10",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-500/40",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  leftIcon,
  rightIcon,
  onClick,
}: LinkButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all duration-200 cursor-pointer select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5",
    icon: "p-2.5 rounded-full aspect-square",
  };

  const variantStyles = {
    primary:
      "bg-meadow hover:bg-meadow-alt active:bg-meadow-dark text-white shadow-forest border border-meadow-alt/30",
    secondary: "bg-cream-alt hover:bg-cream text-forest border border-border",
    outline:
      "border-2 border-meadow text-forest hover:bg-meadow-tint active:bg-meadow-tint/80 bg-transparent",
    ghost:
      "text-forest hover:text-meadow-dark hover:bg-meadow-tint bg-transparent",
    amber:
      "bg-amber hover:bg-amber-alt text-white shadow-sm border border-amber/30",
    dark: "bg-forest hover:bg-forest-2 text-white shadow-forest border border-white/10",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-500/40",
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Link>
  );
}
