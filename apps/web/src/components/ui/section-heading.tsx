import type { ReactNode } from "react";
import { Badge } from "./badge";

export interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  highlightWord,
  subtitle,
  align = "center",
  theme = "light",
  className = "",
}: SectionHeadingProps) {
  const alignStyles = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  const isDark = theme === "dark";

  // Split title to apply hand-drawn SVG underline to highlightWord if present
  const renderTitle = () => {
    if (!highlightWord || !title.includes(highlightWord)) {
      return title;
    }

    const parts = title.split(highlightWord);
    return (
      <>
        {parts[0]}
        <span className="relative inline-block whitespace-nowrap text-meadow">
          {highlightWord}
          <svg
            className="absolute -bottom-2.5 left-0 w-full h-3 text-meadow overflow-visible pointer-events-none"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 13C25 4 65 6 97 14C75 17 35 15 12 18"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className={`flex flex-col max-w-2xl ${alignStyles[align]} ${className}`}
    >
      {eyebrow && (
        <div className="mb-3">
          <Badge variant={isDark ? "meadow" : "cream"} icon={eyebrowIcon}>
            {eyebrow}
          </Badge>
        </div>
      )}

      <h2
        className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.18] ${
          isDark ? "text-white" : "text-forest"
        }`}
      >
        {renderTitle()}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            isDark ? "text-stone-300" : "text-sage"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
