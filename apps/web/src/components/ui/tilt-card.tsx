"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number; // max tilt angle in degrees, default 8
  shine?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  tabIndex?: number;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  shine = true,
  onClick,
  onMouseEnter,
  onFocus,
  tabIndex,
  onKeyDown,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches,
      );
    }
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.1 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const cachedRect = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      cachedRect.current = ref.current.getBoundingClientRect();
    }
    if (onMouseEnter) onMouseEnter();
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    if (!cachedRect.current) {
      cachedRect.current = ref.current.getBoundingClientRect();
    }
    const rect = cachedRect.current;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    cachedRect.current = null;
    x.set(0);
    y.set(0);
  };

  if (isTouch) {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: touch fallback container
      <div
        ref={ref}
        role={onClick ? "button" : undefined}
        onFocus={onFocus}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className={`relative rounded-[24px] bg-white border border-stone-200/80 shadow-forest active:scale-[0.98] transition-transform duration-100 ${className}`}
      >
        <div className="h-full">{children}</div>
      </div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onFocus={onFocus}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        onClick={onClick}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: shouldReduceMotion ? 1 : 1.015 }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-[24px] bg-white border border-stone-200/80 shadow-forest hover:shadow-[0_22px_44px_-14px_rgba(38,50,40,0.16)] transition-shadow duration-300 ${
          shine ? "shine-hover" : ""
        } ${className}`}
      >
        <div style={{ transform: "translateZ(15px)" }} className="h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
