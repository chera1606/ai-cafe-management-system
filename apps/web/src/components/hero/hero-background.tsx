"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { type RefObject, useEffect, useRef, useState } from "react";
import {
  CinnamonStickSVG,
  CoffeeBeanSVG,
  HeroSteamWisps,
  HeroWaveDivider,
  HighlandLeafSVG,
  IceCubeSVG,
  MiniCroissantSVG,
  OrganicBlobSVG,
} from "./hero-elements";
import { useParallax } from "./use-parallax";

export interface HeroScene {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
}

export const HERO_SCENES: HeroScene[] = [
  {
    id: "scene-buna",
    title: "Ceremonial Buna Roastery",
    subtitle:
      "Pan-roasted Sidama beans in traditional claypot Jebena with frankincense",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=75",
    tag: "Live Roastery",
  },
  {
    id: "scene-pour-over",
    title: "Artisan Yirgacheffe Brew Bar",
    subtitle:
      "Single-origin pour-overs with bergamot florals & sweet stone fruit notes",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=75",
    tag: "Brew Bar",
  },
  {
    id: "scene-lounge",
    title: "Highland Sunlit Lounge",
    subtitle:
      "Warm timber ambiance, gentle greenery, and serene roastery seating",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=75",
    tag: "Cafe Ambiance",
  },
  {
    id: "scene-bakes",
    title: "Cardamom Bakes & Fresh Roasts",
    subtitle:
      "Freshly baked cardamom pastries paired with golden espresso extraction",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=75",
    tag: "Fresh Bakery",
  },
];

export interface HeroBackgroundProps {
  /**
   * Animation intensity level.
   * "subtle": lower opacity blobs and fewer elements for minimalist view.
   * "normal": full warm, organic, soft-3D cafe atmosphere.
   */
  intensity?: "subtle" | "normal";
  /**
   * Slide change duration in seconds (default 6.5s)
   */
  slideInterval?: number;
  className?: string;
}

