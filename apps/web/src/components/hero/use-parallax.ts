"use client";

import {
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type RefObject, useEffect, useState } from "react";

export interface ParallaxLayers {
  farX: MotionValue<number>;
  farY: MotionValue<number>;
  midX: MotionValue<number>;
  midY: MotionValue<number>;
  nearX: MotionValue<number>;
  nearY: MotionValue<number>;
  isParallaxActive: boolean;
}

/**
 * useParallax
 * Smooth mouse parallax hook with spring physics.
 * Automatically disables on touch devices, prefers-reduced-motion,
 * when the tab is hidden, or when the hero element is off-screen.
 */
export function useParallax(
  containerRef?: RefObject<HTMLElement | null>,
): ParallaxLayers {
  const shouldReduceMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Raw normalized mouse coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring configuration for gentle, organic motion
  const springConfig = { damping: 28, stiffness: 180, mass: 0.15 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Check for touch / pointer capabilities
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  // Monitor document visibility (tab switching)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Monitor element viewport intersection (off-screen pausing)
  useEffect(() => {
    if (!containerRef?.current || typeof IntersectionObserver === "undefined")
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.05 },
    );

    const target = containerRef.current;
    observer.observe(target);
    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [containerRef]);

  // Handle cursor movement
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isTouchDevice ||
      shouldReduceMotion ||
      !isVisible
    ) {
      mouseX.set(0);
      mouseY.set(0);
      return;
    }

    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const xPct = e.clientX / innerWidth - 0.5;
        const yPct = e.clientY / innerHeight - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
        rafId = null;
      });
    };

    const handleMouseLeave = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isTouchDevice, shouldReduceMotion, isVisible, mouseX, mouseY]);

  const isParallaxActive = !isTouchDevice && !shouldReduceMotion && isVisible;

  // Staggered depth layer displacements (Far: ±6px, Mid: ±12px, Near: ±20px)
  const farX = useTransform(
    smoothX,
    [-0.5, 0.5],
    isParallaxActive ? [-6, 6] : [0, 0],
  );
  const farY = useTransform(
    smoothY,
    [-0.5, 0.5],
    isParallaxActive ? [-6, 6] : [0, 0],
  );

  const midX = useTransform(
    smoothX,
    [-0.5, 0.5],
    isParallaxActive ? [-12, 12] : [0, 0],
  );
  const midY = useTransform(
    smoothY,
    [-0.5, 0.5],
    isParallaxActive ? [-12, 12] : [0, 0],
  );

  const nearX = useTransform(
    smoothX,
    [-0.5, 0.5],
    isParallaxActive ? [-20, 20] : [0, 0],
  );
  const nearY = useTransform(
    smoothY,
    [-0.5, 0.5],
    isParallaxActive ? [-20, 20] : [0, 0],
  );

  return {
    farX,
    farY,
    midX,
    midY,
    nearX,
    nearY,
    isParallaxActive,
  };
}
