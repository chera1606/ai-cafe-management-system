"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem } from "@/data/types";

export type DietaryFilter =
  | "all"
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "organic";

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export interface UseMenuFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategoryId: string;
  setActiveCategoryId: (catId: string) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (val: boolean) => void;
  selectedDietary: DietaryFilter;
  setSelectedDietary: (diet: DietaryFilter) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filteredItems: MenuItem[];
  totalResults: number;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

export function useMenuFilters(menuItems: MenuItem[]): UseMenuFiltersReturn {
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<DietaryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Debounce search query to prevent typing lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const resetFilters = () => {
    setActiveCategoryId("all");
    setSearchQuery("");
    setDebouncedSearch("");
    setOnlyAvailable(false);
    setSelectedDietary("all");
    setSortBy("featured");
  };

  const hasActiveFilters =
    activeCategoryId !== "all" ||
    searchQuery.trim() !== "" ||
    onlyAvailable ||
    selectedDietary !== "all" ||
    sortBy !== "featured";

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        if (
          activeCategoryId !== "all" &&
          item.categoryId !== activeCategoryId
        ) {
          return false;
        }

        // Available only toggle
        if (onlyAvailable && !item.available) {
          return false;
        }

        // Dietary tags filter
        if (selectedDietary !== "all") {
          if (!item.dietary || !item.dietary.includes(selectedDietary)) {
            return false;
          }
        }

        // Debounced search query
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        // Default "featured": popular items first
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [
    menuItems,
    activeCategoryId,
    onlyAvailable,
    selectedDietary,
    debouncedSearch,
    sortBy,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategoryId,
    setActiveCategoryId,
    onlyAvailable,
    setOnlyAvailable,
    selectedDietary,
    setSelectedDietary,
    sortBy,
    setSortBy,
    filteredItems,
    totalResults: filteredItems.length,
    hasActiveFilters,
    resetFilters,
  };
}
