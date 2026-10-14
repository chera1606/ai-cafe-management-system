"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ProductModal } from "@/components/product/product-modal";
import { AiAssistantButton } from "@/components/ui/ai-assistant-button";
import { useCart } from "@/context/cart-context";
import { CATEGORIES, MENU_ITEMS } from "@/data/mock-cafe";
import type { MenuCategory, MenuItem } from "@/data/types";
import {
  MenuCartPill,
  MenuFilterBar,
  MenuHeader,
  MenuProductGrid,
  useMenuFilters,
} from "@/features/menu";

export default function MenuPage() {
  const { totalItems, total, setIsCartOpen } = useCart();
  const [categories] = useState<MenuCategory[]>(CATEGORIES);
  const [menuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [isLoading] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  const {
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
    resetFilters,
  } = useMenuFilters(menuItems);

  // Synchronize modal state with browser back/forward history
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/menu\/([^/]+)$/);
      if (match?.[1]) {
        const found = MENU_ITEMS.find(
          (i) => i.slug === match[1] || i.id === match[1],
        );
        setActiveModalItem(found || null);
      } else {
        setActiveModalItem(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest">
      <Navbar />

      <main id="main-content" className="flex-1 pt-28 sm:pt-36 pb-20">
        <MenuHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
        />

        <MenuFilterBar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          selectedDietary={selectedDietary}
          onSelectDietary={setSelectedDietary}
          onlyAvailable={onlyAvailable}
          onToggleAvailable={() => setOnlyAvailable(!onlyAvailable)}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <MenuProductGrid
          items={filteredItems}
          isLoading={isLoading}
          onOpenDetail={(item) => setActiveModalItem(item)}
          onResetFilters={resetFilters}
        />
      </main>

      {/* Floating Mobile Cart Pill */}
      <MenuCartPill
        totalItems={totalItems}
        total={total}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <Footer />

      {/* Interactive Detail & Customization Modal */}
      {activeModalItem && (
        <ProductModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}

      {/* Floating AI Ordering Assistant CTA */}
      <AiAssistantButton />
    </div>
  );
}
