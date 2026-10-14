"use client";

import { Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import type { MouseEvent } from "react";
import { showToast } from "@/components/ui/toast";
import { useCart } from "@/context/cart-context";
import type { MenuItem } from "@/data/types";

interface RelatedItemsProps {
  items: MenuItem[];
  onSelectRelated?: (item: MenuItem) => void;
}

export function RelatedItems({ items, onSelectRelated }: RelatedItemsProps) {
  const { addItem } = useCart();

  if (!items || items.length === 0) return null;

  const handleQuickAdd = (item: MenuItem, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.categoryName,
    });

    showToast(
      "success",
      `Added ${item.name}`,
      `$${item.price.toFixed(2)} added to your order`,
    );
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-base font-bold text-forest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber" />
          Goes well with
        </h4>
        <span className="text-[11px] font-medium text-sage">Chef pairings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((relItem) => (
          <div
            key={relItem.id}
            className="group relative flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-border/80 hover:border-meadow/60 transition-all shadow-xs hover:shadow-sm"
          >
            {/* Clickable Area for Selecting Related Product */}
            <button
              type="button"
              onClick={() => onSelectRelated?.(relItem)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
            >
              {/* Thumbnail */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-cream">
                <Image
                  src={relItem.image}
                  alt={relItem.name}
                  fill
                  sizes="56px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-forest group-hover:text-meadow-dark truncate transition-colors">
                  {relItem.name}
                </h5>
                <span className="text-xs font-black text-forest block mt-1">
                  ${relItem.price.toFixed(2)}
                </span>
              </div>
            </button>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={(e) => handleQuickAdd(relItem, e)}
              aria-label={`Quick add ${relItem.name}`}
              className="shrink-0 px-2 py-1 rounded-lg bg-meadow-tint text-meadow-dark hover:bg-meadow hover:text-white text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
