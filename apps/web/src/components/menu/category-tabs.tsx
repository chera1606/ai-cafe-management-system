"use client";

import { motion } from "framer-motion";
import type { MenuCategory } from "@/data/types";

export interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
  className = "",
}: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className={`flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth ${className}`}
    >
      {categories.map((category) => {
        const isActive = activeCategoryId === category.id;

        return (
          <button
            type="button"
            key={category.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${category.id}`}
            id={`tab-${category.id}`}
            onClick={() => onSelectCategory(category.id)}
            className={`relative px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-colors duration-200 cursor-pointer select-none ${
              isActive
                ? "text-white"
                : "text-sage hover:text-forest bg-white/70 hover:bg-white border border-stone-200/70"
            }`}
          >
            {/* Sliding animated indicator via layoutId */}
            {isActive && (
              <motion.div
                layoutId="category-tab-active"
                className="absolute inset-0 bg-meadow rounded-full shadow-md shadow-forest"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              <span>{category.name}</span>
              {category.itemCount !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-stone-200/70 text-sage"
                  }`}
                >
                  {category.itemCount}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
