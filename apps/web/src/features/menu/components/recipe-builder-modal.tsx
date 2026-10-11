"use client";

import { Coffee, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { menuApi } from "../api/menu-api";
import { type RecipeFormData, recipeSchema } from "../schemas";
import type { Ingredient, MenuItem } from "../types";

interface RecipeBuilderModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onRecipeSaved: () => void;
}

interface IngredientRow {
  ingredientId: string;
  quantity: string;
  unitOfMeasure: string;
}

export function RecipeBuilderModal({
  item,
  onClose,
  onRecipeSaved,
}: RecipeBuilderModalProps) {
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [recipeName, setRecipeName] = useState<string>("");
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      menuApi.getIngredients({ status: "active" }),
      menuApi.getMenuItem(item.id),
    ])
      .then(([ingList, fullItem]) => {
        if (!isMounted) return;
        setAvailableIngredients(ingList);

        if (fullItem.recipe && fullItem.recipe.ingredients.length > 0) {
          setRecipeName(fullItem.recipe.name);
          setRows(
            fullItem.recipe.ingredients.map((i) => ({
              ingredientId: i.ingredientId,
              quantity: String(Number(i.quantity)),
              unitOfMeasure: i.unitOfMeasure,
            })),
          );
        } else {
          setRecipeName(`${item.name} Standard Recipe`);
          if (ingList.length > 0 && ingList[0]) {
            setRows([
              {
                ingredientId: ingList[0].id,
                quantity: "1",
                unitOfMeasure: ingList[0].unitOfMeasure,
              },
            ]);
          } else {
            setRows([]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load recipe details",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item]);

  if (!item) return null;

  const handleAddRow = () => {
    if (availableIngredients.length === 0) return;
    const defaultIng = availableIngredients[0];
    if (!defaultIng) return;
    setRows([
      ...rows,
      {
        ingredientId: defaultIng.id,
        quantity: "1",
        unitOfMeasure: defaultIng.unitOfMeasure,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const handleIngredientChange = (index: number, newIngredientId: string) => {
    const found = availableIngredients.find((i) => i.id === newIngredientId);
    if (!found) return;

    const newRows = [...rows];
    const currentRow = newRows[index];
    if (!currentRow) return;

    newRows[index] = {
      ...currentRow,
      ingredientId: newIngredientId,
      unitOfMeasure: found.unitOfMeasure,
    };
    setRows(newRows);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const newRows = [...rows];
    const currentRow = newRows[index];
    if (!currentRow) return;

    newRows[index] = {
      ...currentRow,
      quantity,
    };
    setRows(newRows);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (rows.length === 0) {
      setError("Please add at least one ingredient to the recipe.");
      return;
    }

    const payload: RecipeFormData = {
      name: recipeName.trim() || `${item.name} Standard Recipe`,
      ingredients: rows.map((r) => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity,
        unitOfMeasure: r.unitOfMeasure,
      })),
    };

    const validation = recipeSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Validation failed");
      return;
    }

    setIsSubmitting(true);
    try {
      await menuApi.setMenuItemRecipe(item.id, validation.data);
      setSuccess("Recipe successfully updated with new version!");
      setTimeout(() => {
        onRecipeSaved();
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <Coffee className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                Interactive Recipe Builder
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              Configure bill of materials and ingredient quantities for{" "}
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {item.name}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Input
            label="Recipe Version Title"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="e.g. Signature Espresso Standard Recipe"
            required
          />

          {/* Dynamic Ingredient Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="raw-ingredients-heading"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider"
              >
                Raw Ingredients Bill of Materials
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="text-xs gap-1 h-7"
                disabled={availableIngredients.length === 0}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Ingredient
              </Button>
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-stone-400">
                Loading recipe details...
              </div>
            ) : rows.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
                No ingredients assigned yet. Click "Add Ingredient" above.
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form row index
                    key={`row-${idx}`}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40"
                  >
                    {/* Ingredient Select */}
                    <select
                      value={row.ingredientId}
                      onChange={(e) =>
                        handleIngredientChange(idx, e.target.value)
                      }
                      className="flex-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    >
                      {availableIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unitOfMeasure})
                        </option>
                      ))}
                    </select>

                    {/* Quantity Input */}
                    <div className="w-24">
                      <input
                        type="text"
                        value={row.quantity}
                        onChange={(e) =>
                          handleQuantityChange(idx, e.target.value)
                        }
                        placeholder="Qty"
                        className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 font-mono text-right focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                        required
                      />
                    </div>

                    {/* Unit Tag */}
                    <span className="w-12 text-xs font-mono text-stone-500">
                      {row.unitOfMeasure}
                    </span>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 flex justify-end gap-2 -mx-6 -mb-6 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={isLoading || rows.length === 0}
            >
              Save Recipe Version
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
