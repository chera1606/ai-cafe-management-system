"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, ShoppingBag, Sparkles } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

interface StickyAddBarProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  lineTotal: number;
  isAvailable: boolean;
  isInCart?: boolean;
  onAddToCart: (targetElement: HTMLElement) => void;
  onNotifyMe?: () => void;
  onSeeSimilar?: () => void;
}

export function StickyAddBar({
  quantity,
  onQuantityChange,
  lineTotal,
  isAvailable,
  isInCart = false,
  onAddToCart,
  onNotifyMe,
  onSeeSimilar,
}: StickyAddBarProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isAddedBump, setIsAddedBump] = useState(false);

  const handleClick = (_e: MouseEvent<HTMLButtonElement>) => {
    if (!isAvailable) return;
    setIsAddedBump(true);
    setTimeout(() => setIsAddedBump(false), 500);
    if (buttonRef.current) {
      onAddToCart(buttonRef.current);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-border px-4 sm:px-6 py-3 sm:py-4 pb-safe shadow-[0_-8px_24px_rgba(38,50,40,0.06)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto">
        {/* Left: Quantity Stepper or Unavailable Info */}
        {isAvailable ? (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <QuantityStepper
              quantity={quantity}
              onChange={onQuantityChange}
              min={1}
              max={20}
            />
            <div className="sm:hidden text-right">
              <span className="text-[10px] uppercase font-bold text-sage block leading-none">
                Est. Total
              </span>
              <span className="text-lg font-black text-forest">
                ${lineTotal.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Out of stock today
          </div>
        )}

        {/* Right: Primary Action Button or Unavailable Alternatives */}
        <div className="w-full sm:w-auto flex-1 sm:max-w-md flex flex-col items-end gap-1">
          {isAvailable ? (
            <motion.div
              animate={isAddedBump ? { scale: [1, 1.04, 1] } : {}}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                ref={buttonRef}
                type="button"
                onClick={handleClick}
                className="w-full h-12 rounded-2xl bg-meadow hover:bg-meadow-alt text-white font-bold text-sm shadow-md shadow-forest/10 flex items-center justify-between px-6 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isInCart ? "Update Cart" : "Add to Cart"}</span>
                </div>

                {/* Animated Rolling Total Display */}
                <div className="flex items-center gap-1.5 font-black text-base">
                  <span>·</span>
                  <div className="relative overflow-hidden h-6 flex items-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={lineTotal.toFixed(2)}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 24,
                        }}
                      >
                        ${lineTotal.toFixed(2)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNotifyMe}
                leftIcon={<Bell className="w-3.5 h-3.5" />}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Notify Me
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSeeSimilar}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                className="flex-1 rounded-xl text-xs font-bold bg-meadow"
              >
                See Similar
              </Button>
            </div>
          )}

          {/* Legal / SRS BR-001 Authoritative Server Price Note */}
          <p className="text-[11px] text-sage text-center sm:text-right w-full mt-0.5">
            Final total confirmed at checkout (server authoritative)
          </p>
        </div>
      </div>
    </div>
  );
}
