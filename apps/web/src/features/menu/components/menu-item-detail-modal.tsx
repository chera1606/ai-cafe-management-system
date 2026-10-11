"use client";

import { CheckCircle2, Coffee, Sparkles, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menuApi } from "../api/menu-api";
import type { MenuItem } from "../types";

interface MenuItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function MenuItemDetailModal({
  item,
  onClose,
}: MenuItemDetailModalProps) {
  const [detailedItem, setDetailedItem] = useState<MenuItem | null>(item);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!item) {
      setDetailedItem(null);
      return;
    }

    setDetailedItem(item);

    // Fetch full details including recipe
    let isMounted = true;
    setIsLoading(true);
    menuApi
      .getMenuItem(item.id)
      .then((data) => {
        if (isMounted) setDetailedItem(data);
      })
      .catch(() => {
        // Fallback to basic item
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  const currentItem = detailedItem || item;
  const isAvailable = currentItem.availabilityStatus === "AVAILABLE";
  const formattedPrice = Number(currentItem.price).toFixed(2);
  const recipe = currentItem.recipe;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {currentItem.categoryName && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40">
                  {currentItem.categoryName}
                </span>
              )}
              {currentItem.departmentName && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  {currentItem.departmentName}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {currentItem.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Price & Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60">
            <div>
              <p className="text-xs text-stone-500 font-medium">Price</p>
              <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-400">
                ${formattedPrice}
              </p>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
                isAvailable
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60",
              )}
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Available to Order</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Currently Sold Out</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Description
            </h4>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {currentItem.description ||
                "Handcrafted fresh to order by our artisan cafe staff using premium ingredients."}
            </p>
          </div>

          {/* Recipe / Ingredients */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-700" />
                Ingredients & Bill of Materials
              </h4>
              {recipe && (
                <span className="text-[11px] text-stone-400 font-medium">
                  Recipe v{recipe.version}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2 py-2">
                <div className="h-9 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
                <div className="h-9 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
              </div>
            ) : recipe?.ingredients && recipe.ingredients.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-800 overflow-hidden">
                {recipe.ingredients.map((ing) => (
                  <div
                    key={ing.ingredientId}
                    className="flex items-center justify-between px-4 py-2.5 text-xs bg-white dark:bg-stone-900"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {ing.ingredientName || "Ingredient"}
                    </span>
                    <span className="text-stone-500 font-mono">
                      {Number(ing.quantity)} {ing.unitOfMeasure}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-700 text-xs text-stone-500 text-center">
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-600 opacity-60" />
                Proprietary cafe blend with secret recipe specs.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
