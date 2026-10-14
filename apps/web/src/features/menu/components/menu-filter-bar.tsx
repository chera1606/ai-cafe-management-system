"use client";

import { ArrowUpDown } from "lucide-react";
import { CategoryTabs } from "@/components/menu/category-tabs";
import type { MenuCategory } from "@/data/types";
import type { DietaryFilter, SortOption } from "../hooks/use-menu-filters";

interface MenuFilterBarProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  selectedDietary: DietaryFilter;
  onSelectDietary: (dietary: DietaryFilter) => void;
  onlyAvailable: boolean;
  onToggleAvailable: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const DIETARY_OPTIONS: { id: DietaryFilter; label: string }[] = [
  { id: "all", label: "All Diets" },
  { id: "vegan", label: "100% Plant-Based" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "organic", label: "Organic" },
];

export function MenuFilterBar({
  categories,
  activeCategoryId,
  onSelectCategory,
  selectedDietary,
  onSelectDietary,
  onlyAvailable,
  onToggleAvailable,
  sortBy,
  onSortChange,
}: MenuFilterBarProps) {
  return (
    <section className="sticky top-16 sm:top-20 z-30 bg-cream/95 backdrop-blur-md border-y border-border py-3 sm:py-4 mb-6 sm:mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5 sm:space-y-3">
        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={onSelectCategory}
        />

        {/* Sub-Filters: Dietary Chips, Available Only, Price Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 pt-1 text-xs">
          {/* Dietary Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectDietary(opt.id)}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDietary === opt.id
                    ? "bg-forest text-white shadow-xs"
                    : "bg-white text-sage hover:text-forest border border-border/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Quick Toggles: In-Stock Only & Sort Selector */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
            {/* Available Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-forest font-bold">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={onToggleAvailable}
                className="w-4 h-4 rounded text-meadow focus:ring-meadow accent-meadow cursor-pointer"
              />
              <span>In stock only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-1.5 bg-white border border-border rounded-xl px-2.5 py-1.5 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-sage" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs font-bold text-forest focus:outline-none cursor-pointer pr-1"
                aria-label="Sort catalog items"
              >
                <option value="featured">Featured First</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
