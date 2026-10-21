"use client";

import {
  ArrowDownRight,
  Calculator,
  CheckCircle2,
  ChefHat,
  Coffee,
  DollarSign,
  Layers,
  Percent,
  Play,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InventoryItemEntity } from "@/lib/inventory-api";

interface RecipeItemConfig {
  menuItemId: string;
  name: string;
  category: string;
  retailPrice: number;
  ingredients: Array<{
    inventoryItemId: string;
    ingredientName: string;
    quantity: number;
    unitOfMeasure: string;
  }>;
}

const RECIPE_FORMULATIONS: RecipeItemConfig[] = [
  {
    menuItemId: "11111111-0000-0000-0000-000000000001",
    name: "Ceremonial Yirgacheffe Pour-Over",
    category: "Artisanal Coffee",
    retailPrice: 6.5,
    ingredients: [
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000001",
        ingredientName: "Yirgacheffe Grade 1 Green Coffee Beans",
        quantity: 0.018,
        unitOfMeasure: "kg",
      },
    ],
  },
  {
    menuItemId: "11111111-0000-0000-0000-000000000002",
    name: "Claypot Jebena Buna Ritual",
    category: "Heritage Buna",
    retailPrice: 9.0,
    ingredients: [
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000003",
        ingredientName: "Harar Longberry Sun-Dried Beans",
        quantity: 0.035,
        unitOfMeasure: "kg",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000007",
        ingredientName: "Black Cardamom Pods (Korerima)",
        quantity: 0.003,
        unitOfMeasure: "kg",
      },
    ],
  },
  {
    menuItemId: "11111111-0000-0000-0000-000000000003",
    name: "Pistachio Highland Honey Latte",
    category: "Artisanal Coffee",
    retailPrice: 7.25,
    ingredients: [
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000002",
        ingredientName: "Sidama High-Roast Washed Beans",
        quantity: 0.018,
        unitOfMeasure: "kg",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000004",
        ingredientName: "Organic Whole Milk (Barista Grade)",
        quantity: 0.22,
        unitOfMeasure: "l",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000006",
        ingredientName: "Wild Mountain Acacia Honey",
        quantity: 0.015,
        unitOfMeasure: "kg",
      },
    ],
  },
  {
    menuItemId: "11111111-0000-0000-0000-000000000004",
    name: "Iced Cardamom Spanish Latte",
    category: "Artisanal Coffee",
    retailPrice: 6.8,
    ingredients: [
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000002",
        ingredientName: "Sidama High-Roast Washed Beans",
        quantity: 0.018,
        unitOfMeasure: "kg",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000004",
        ingredientName: "Organic Whole Milk (Barista Grade)",
        quantity: 0.2,
        unitOfMeasure: "l",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000007",
        ingredientName: "Black Cardamom Pods (Korerima)",
        quantity: 0.003,
        unitOfMeasure: "kg",
      },
    ],
  },
  {
    menuItemId: "11111111-0000-0000-0000-000000000009",
    name: "Crispy Chechebsa with Spiced Kibbeh",
    category: "Hot Kitchen",
    retailPrice: 13.5,
    ingredients: [
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000008",
        ingredientName: "Ancient Brown Teff Grain Flour",
        quantity: 0.15,
        unitOfMeasure: "kg",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000009",
        ingredientName: "Clarified Spiced Butter (Niter Kibbeh)",
        quantity: 0.025,
        unitOfMeasure: "kg",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000010",
        ingredientName: "Artisanal Berbere Sun-Dried Spice Blend",
        quantity: 0.005,
        unitOfMeasure: "kg",
      },
    ],
  },
  {
    menuItemId: "11111111-0000-0000-0000-000000000010",
    name: "Slow-Stewed Fava Bean Foul",
    category: "Hot Kitchen",
    retailPrice: 12.0,
    ingredients: [
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000012",
        ingredientName: "Slow-Stew Fava Beans",
        quantity: 0.2,
        unitOfMeasure: "kg",
      },
      {
        inventoryItemId: "22222222-1111-4000-8000-000000000009",
        ingredientName: "Clarified Spiced Butter (Niter Kibbeh)",
        quantity: 0.015,
        unitOfMeasure: "kg",
      },
    ],
  },
];

