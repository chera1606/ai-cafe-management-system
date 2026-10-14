"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { createContext, type ReactNode, useContext, useState } from "react";

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface FlyToCartContextType {
  triggerFly: (image: string, startElement: HTMLElement) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(
  undefined,
);

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const triggerFly = (image: string, startElement: HTMLElement) => {
    // Check prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const startRect = startElement.getBoundingClientRect();
    const cartButton =
      document.querySelector('[data-cart-button="true"]') ||
      document.querySelector('button[aria-label*="cart" i]') ||
      document.querySelector('button[aria-label*="bag" i]');

    let targetX = window.innerWidth - 60;
    let targetY = 32;

    if (cartButton) {
      const targetRect = cartButton.getBoundingClientRect();
      targetX = targetRect.left + targetRect.width / 2;
      targetY = targetRect.top + targetRect.height / 2;
    }

    const flyId = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem: FlyingItem = {
      id: flyId,
      image,
      startX: startRect.left + startRect.width / 2,
      startY: startRect.top + startRect.height / 2,
      targetX,
      targetY,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    // Cleanup after animation finishes
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((it) => it.id !== flyId));
    }, 750);
  };

  return (
    <FlyToCartContext.Provider value={{ triggerFly }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                position: "fixed",
                left: item.startX - 36,
                top: item.startY - 36,
                width: 72,
                height: 72,
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              animate={{
                left: item.targetX - 16,
                top: item.targetY - 16,
                width: 32,
                height: 32,
                opacity: [1, 0.9, 0],
                scale: [1, 1.15, 0.35],
                rotate: [0, -15, 45],
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1], // Custom spring-like bezier
              }}
              className="rounded-full shadow-2xl border-2 border-meadow overflow-hidden bg-white filter drop-shadow-[0_12px_20px_rgba(72,168,83,0.35)]"
            >
              <Image
                src={item.image}
                alt="Flying to cart"
                fill
                sizes="72px"
                className="object-cover"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    // Return graceful no-op if provider is not yet mounted
    return {
      triggerFly: () => {},
    };
  }
  return context;
}
