"use client";

import { useMemo, useState } from "react";
import { Coffee, Flame, Plus, Search, Sparkles, Utensils, X } from "lucide-react";
import Image from "next/image";
import { MENU_ITEMS } from "@/data/menu-items.data";
import type { MenuItem } from "@/data/types";
import { cn } from "@/lib/utils";

interface PosCatalogProps {
  onSelectItem: (item: MenuItem) => void;
}

const CATEGORIES = [
  { id: "ALL", label: "All Items" },
  { id: "coffee", label: "Artisanal Coffee" },
  { id: "heritage", label: "Heritage Buna" },
  { id: "pastry", label: "Pastry & Bakery" },
  { id: "cold-drinks", label: "Cold Drinks" },
  { id: "savory", label: "Hot Kitchen" },
];

export function PosCatalog({ onSelectItem }: PosCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== "ALL") {
        if (selectedCategory === "coffee" && item.categoryId !== "coffee") return false;
        if (selectedCategory === "pastry" && item.categoryId !== "pastry") return false;
        if (selectedCategory === "savory" && item.categoryId !== "savory") return false;
        if (selectedCategory === "heritage" && !item.tags?.some((t) => t.toLowerCase().includes("heritage") || t.toLowerCase().includes("ritual") || item.name.toLowerCase().includes("jebena"))) return false;
        if (selectedCategory === "cold-drinks" && item.categoryId !== "cold-drinks" && !item.name.toLowerCase().includes("cold") && !item.name.toLowerCase().includes("juice")) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTag;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-stone-100 dark:bg-stone-950 overflow-hidden">
      {/* Top Controls: Search Bar & Categories */}
      <div className="p-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 space-y-3 shrink-0">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search items by name, origin, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-forest dark:focus:ring-emerald-500 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer border",
                selectedCategory === cat.id
                  ? "bg-forest dark:bg-emerald-600 text-white border-transparent font-bold shadow-xs"
                  : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Touch Cards Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 space-y-2">
            <Search className="w-8 h-8 opacity-40" />
            <p className="text-sm font-semibold">No menu items match your query</p>
            <p className="text-xs text-stone-500">Try clearing the search or category filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-forest/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-[0.98] text-left cursor-pointer overflow-hidden min-h-[140px]"
              >
                {/* Header: Item Title & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-snug">
                    {item.description}
                  </p>
                </div>

                {/* Footer: Price & Quick Add Button */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                  <span className="font-mono font-black text-sm sm:text-base text-forest dark:text-emerald-400">
                    ${item.price.toFixed(2)}
                  </span>

                  <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:bg-forest dark:group-hover:bg-emerald-600 text-stone-600 dark:text-stone-300 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
