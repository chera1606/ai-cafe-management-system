import type { SVGProps } from "react";

export interface HeroSvgProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * CoffeeBeanSVG
 * Heirloom Ethiopian coffee bean with signature center cleft crease.
 */
export function CoffeeBeanSVG({
  size = 28,
  className = "",
  ...props
}: HeroSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <ellipse
        cx="16"
        cy="16"
        rx="12"
        ry="15"
        transform="rotate(-15 16 16)"
        fill="var(--forest)"
      />
      {/* Cleft crease with roasted highlight */}
      <path
        d="M16 4C19 10 13 22 16 28"
        stroke="var(--cream)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Subtle shine facet */}
      <ellipse
        cx="12"
        cy="12"
        rx="3"
        ry="6"
        transform="rotate(-20 12 12)"
        fill="var(--white)"
        fillOpacity="0.12"
      />
    </svg>
  );
}

/**
 * HighlandLeafSVG
 * Delicate coffee plant leaf with main stem and curved secondary veins.
 */
export function HighlandLeafSVG({
  size = 32,
  className = "",
  ...props
}: HeroSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M30 6C18 6 8 16 8 28C20 28 30 18 30 6Z" fill="var(--meadow)" />
      {/* Central vein */}
      <path
        d="M8 28C14 22 22 14 30 6"
        stroke="var(--white)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      {/* Side branching veins */}
      <path
        d="M14 22C16 19 19 18 21 18"
        stroke="var(--white)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
      <path
        d="M18 17C21 14 24 13 26 13"
        stroke="var(--white)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

/**
 * CinnamonStickSVG
 * Rolled whole spice bark with concentric cut ring details.
 */
export function CinnamonStickSVG({
  size = 34,
  className = "",
  ...props
}: HeroSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Main bark cylinder */}
      <rect
        x="10"
        y="8"
        width="20"
        height="24"
        rx="6"
        transform="rotate(25 20 20)"
        fill="var(--sage)"
      />
      <rect
        x="12"
        y="10"
        width="16"
        height="20"
        rx="4"
        transform="rotate(25 20 20)"
        fill="var(--forest-2)"
      />
      {/* Spiral cut line */}
      <path
        d="M14 16C16 14 22 17 24 21C26 25 24 28 22 29"
        stroke="var(--cream)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

/**
 * MiniCroissantSVG
 * Flaky crescent pastry with layered warm curves.
 */
export function MiniCroissantSVG({
  size = 32,
  className = "",
  ...props
}: HeroSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Central buttery body */}
      <path
        d="M6 22C8 14 14 8 20 8C26 8 30 14 26 22C24 26 18 28 12 26C8 24 5 23 6 22Z"
        fill="var(--amber)"
        fillOpacity="0.85"
      />
      {/* Crust fold lines */}
      <path
        d="M12 12C15 16 18 20 20 25"
        stroke="var(--white)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      <path
        d="M19 10C22 14 24 18 25 23"
        stroke="var(--white)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

/**
 * IceCubeSVG
 * Translucent cold brew ice cube with refraction facets.
 */
export function IceCubeSVG({
  size = 28,
  className = "",
  ...props
}: HeroSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Isometric cube faces */}
      <path
        d="M16 4L27 10L16 16L5 10L16 4Z"
        fill="var(--white)"
        fillOpacity="0.45"
        stroke="var(--sage)"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <path
        d="M5 10L16 16V28L5 22V10Z"
        fill="var(--meadow)"
        fillOpacity="0.15"
        stroke="var(--sage)"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <path
        d="M16 16L27 10V22L16 28V16Z"
        fill="var(--meadow)"
        fillOpacity="0.25"
        stroke="var(--sage)"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* Interior crystal refraction line */}
      <line
        x1="12"
        y1="14"
        x2="20"
        y2="22"
        stroke="var(--white)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </svg>
  );
}

/**
 * HeroSteamWisps
 * 3 Soft SVG rising steam curves near the hero cup.
 */
export function HeroSteamWisps({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none flex items-center justify-center gap-2 ${className}`}
    >
      {/* Wisp 1 */}
      <svg
        aria-hidden="true"
        width="24"
        height="64"
        viewBox="0 0 24 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-steam-1 filter blur-[0.6px] text-meadow/40"
      >
        <path
          d="M12 60C8 48 16 36 10 24C6 14 14 8 12 4"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Wisp 2 (center, taller) */}
      <svg
        aria-hidden="true"
        width="28"
        height="80"
        viewBox="0 0 28 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-steam-2 filter blur-[0.6px] text-white/60"
      >
        <path
          d="M14 76C8 62 20 48 12 32C8 18 18 10 14 4"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Wisp 3 */}
      <svg
        aria-hidden="true"
        width="24"
        height="68"
        viewBox="0 0 24 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-steam-3 filter blur-[0.6px] text-meadow/35"
      >
        <path
          d="M10 64C16 52 8 38 14 26C18 16 10 8 12 4"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * OrganicBlob
 * Smooth SVG organic shape rendered with CSS gradient/tint.
 */
export function OrganicBlobSVG({
  className = "",
  variant = "meadow",
}: {
  className?: string;
  variant?: "meadow" | "amber" | "forest";
}) {
  const fillColors = {
    meadow: "var(--meadow-tint)",
    amber: "rgba(255, 138, 61, 0.08)",
    forest: "rgba(45, 62, 53, 0.08)",
  };

  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M441,340.5Q424,431,340.5,454.5Q257,478,172.5,441Q88,404,80,317.5Q72,231,146,160.5Q220,90,314.5,101Q409,112,433.5,181Q458,250,441,340.5Z"
        fill={fillColors[variant]}
      />
    </svg>
  );
}

/**
 * HeroWaveDivider
 * Clean organic curve bottom divider transitioning into the next cream section.
 */
export function HeroWaveDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-12 sm:h-20 text-cream"
      >
        <path
          d="M0 48C360 88 720 16 1080 56C1260 76 1380 64 1440 52V96H0V48Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
