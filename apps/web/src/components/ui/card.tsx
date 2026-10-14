import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "surface" | "glass" | "forest" | "bordered";
  className?: string;
}

export function Card({
  children,
  variant = "surface",
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    surface: "bg-white border border-border shadow-forest",
    glass: "glass-panel shadow-forest",
    forest:
      "bg-gradient-to-br from-forest to-forest-2 text-white border border-white/10 shadow-forest",
    bordered: "bg-white/80 backdrop-blur-xs border border-border shadow-forest",
  };

  return (
    <div
      className={`rounded-[24px] transition-all duration-300 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-2 space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-serif text-xl font-black text-forest tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-sage leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
