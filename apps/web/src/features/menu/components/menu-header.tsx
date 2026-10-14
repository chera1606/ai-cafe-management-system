"use client";

import { Search, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function MenuHeader({
  searchQuery,
  onSearchChange,
  onClearSearch,
}: MenuHeaderProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
      <div className="bg-white rounded-[32px] p-6 sm:p-12 border border-border shadow-forest flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center lg:text-left max-w-xl">
          <Badge
            variant="meadow"
            icon={<Sparkles className="w-3.5 h-3.5 text-amber" />}
          >
            Live Kitchen Offerings
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-forest tracking-tight">
            Crafted for Every Craving
          </h1>
          <p className="text-sm sm:text-base text-sage leading-relaxed">
            Explore hand-poured single origins, sizzling skillets, and fresh
            bakes. Real-time kitchen inventory guarantees every available item
            is ready to extract.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items, ingredients, spices..."
              className="w-full rounded-2xl bg-cream border border-border pl-12 pr-10 py-3.5 text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-4 focus:ring-meadow-tint shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sage hover:text-forest cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
