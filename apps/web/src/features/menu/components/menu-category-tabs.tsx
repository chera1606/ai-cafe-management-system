import { cn } from "@/lib/utils";
import type { Category } from "../types";

interface MenuCategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function MenuCategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: MenuCategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
          selectedCategoryId === null
            ? "bg-amber-700 text-white shadow-sm shadow-amber-700/20"
            : "bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300",
        )}
      >
        All Offerings
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
              isSelected
                ? "bg-amber-700 text-white shadow-sm shadow-amber-700/20"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300",
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
