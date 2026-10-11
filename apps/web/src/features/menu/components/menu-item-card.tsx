import { CheckCircle2, Coffee, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuItem } from "../types";

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onViewDetails }: MenuItemCardProps) {
  const isAvailable = item.availabilityStatus === "AVAILABLE";
  const formattedPrice = Number(item.price).toFixed(2);

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-stone-900",
        isAvailable
          ? "border-stone-200/80 dark:border-stone-800 hover:shadow-lg hover:shadow-amber-900/5 hover:border-amber-200 dark:hover:border-amber-900/40"
          : "border-stone-200 dark:border-stone-800 opacity-75 bg-stone-50/50 dark:bg-stone-900/40",
      )}
    >
      <div className="space-y-3">
        {/* Header tags & availability */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            {item.categoryName && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40">
                {item.categoryName}
              </span>
            )}
            {item.departmentName && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                {item.departmentName}
              </span>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shrink-0",
              isAvailable
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60",
            )}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Available</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                <span>Sold Out</span>
              </>
            )}
          </div>
        </div>

        {/* Item Title & Price */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
            {item.name}
          </h3>
          <span className="font-extrabold text-base text-amber-800 dark:text-amber-400 shrink-0">
            ${formattedPrice}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
          {item.description ||
            "Handcrafted fresh to order using finest quality ingredients."}
        </p>
      </div>

      {/* Footer Details Button */}
      <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <span className="text-[11px] text-stone-400 flex items-center gap-1">
          <Coffee className="w-3 h-3 text-amber-600" />
          Freshly Crafted
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(item)}
          className="text-xs gap-1 h-8 rounded-lg"
        >
          <Info className="w-3 h-3" />
          Ingredients
        </Button>
      </div>
    </div>
  );
}
