"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface MenuCartPillProps {
  totalItems: number;
  total: number;
  onOpenCart: () => void;
}

export function MenuCartPill({
  totalItems,
  total,
  onOpenCart,
}: MenuCartPillProps) {
  if (totalItems <= 0) return null;

  return (
    <motion.aside
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      aria-label="Floating order tray summary"
      className="fixed bottom-6 left-4 right-4 z-30 sm:hidden"
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="w-full bg-forest text-white py-3.5 px-6 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 active:scale-[0.98] transition-transform cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-meadow" />
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber text-white text-[10px] font-black flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-bold text-sm tracking-wide">
            View Current Tray
          </span>
        </div>
        <span className="font-black text-meadow text-base">
          ${total.toFixed(2)}
        </span>
      </button>
    </motion.aside>
  );
}
