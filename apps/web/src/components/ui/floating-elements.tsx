"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SteamWisps({ className = "" }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none flex items-center justify-center gap-1.5 ${className}`}
    >
      <div className="w-1.5 h-10 bg-gradient-to-t from-white/40 to-transparent rounded-full filter blur-[1px] animate-steam-1" />
      <div className="w-2 h-14 bg-gradient-to-t from-white/50 to-transparent rounded-full filter blur-[1px] animate-steam-2" />
      <div className="w-1.5 h-12 bg-gradient-to-t from-white/40 to-transparent rounded-full filter blur-[1px] animate-steam-3" />
    </div>
  );
}

export function FloatingBean({
  className = "",
  size = 28,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      animate={
        shouldReduceMotion
          ? {}
          : {
              y: [0, -12, 0],
              rotate: [0, 8, -6, 0],
            }
      }
      transition={{
        duration: 5.5,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
      className={`absolute pointer-events-none text-forest/25 drop-shadow-md ${className}`}
    >
      <ellipse cx="12" cy="12" rx="9" ry="11" fill="currentColor" />
      <path
        d="M12 4C14 8 10 16 12 20"
        stroke="var(--cream)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function FloatingLeaf({
  className = "",
  size = 32,
  delay = 0.5,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      animate={
        shouldReduceMotion
          ? {}
          : {
              y: [0, -15, 0],
              rotate: [0, -12, 10, 0],
            }
      }
      transition={{
        duration: 6.2,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
      className={`absolute pointer-events-none text-meadow/35 drop-shadow-md ${className}`}
    >
      <path
        d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"
        fill="currentColor"
      />
      <path
        d="M16 8L2 22"
        stroke="var(--white)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function FloatingCroissant({
  className = "",
  size = 36,
  delay = 1.2,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      animate={
        shouldReduceMotion
          ? {}
          : {
              y: [0, -14, 0],
              rotate: [0, 6, -8, 0],
            }
      }
      transition={{
        duration: 7,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
      className={`absolute pointer-events-none text-amber/40 drop-shadow-md ${className}`}
    >
      <path
        d="M6 18C7.5 12 11 8 16 8C21 8 24.5 12 26 18C23.5 18.5 21 17 19.5 14C17.5 16.5 14.5 16.5 12.5 14C11 17 8.5 18.5 6 18Z"
        fill="currentColor"
      />
      <path
        d="M8 20C10 22 13 23 16 23C19 23 22 22 24 20"
        stroke="var(--forest)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.25"
      />
    </motion.svg>
  );
}

export function BackgroundBlobs() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
    >
      <div className="absolute top-1/4 -left-36 w-96 h-96 blob-meadow rounded-full filter blur-3xl opacity-70" />
      <div className="absolute top-1/2 -right-36 w-[420px] h-[420px] blob-amber rounded-full filter blur-3xl opacity-50" />
      <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] blob-meadow rounded-full filter blur-3xl opacity-40" />
    </div>
  );
}
