"use client";

import { Coffee, Filter, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { menuApi } from "../api/menu-api";
import type { Category, MenuItem } from "../types";
import { MenuCategoryTabs } from "./menu-category-tabs";
import { MenuItemCard } from "./menu-item-card";
import { MenuItemDetailModal } from "./menu-item-detail-modal";

export function CustomerMenuView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItemForModal, setSelectedItemForModal] =
    useState<MenuItem | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cats, allItems] = await Promise.all([
        menuApi.getCategories({ status: "active" }),
        menuApi.getMenuItems(),
      ]);
      setCategories(cats);
      setItems(allItems);
    } catch {
      // Fallback empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategoryId && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // Availability filter
      if (availableOnly && item.availabilityStatus !== "AVAILABLE") {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc =
          item.description?.toLowerCase().includes(query) ?? false;
        const matchesCategory =
          item.categoryName?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategoryId, availableOnly, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white shadow-xl shadow-amber-950/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Artisan Roast & Kitchen</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our Handcrafted Cafe Menu
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            From single-origin pour-overs and velvety flat whites to fresh
            morning viennoiseries, explore our curated daily offerings.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search espresso, cold brew, pastries..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 transition-shadow"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                availableOnly
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Available Now</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <MenuCategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((skId) => (
            <div
              key={skId}
              className="h-48 rounded-2xl bg-stone-100 dark:bg-stone-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onViewDetails={(selected) => setSelectedItemForModal(selected)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
          <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              No menu items match your search
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your category selection, keywords, or availability
              filters.
            </p>
          </div>
          {(selectedCategoryId || searchQuery || availableOnly) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchQuery("");
                setAvailableOnly(false);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* Details & Recipe Modal */}
      <MenuItemDetailModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
}
