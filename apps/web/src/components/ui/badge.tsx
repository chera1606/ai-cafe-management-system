import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "meadow" | "amber" | "amber-alt" | "sage" | "forest" | "cream";
  size?: "sm" | "md";
  className?: string;
  icon?: ReactNode;
}

export function Badge({
  children,
  variant = "meadow",
  size = "md",
  className = "",
  icon,
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
  };

  const variantStyles = {
    meadow: "bg-meadow-tint text-meadow-dark border border-meadow/30 font-bold",
    amber: "bg-amber/15 text-amber-alt border border-amber/30 font-extrabold",
    "amber-alt":
      "bg-amber-alt/15 text-amber-alt border border-amber-alt/30 font-extrabold",
    sage: "bg-cream-alt text-sage border border-border font-medium",
    forest: "bg-forest text-white border border-white/10 font-bold",
    cream: "bg-white text-forest border border-border font-bold shadow-forest",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