interface InventoryRecipePanelProps {
  inventoryItems: InventoryItemEntity[];
  onSimulateDepletion: (menuItemId: string, portions: number) => Promise<void>;
}

export function InventoryRecipePanel({
  inventoryItems,
  onSimulateDepletion,
}: InventoryRecipePanelProps) {
  const [depletingId, setDepletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Map inventory items for quick cost lookup
  const itemMap = new Map(inventoryItems.map((i) => [i.id, i]));

  const handleDeplete = async (menuItemId: string, name: string) => {
    setDepletingId(menuItemId);
    setSuccessMsg(null);
    try {
      await onSimulateDepletion(menuItemId, 2);
      setSuccessMsg(`Simulated sale of 2x ${name}. Proportional ingredients depleted from on-hand stock.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      // Handled
    } finally {
      setDepletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-6 rounded-3xl bg-cream border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-sage block mb-1">
            Cost Formulation & Automatic Consumption (FR-RECIPE-001, FR-RECIPE-002)
          </span>
          <h3 className="text-xl font-bold tracking-tight text-forest font-serif">
            Artisan Recipe Margins & Depletion Matrix
          </h3>
          <p className="text-xs text-sage mt-1 max-w-2xl">
            Each recipe maps culinary portions to physical inventory ingredients.
            When cashier sales or kitchen orders are fulfilled, the system automatically
            deducts ingredient weights in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-white border border-border text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage block">
              Configured Recipes
            </span>
            <span className="text-2xl font-black text-forest">
              {RECIPE_FORMULATIONS.length}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-meadow-tint border border-meadow/30 text-meadow-dark text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-meadow" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RECIPE_FORMULATIONS.map((rec) => {
          let totalCost = 0;
          const ingredientBreakdowns = rec.ingredients.map((ing) => {
            const inv = itemMap.get(ing.inventoryItemId);
            const unitCost = inv?.unitCost ?? 15.0;
            const lineCost = ing.quantity * unitCost;
            totalCost += lineCost;
            return {
              ...ing,
              unitCost,
              lineCost,
              currentStock: inv?.currentQuantity ?? 0,
            };
          });

          const grossMargin =
            rec.retailPrice > 0
              ? Number((((rec.retailPrice - totalCost) / rec.retailPrice) * 100).toFixed(1))
              : 0;

          return (
            <div
              key={rec.menuItemId}
              className="p-5 rounded-3xl bg-white border border-border shadow-xs hover:border-meadow/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cream-alt text-sage border border-border">
                    {rec.category}
                  </span>
                  <div className="flex items-center gap-1 text-meadow-dark font-black text-xs">
                    <span>{grossMargin}% Margin</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-forest tracking-tight line-clamp-1 mb-2">
                  {rec.name}
                </h4>

                {/* Price vs Cost */}
                <div className="p-3 rounded-2xl bg-cream/60 border border-border/80 grid grid-cols-2 gap-2 text-xs mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sage block">
                      Retail Price
                    </span>
                    <span className="text-base font-black text-forest">
                      ${rec.retailPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sage block">
                      Ingredient Cost
                    </span>
                    <span className="text-base font-black text-amber-900">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Ingredients Formula List */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sage block">
                    Formulation Breakdown
                  </span>
                  {ingredientBreakdowns.map((ing) => (
                    <div
                      key={ing.inventoryItemId}
                      className="text-xs p-2.5 rounded-xl bg-cream-alt/40 border border-border/60 flex items-center justify-between"
                    >
                      <div className="truncate max-w-[170px]">
                        <span className="font-semibold text-forest block truncate">
                          {ing.ingredientName}
                        </span>
                        <span className="text-[10px] text-sage">
                          Stock: {ing.currentStock.toFixed(1)} {ing.unitOfMeasure}
                        </span>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="font-black text-forest text-xs block">
                          {ing.quantity} {ing.unitOfMeasure}
                        </span>
                        <span className="text-[10px] text-sage font-medium">
                          ${ing.lineCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  isLoading={depletingId === rec.menuItemId}
                  onClick={() => handleDeplete(rec.menuItemId, rec.name)}
                  leftIcon={<Play className="w-3.5 h-3.5 text-meadow" />}
                >
                  Test Sale Depletion (2x Portions)
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
