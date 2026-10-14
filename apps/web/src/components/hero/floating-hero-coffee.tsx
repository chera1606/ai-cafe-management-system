"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Droplets, Sparkles } from "lucide-react";
import Image from "next/image";
import { type MouseEvent, useRef } from "react";
import {
  FloatingBean,
  FloatingLeaf,
  SteamWisps,
} from "@/components/ui/floating-elements";

export function FloatingHeroCoffee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

  const layer1X = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);

  const layer2X = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const layer2Y = useTransform(smoothY, [-0.5, 0.5], [20, -20]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      aria-label="Interactive 3D coffee showcase"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className="relative w-full max-w-lg aspect-square flex items-center justify-center mx-auto"
    >
      {/* Soft organic glowing gradient blob behind */}
      <div
        aria-hidden="true"
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-meadow/25 via-amber/15 to-forest-2/20 filter blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      {/* Main 3D Transform Stage */}
      <motion.div
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Orbiting Element 1: Coffee Beans Cluster (Depth -25px) */}
        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : layer1X,
            y: shouldReduceMotion ? 0 : layer1Y,
            transform: "translateZ(-25px)",
          }}
          className="absolute top-12 left-6 z-10"
        >
          <FloatingBean size={36} delay={0} />
          <FloatingBean size={24} delay={1.2} className="top-8 left-6" />
        </motion.div>

        {/* Orbiting Element 2: Highland Coffee Leaves (Depth 40px) */}
        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : layer2X,
            y: shouldReduceMotion ? 0 : layer2Y,
            transform: "translateZ(40px)",
          }}
          className="absolute bottom-16 left-8 z-30"
        >
          <FloatingLeaf size={42} delay={0.6} />
        </motion.div>

        {/* Orbiting Element 3: Flaky Croissant floating chip (Depth 30px) */}
        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : layer1X,
            y: shouldReduceMotion ? 0 : layer1Y,
            transform: "translateZ(30px)",
          }}
          className="absolute top-16 right-6 z-30 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-forest border border-border flex items-center gap-2.5 animate-soft-float"
        >
          <div className="w-8 h-8 rounded-xl bg-amber/15 text-amber flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-forest leading-none">
              Fresh Bake
            </p>
            <p className="text-[9px] text-sage mt-0.5">Cardamom Twists</p>
          </div>
        </motion.div>

        {/* Orbiting Element 4: Cold Brew badge (Depth 50px) */}
        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : layer2X,
            y: shouldReduceMotion ? 0 : layer2Y,
            transform: "translateZ(50px)",
          }}
          className="absolute bottom-12 right-8 z-30 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-forest border border-border flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-meadow-tint text-meadow-dark flex items-center justify-center font-bold text-xs">
            <Droplets className="w-4 h-4 text-meadow-dark" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-forest leading-none">
              Nitro Tap
            </p>
            <p className="text-[9px] text-meadow-dark font-bold mt-0.5">
              Cold Extracted
            </p>
          </div>
        </motion.div>

        {/* Central Hero: Floating Ceramic / Jebena Coffee Cup */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{ transform: "translateZ(20px)" }}
          className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-white via-cream to-cream-alt p-3 sm:p-4 shadow-forest border border-white/80 flex items-center justify-center overflow-visible group"
        >
          {/* Subtle concentric rings */}
          <div className="absolute inset-3 sm:inset-4 rounded-[26px] sm:rounded-[28px] border border-border/60 pointer-events-none" />

          {/* Steaming Wisps Rising from Cup */}
          <SteamWisps className="-top-8 left-1/2 -translate-x-1/2 z-20" />

          {/* High quality transparent or photographic coffee showcase */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden shadow-forest">
            <Image
              src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=85"
              alt="Ceremonial Claypot Jebena Coffee Cup"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Live Roast telemetry badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-forest text-white text-[11px] sm:text-xs font-bold shadow-forest border border-white/10 flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-meadow animate-ping" />
            <span>Pan-Roasted Live &bull; Sidama Lot 4</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
