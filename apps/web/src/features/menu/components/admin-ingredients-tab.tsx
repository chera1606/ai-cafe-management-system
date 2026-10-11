"use client";

import { Edit, Loader2, Plus, Scale, Search, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { menuApi } from "../api/menu-api";
import { type IngredientFormData, ingredientSchema } from "../schemas";
import type { Ingredient } from "../types";

export function AdminIngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [formData, setFormData] = useState<IngredientFormData>({
    name: "",
    unitOfMeasure: "g",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.getIngredients();
      setIngredients(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load ingredients",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const openCreateModal = () => {
    setEditingIngredient(null);
    setFormData({ name: "", unitOfMeasure: "g", status: "active" });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setFormData({
      name: ing.name,
      unitOfMeasure: ing.unitOfMeasure,
      status: (ing.status as "active" | "inactive") || "active",
    });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    const validation = ingredientSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingIngredient) {
        await menuApi.updateIngredient(editingIngredient.id, validation.data);
        setSuccess(
          `Ingredient "${validation.data.name}" updated successfully.`,
        );
      } else {
        await menuApi.createIngredient(validation.data);
        setSuccess(
          `Ingredient "${validation.data.name}" created successfully.`,
        );
      }
      setIsModalOpen(false);
      await loadIngredients();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save ingredient",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete ingredient "${name}"?`)
    ) {
      return;
    }

    try {
      await menuApi.deleteIngredient(id);
      setSuccess(`Ingredient "${name}" deleted.`);
      await loadIngredients();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete ingredient",
      );
    }
  };

  const filteredIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" className="animate-in fade-in">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="animate-in fade-in">
          {success}
        </Alert>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raw ingredients..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Raw Ingredient
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-5 py-3">Ingredient Name</th>
                <th className="px-5 py-3">Unit of Measure</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-stone-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading ingredients...
                  </td>
                </tr>
              ) : filteredIngredients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-stone-500"
                  >
                    No ingredients found.
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((ing) => (
                  <tr
                    key={ing.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40"
                  >
                    <td className="px-5 py-3.5 font-medium text-stone-900 dark:text-stone-100">
                      {ing.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {ing.unitOfMeasure}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          ing.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700"
                        }`}
                      >
                        {ing.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(ing)}
                        className="h-8 px-2"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ing.id, ing.name)}
                        className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold">
                {editingIngredient
                  ? "Edit Raw Ingredient"
                  : "Add Raw Ingredient"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Ingredient Name"
                placeholder="e.g. Arabica Beans"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={formErrors.name}
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="ing-uom"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Unit of Measure
                </label>
                <div className="flex gap-2">
                  <input
                    id="ing-uom"
                    type="text"
                    value={formData.unitOfMeasure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitOfMeasure: e.target.value,
                      })
                    }
                    placeholder="e.g. g, ml, pcs, kg"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    required
                  />
                  <div className="flex gap-1 shrink-0">
                    {["g", "ml", "pcs"].map((uom) => (
                      <button
                        key={uom}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, unitOfMeasure: uom })
                        }
                        className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        {uom}
                      </button>
                    ))}
                  </div>
                </div>
                {formErrors.unitOfMeasure && (
                  <p className="text-xs text-rose-600">
                    {formErrors.unitOfMeasure}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="ing-status"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Status
                </label>
                <select
                  id="ing-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  {editingIngredient ? "Save Changes" : "Create Ingredient"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
