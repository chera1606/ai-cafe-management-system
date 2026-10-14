"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  Flame,
  Heart,
  Info,
  Scale,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Rating } from "@/components/ui/rating";
import { showToast } from "@/components/ui/toast";
import { useCart } from "@/context/cart-context";
import type { MenuItem, SelectedOptionsMap } from "@/data/types";
import {
  calculateLineTotal,
  getDefaultSelections,
  validateOptionSelections,
} from "@/lib/line-total";
import { useFlyToCart } from "./fly-to-cart";
import { OptionGroup } from "./option-group";
import { ProductGallery } from "./product-gallery";
import { RelatedItems } from "./related-items";
import { StickyAddBar } from "./sticky-add-bar";

interface ProductDetailViewProps {
  item: MenuItem;
  relatedItems?: MenuItem[];
  onClose?: () => void;
  isModal?: boolean;
}

export function ProductDetailView({
  item,
  relatedItems = [],
  onClose,
  isModal = false,
}: ProductDetailViewProps) {
  const { items, addItem } = useCart();
  const { triggerFly } = useFlyToCart();

  // Favorite State with Local Persistence
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("cafe_favorites") || "[]");
      setIsFavorite(favs.includes(item.id));
    } catch {
      // Ignore
    }
  }, [item.id]);

  const toggleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      try {
        const favs = JSON.parse(localStorage.getItem("cafe_favorites") || "[]");
        const updated = next
          ? [...new Set([...favs, item.id])]
          : favs.filter((id: string) => id !== item.id);
        localStorage.setItem("cafe_favorites", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Selections state
  const defaultSelections = useMemo(() => getDefaultSelections(item), [item]);
  const [selections, setSelections] =
    useState<SelectedOptionsMap>(defaultSelections);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Existing item in cart matching base item id
  const existingCartItem = useMemo(() => {
    return items.find((i) => (i.menuItemId || i.id) === item.id);
  }, [items, item.id]);

  // Sync initial selection if existing in cart
  useEffect(() => {
    if (existingCartItem?.selectedOptionsMap) {
      setSelections(existingCartItem.selectedOptionsMap);
      if (existingCartItem.specialInstructions) {
        setSpecialInstructions(existingCartItem.specialInstructions);
      }
    }
  }, [existingCartItem]);

  // Live Line Total calculation (Pure function from Section 6)
  const lineTotal = useMemo(() => {
    return calculateLineTotal(item, selections, quantity);
  }, [item, selections, quantity]);

  const handleOptionChange = (groupId: string, newSelectedIds: string[]) => {
    setSelections((prev) => ({
      ...prev,
      [groupId]: newSelectedIds,
    }));
    // Clear validation error for this group if resolved
    setValidationErrors((prev) => prev.filter((id) => id !== groupId));
  };

  const handleAddToCart = (targetButton: HTMLElement) => {
    // Validate required option groups
    const { isValid, missingRequiredGroups } = validateOptionSelections(
      item,
      selections,
    );

    if (!isValid) {
      setValidationErrors(missingRequiredGroups);
      // Scroll to first invalid group
      const firstInvalidEl = document.getElementById(
        `option-group-${missingRequiredGroups[0]}`,
      );
      if (firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast(
        "error",
        "Required choices missing",
        "Please select your preferences above.",
      );
      return;
    }

    // Trigger visual fly particle
    triggerFly(item.image, targetButton);

    // Extract all chosen option item IDs for cart storage
    const allSelectedOptionIds = Object.values(selections).flat();

    // Human readable modifier labels
    const modifierLabels: string[] = [];
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        const chosen = selections[group.id] || [];
        const groupOpts = group.items || group.options || [];
        for (const optId of chosen) {
          const opt = groupOpts.find((it) => it.id === optId);
          if (opt) {
            modifierLabels.push(
              opt.priceDelta > 0
                ? `${opt.name} (+$${opt.priceDelta.toFixed(2)})`
                : opt.name,
            );
          }
        }
      }
    }

    const unitPrice = lineTotal / quantity;

    addItem(
      {
        id: item.id,
        menuItemId: item.id,
        slug: item.slug,
        name: item.name,
        price: unitPrice,
        basePrice: item.price,
        image: item.image,
        category: item.categoryName,
        selectedOptionIds: allSelectedOptionIds,
        selectedOptionsMap: selections,
        selectedModifiers: modifierLabels,
        specialInstructions: specialInstructions.trim() || undefined,
      },
      quantity,
      { openDrawer: false },
    );

    // Undoable Toast
    showToast(
      "success",
      `Added ${quantity}x ${item.name}`,
      `$${lineTotal.toFixed(2)} added to your order`,
    );

    if (onClose) {
      // Allow user to finish animation before closing
      setTimeout(() => {
        onClose();
      }, 350);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white text-forest selection:bg-meadow-tint ${
        isModal ? "h-full min-h-0" : "w-full"
      }`}
    >
      {/* Scrollable Container with Two Column Responsive Grid */}
      <div
        className={
          isModal
            ? "flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-8 py-6 space-y-6"
            : "px-5 sm:px-8 py-6 space-y-6"
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media Stage & Gallery */}
          <div
            className={`md:col-span-5 lg:col-span-5 ${
              isModal ? "sticky md:top-0" : "md:sticky md:top-24"
            }`}
          >
            <ProductGallery item={item} />
          </div>

          {/* Right Column: Details & Customizations */}
          <div className="md:col-span-7 lg:col-span-7 space-y-6">
            {/* 1. Category Chip + Favorite Heart Pop */}
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cream-alt text-sage border border-border">
                {item.categoryName}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.8 }}
                onClick={toggleFavorite}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
                className={`p-2 rounded-full border transition-colors ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-border bg-white text-sage hover:text-red-500"
                }`}
              >
                <motion.div
                  animate={isFavorite ? { scale: [1, 1.35, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                  />
                </motion.div>
              </motion.button>
            </div>

            {/* 2. Name, Rating, and Price */}
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-forest leading-tight">
                {item.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <Rating score={item.rating} size="sm" showNumber />
                <span className="text-xs text-sage">
                  ({item.reviewCount || 120}+ reviews)
                </span>

                <div className="flex items-baseline gap-2 ml-auto">
                  {item.discountPercent ? (
                    <span className="text-sm font-semibold text-sage line-through">
                      $
                      {(item.price * (1 + item.discountPercent / 100)).toFixed(
                        2,
                      )}
                    </span>
                  ) : null}
                  <span className="text-2xl font-black text-forest">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Description with "Read more" toggle */}
            <div className="space-y-1">
              <p
                className={`text-sm text-stone-600 leading-relaxed transition-all ${
                  !isDescExpanded ? "line-clamp-3" : ""
                }`}
              >
                {item.description}
              </p>
              {item.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-bold text-meadow-dark hover:underline focus:outline-none"
                >
                  {isDescExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* 4. Meta Chips: Prep time, calories, serving size, spice */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {item.prepMinutes && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-border text-xs text-stone-700">
                  <Clock className="w-3.5 h-3.5 text-sage" />
                  <span>{item.prepMinutes} min prep</span>
                </div>
              )}

              {(item.calories ?? item.nutrition?.calories) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-border text-xs text-stone-700">
                  <Zap className="w-3.5 h-3.5 text-amber" />
                  <span>{item.calories ?? item.nutrition?.calories} kcal</span>
                </div>
              )}

              {item.servingSize && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-border text-xs text-stone-700">
                  <Scale className="w-3.5 h-3.5 text-sage" />
                  <span>{item.servingSize}</span>
                </div>
              )}

              {item.spiceLevel && item.spiceLevel !== "none" && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span className="capitalize">{item.spiceLevel} spice</span>
                </div>
              )}
            </div>

            {/* 5. Allergens & Ingredients Collapsible Section */}
            {(item.allergens || item.ingredients) && (
              <div className="rounded-2xl border border-border bg-stone-50/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-forest hover:bg-stone-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-meadow-dark" />
                    <span>Ingredients & Allergen Information</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-sage transition-transform ${
                      isIngredientsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isIngredientsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 space-y-3 text-xs text-stone-600 border-t border-border/60"
                    >
                      {item.allergens && item.allergens.length > 0 && (
                        <div>
                          <span className="font-bold text-forest block mb-1">
                            Allergens:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.allergens.map((alg) => (
                              <span
                                key={alg}
                                className="px-2 py-0.5 rounded-md bg-white border border-border text-[11px] font-medium"
                              >
                                {alg}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.ingredients && item.ingredients.length > 0 && (
                        <div>
                          <span className="font-bold text-forest block mb-1">
                            Key Ingredients:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-stone-500">
                            {item.ingredients.map((ing) => (
                              <li key={ing}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 6. Options / Modifiers from Data */}
            {item.optionGroups && item.optionGroups.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="font-serif text-lg font-bold text-forest">
                  Customize your order
                </h3>

                {item.optionGroups.map((group) => (
                  <OptionGroup
                    key={group.id}
                    group={group}
                    selectedIds={selections[group.id] || []}
                    onChange={handleOptionChange}
                    hasError={validationErrors.includes(group.id)}
                  />
                ))}
              </div>
            )}

            {/* 7. Special Instructions Textarea (max 200 chars - FR-ORD-006) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="special-instructions"
                  className="font-serif text-sm font-bold text-forest"
                >
                  Special instructions
                </label>
                <span className="text-[11px] font-semibold text-sage">
                  {specialInstructions.length}/200
                </span>
              </div>

              <textarea
                id="special-instructions"
                maxLength={200}
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., extra hot, oat milk on side, light syrup..."
                className="w-full rounded-2xl border border-border p-3 text-xs text-forest placeholder:text-stone-400 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-meadow focus:border-meadow resize-none transition-all"
              />
            </div>

            {/* 8. Goes Well With (Cross-Sell Mini Cards) */}
            {relatedItems.length > 0 && <RelatedItems items={relatedItems} />}
          </div>
        </div>
      </div>

      {/* 9. Sticky Action Bar */}
      <StickyAddBar
        quantity={quantity}
        onQuantityChange={setQuantity}
        lineTotal={lineTotal}
        isAvailable={item.available}
        isInCart={Boolean(existingCartItem)}
        onAddToCart={handleAddToCart}
        onNotifyMe={() => {
          showToast(
            "info",
            "Notification recorded",
            `We'll alert you when ${item.name} is back in stock.`,
          );
        }}
        onSeeSimilar={() => {
          if (onClose) onClose();
        }}
      />
    </div>
  );
}