export function HeroBackground({
  intensity = "normal",
  slideInterval = 6.5,
  className = "",
}: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Parallax hook tracking cursor displacement across depth layers
  const { farX, farY, midX, midY, nearX, nearY, isParallaxActive } =
    useParallax(containerRef as RefObject<HTMLElement | null>);

  // Detect mobile viewport (< 768px) to reduce elements
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Monitor element intersection to pause animations when off-screen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined")
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.05 },
    );

    const el = containerRef.current;
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  // Monitor tab visibility
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Efficient slide interval that ONLY triggers once per slide change (0 re-renders between changes)
  useEffect(() => {
    if (!isVisible || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSceneIndex((idx) => (idx + 1) % HERO_SCENES.length);
    }, slideInterval * 1000);

    return () => clearInterval(timer);
  }, [isVisible, isPaused, slideInterval]);

  const goToScene = (index: number) => {
    setCurrentSceneIndex(index);
  };

  const nextScene = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
  };

  const prevScene = () => {
    setCurrentSceneIndex(
      (prev) => (prev - 1 + HERO_SCENES.length) % HERO_SCENES.length,
    );
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const shouldAnimate = !shouldReduceMotion && isVisible;
  const isSubtle = intensity === "subtle";
  const activeScene = HERO_SCENES[currentSceneIndex] ?? HERO_SCENES[0];

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 z-0 pointer-events-none select-none overflow-hidden ${className}`}
    >
      {/* ========================================================
          LAYER 0: Animated Full-Bleed Background Images (Cross-fading)
         ======================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {activeScene && (
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Ken Burns slow pan & zoom animatic motion */}
              <motion.div
                animate={
                  shouldAnimate
                    ? {
                        scale: [1, 1.08],
                        x: [0, -10],
                        y: [0, -6],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: slideInterval + 0.6,
                  ease: "linear",
                }}
                className="relative w-full h-full"
              >
                <Image
                  src={activeScene.image}
                  alt={activeScene.title}
                  fill
                  priority
                  unoptimized
                  sizes="100vw"
                  className="object-cover object-center filter saturate-[1.15] contrast-[1.08]"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic Roastery Scrim Overlay:
            Rich dark-roast & forest gradient that allows the vibrant cafe photography
            to shine through with full richness while ensuring AAA contrast for typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/65 to-forest/30 sm:via-forest/50 sm:to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-forest/50" />

        {/* Ambient Warm Golden & Meadow Glows in corners */}
        <div
          className="absolute -top-24 right-0 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full filter blur-[120px] pointer-events-none opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--meadow-tint) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 left-0 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full filter blur-[110px] pointer-events-none opacity-25"
          style={{
            background:
              "radial-gradient(circle, var(--amber) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ========================================================
          LAYER 1: Subtle Organic Blobs (Atmospheric Ambient Light)
         ======================================================== */}
      {/* Blob A: Top-Right Meadow soft bloom */}
      <motion.div
        animate={
          shouldAnimate
            ? {
                x: [0, 20, -15, 0],
                y: [0, -25, 12, 0],
                scale: [1, 1.05, 0.96, 1],
              }
            : {}
        }
        transition={{
          duration: 24,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className={`absolute -top-32 right-1/12 w-[500px] h-[500px] filter blur-3xl pointer-events-none ${
          isSubtle ? "opacity-15" : "opacity-25"
        }`}
      >
        <OrganicBlobSVG variant="meadow" className="w-full h-full" />
      </motion.div>

      {/* Blob B: Center-Left Forest/Meadow drifting bloom */}
      <motion.div
        animate={
          shouldAnimate
            ? {
                x: [0, -18, 16, 0],
                y: [0, 20, -18, 0],
                scale: [1, 0.96, 1.04, 1],
              }
            : {}
        }
        transition={{
          duration: 28,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        className={`absolute top-1/3 -left-28 w-[540px] h-[540px] filter blur-3xl pointer-events-none ${
          isSubtle ? "opacity-15" : "opacity-20"
        }`}
      >
        <OrganicBlobSVG variant="meadow" className="w-full h-full" />
      </motion.div>

      {/* Blob C: Bottom-Right Amber/Sage soft bloom */}
      <motion.div
        animate={
          shouldAnimate
            ? {
                x: [0, 15, -12, 0],
                y: [0, -15, 18, 0],
                scale: [1, 1.04, 0.98, 1],
              }
            : {}
        }
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 4,
        }}
        className={`absolute bottom-10 right-1/4 w-[460px] h-[460px] filter blur-3xl pointer-events-none ${
          isSubtle ? "opacity-10" : "opacity-20"
        }`}
      >
        <OrganicBlobSVG variant="amber" className="w-full h-full" />
      </motion.div>

      {/* ========================================================
          LAYER 2: Floating Elements (Far Depth Layer - Blurred, Small)
         ======================================================== */}
      <motion.div
        style={{
          x: isParallaxActive ? farX : 0,
          y: isParallaxActive ? farY : 0,
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Far Element 1: Small blurred coffee bean (Top Left) */}
        <motion.div
          animate={
            shouldAnimate
              ? {
                  y: [0, -10, 0],
                  rotate: [0, 8, 0],
                }
              : {}
          }
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-28 left-[14%] filter blur-[1.8px] opacity-45"
        >
          <CoffeeBeanSVG size={18} />
        </motion.div>

        {/* Far Element 2: Small blurred highland leaf (Top Center) */}
        <motion.div
          animate={
            shouldAnimate
              ? {
                  y: [0, -12, 0],
                  rotate: [-5, 10, -5],
                }
              : {}
          }
          transition={{
            duration: 11,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute top-36 left-[48%] filter blur-[1.5px] opacity-50"
        >
          <HighlandLeafSVG size={22} />
        </motion.div>

        {/* Far Element 3: Small blurred ice cube (Bottom Left) */}
        {!isMobile && (
          <motion.div
            animate={
              shouldAnimate
                ? {
                    y: [0, -8, 0],
                    rotate: [5, -6, 5],
                  }
                : {}
            }
            transition={{
              duration: 8.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute bottom-40 left-[8%] filter blur-[2px] opacity-40"
          >
            <IceCubeSVG size={20} />
          </motion.div>
        )}
      </motion.div>

      {/* ========================================================
          LAYER 3: Floating Elements (Mid Depth Layer - Semi-Sharp)
         ======================================================== */}
      <motion.div
        style={{
          x: isParallaxActive ? midX : 0,
          y: isParallaxActive ? midY : 0,
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Mid Element 1: Highland Leaf (Top Right) */}
        <motion.div
          animate={
            shouldAnimate
              ? {
                  y: [0, -14, 0],
                  rotate: [8, -12, 8],
                }
              : {}
          }
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.8,
          }}
          className="absolute top-24 right-[16%] opacity-65 drop-shadow-sm"
        >
          <HighlandLeafSVG size={32} />
        </motion.div>

        {/* Mid Element 2: Cinnamon Stick (Left Midfield) */}
        {!isMobile && (
          <motion.div
            animate={
              shouldAnimate
                ? {
                    y: [0, -16, 0],
                    rotate: [-15, -6, -15],
                  }
                : {}
            }
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 2.2,
            }}
            className="absolute top-64 left-[6%] opacity-70 drop-shadow-md"
          >
            <CinnamonStickSVG size={40} />
          </motion.div>
        )}

        {/* Mid Element 3: Translucent Ice Cube (Right Center) */}
        {!isMobile && (
          <motion.div
            animate={
              shouldAnimate
                ? {
                    y: [0, -12, 0],
                    rotate: [-8, 6, -8],
                  }
                : {}
            }
            transition={{
              duration: 9.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 3.5,
            }}
            className="absolute top-80 right-[28%] opacity-65 drop-shadow-sm"
          >
            <IceCubeSVG size={26} />
          </motion.div>
        )}
      </motion.div>

      {/* ========================================================
          LAYER 4: Floating Elements (Near Depth Layer - Sharp, Large)
         ======================================================== */}
      <motion.div
        style={{
          x: isParallaxActive ? nearX : 0,
          y: isParallaxActive ? nearY : 0,
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Near Element 1: Golden Mini Croissant (Near Hero Cup Stage) */}
        <motion.div
          animate={
            shouldAnimate
              ? {
                  y: [0, -18, 0],
                  rotate: [6, -8, 6],
                }
              : {}
          }
          transition={{
            duration: 7.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-36 right-[22%] sm:right-[32%] opacity-85 drop-shadow-md"
        >
          <MiniCroissantSVG size={36} />
        </motion.div>

        {/* Near Element 2: Coffee Bean (Lower Right Hero Edge) */}
        <motion.div
          animate={
            shouldAnimate
              ? {
                  y: [0, -15, 0],
                  rotate: [-20, 10, -20],
                }
              : {}
          }
          transition={{
            duration: 6.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.8,
          }}
          className="absolute bottom-36 right-[8%] opacity-80 drop-shadow-md"
        >
          <CoffeeBeanSVG size={32} />
        </motion.div>
      </motion.div>

      {/* ========================================================
          LAYER 5: Steam Wisps (Soft curves rising near hero brew bar)
         ======================================================== */}
      <div className="absolute top-[28%] right-[24%] sm:right-[34%] z-10 pointer-events-none opacity-60">
        <HeroSteamWisps />
      </div>

      {/* ========================================================
          LAYER 6: Interactive Scene Switcher with Animatic Progress Bar
         ======================================================== */}
      <div className="absolute bottom-10 right-6 sm:right-10 z-30 pointer-events-auto flex flex-col items-end gap-2.5">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl text-white">
          {/* Previous Scene Button */}
          <button
            type="button"
            onClick={prevScene}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200 hover:text-white"
            aria-label="Previous scene"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Active Scene Tag and Number */}
          <div className="flex flex-col px-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-meadow animate-pulse" />
              <span className="text-[11px] uppercase font-black tracking-wider text-meadow">
                {activeScene?.tag}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                0{currentSceneIndex + 1}/0{HERO_SCENES.length}
              </span>
            </div>
            <span className="text-xs font-semibold text-stone-200 hidden sm:inline max-w-[160px] truncate">
              {activeScene?.title}
            </span>
          </div>

          {/* Next Scene Button */}
          <button
            type="button"
            onClick={nextScene}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200 hover:text-white"
            aria-label="Next scene"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePause}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-stone-200 hover:text-white"
            aria-label={isPaused ? "Resume auto change" : "Pause auto change"}
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? (
              <svg
                className="w-3 h-3 text-meadow"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-stone-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
        </div>

        {/* Live Progress Bar with 0-render GPU scaleX transition */}
        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-white/10">
          <motion.div
            key={`${currentSceneIndex}-${isPaused}`}
            className="h-full bg-gradient-to-r from-meadow to-amber origin-left"
            initial={{ scaleX: 0 }}
            animate={isPaused ? { scaleX: 0 } : { scaleX: 1 }}
            transition={{
              duration: isPaused ? 0 : slideInterval,
              ease: "linear",
            }}
          />
        </div>

        {/* Scene Indicator Dots */}
        <div className="flex items-center gap-1.5 pr-1">
          {HERO_SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => goToScene(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSceneIndex === idx
                  ? "w-6 bg-meadow"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Jump to scene ${scene.title}`}
            />
          ))}
        </div>
      </div>

      {/* ========================================================
          LAYER 8: Bottom Edge Wave Divider transitioning into cream
         ======================================================== */}
      <HeroWaveDivider />
    </div>
  );
}
