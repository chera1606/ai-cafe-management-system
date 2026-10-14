"use client";

import { Coffee } from "lucide-react";
import { ProductCard } from "@/components/menu/product-card";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import type { MenuItem } from "@/data/types";

interface MenuProductGridProps {
  items: MenuItem[];
  isLoading: boolean;
  onOpenDetail: (item: MenuItem) => void;
  onResetFilters: () => void;
}

export function MenuProductGrid({
  items,
  isLoading,
  onOpenDetail,
  onResetFilters,
}: MenuProductGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Result Count Indicator */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs sm:text-sm font-bold text-sage">
          Showing <span className="text-forest font-black">{items.length}</span>{" "}
          culinary selections
        </p>
      </div>

      {/* Skeletons Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholder list
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty Filter State */
        <div className="rounded-[32px] bg-white border border-border p-12 sm:p-20 text-center max-w-xl mx-auto shadow-forest space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-alt flex items-center justify-center text-sage mx-auto">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest">
            No items match your criteria
          </h2>
          <p className="text-sm text-sage max-w-md mx-auto">
            Try adjusting your search keywords, clearing dietary filters, or
            toggling unavailable items back on.
          </p>
          <div className="pt-2">
            <Button onClick={onResetFilters} variant="primary" size="md">
              Reset All Filters
            </Button>
          </div>
        </div>
      ) : (
        /* Responsive Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <ProductCard
              key={item.id}
              item={item}
              priorityImage={index < 4}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
