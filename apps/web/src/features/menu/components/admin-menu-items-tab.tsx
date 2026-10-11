"use client";

import {
  CheckCircle2,
  Coffee,
  Edit,
  Loader2,
  Plus,
  Scale,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { menuApi } from "../api/menu-api";
import { type MenuItemFormData, menuItemSchema } from "../schemas";
import type { Category, Department, MenuItem } from "../types";
import { RecipeBuilderModal } from "./recipe-builder-modal";

export function AdminMenuItemsTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State for Item Create/Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    categoryId: "",
    departmentId: "",
    description: "",
    price: "",
    availabilityStatus: "AVAILABLE",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recipe Builder Modal State
  const [recipeItem, setRecipeItem] = useState<MenuItem | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allItems, allCats, allDepts] = await Promise.all([
        menuApi.getMenuItems(),
        menuApi.getCategories(),
        menuApi.getDepartments(),
      ]);
      setItems(allItems);
      setCategories(allCats);
      setDepartments(allDepts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load menu items",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      departmentId: departments[0]?.id || "",
      description: "",
      price: "",
      availabilityStatus: "AVAILABLE",
    });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      departmentId: item.departmentId,
      description: item.description || "",
      price: String(item.price),
      availabilityStatus:
        (item.availabilityStatus as "AVAILABLE" | "UNAVAILABLE") || "AVAILABLE",
    });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    const validation = menuItemSchema.safeParse(formData);
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
      if (editingItem) {
        await menuApi.updateMenuItem(editingItem.id, validation.data);
        setSuccess(`Menu item "${validation.data.name}" updated successfully.`);
      } else {
        await menuApi.createMenuItem(validation.data);
        setSuccess(`Menu item "${validation.data.name}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const nextStatus =
      item.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    try {
      await menuApi.updateMenuItemAvailability(item.id, nextStatus);
      setSuccess(`Status changed to ${nextStatus}.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update availability",
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete menu item "${name}"?`)
    ) {
      return;
    }

    try {
      await menuApi.deleteMenuItem(id);
      setSuccess(`Menu item "${name}" deleted.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-5 py-3">Item Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Station</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Availability</th>
                <th className="px-5 py-3">Recipe / BOM</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-stone-400"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading menu items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-stone-500"
                  >
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isAvailable = item.availabilityStatus === "AVAILABLE";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40"
                    >
                      <td className="px-5 py-3.5 font-medium text-stone-900 dark:text-stone-100">
                        {item.name}
                      </td>
                      <td className="px-5 py-3.5 text-stone-600 dark:text-stone-300 text-xs">
                        {item.categoryName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-stone-600 dark:text-stone-300 text-xs">
                        {item.departmentName || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-amber-800 dark:text-amber-400">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                          )}
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>AVAILABLE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>UNAVAILABLE</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRecipeItem(item)}
                          className="text-xs gap-1.5 h-7"
                        >
                          <Scale className="w-3 h-3 text-amber-700" />
                          Recipe Builder
                        </Button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 px-2"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Form */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold">
                {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Item Name"
                placeholder="e.g. Signature Espresso"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={formErrors.name}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="cat-select"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                  >
                    Category
                  </label>
                  <select
                    id="cat-select"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && (
                    <p className="text-xs text-rose-600">
                      {formErrors.categoryId}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dept-select"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                  >
                    Preparation Station
                  </label>
                  <select
                    id="dept-select"
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    required
                  >
                    <option value="">Select Station...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.departmentId && (
                    <p className="text-xs text-rose-600">
                      {formErrors.departmentId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Price ($ USD)"
                  placeholder="e.g. 4.50"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  error={formErrors.price}
                  required
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="avail-select"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                  >
                    Initial Availability
                  </label>
                  <select
                    id="avail-select"
                    value={formData.availabilityStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availabilityStatus: e.target.value as
                          | "AVAILABLE"
                          | "UNAVAILABLE",
                      })
                    }
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="item-desc"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Description
                </label>
                <textarea
                  id="item-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Sensory notes, extraction ratio, details..."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
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
                  {editingItem ? "Save Changes" : "Create Menu Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Builder Modal */}
      <RecipeBuilderModal
        item={recipeItem}
        onClose={() => setRecipeItem(null)}
        onRecipeSaved={() => {
          loadData();
          setSuccess("Recipe successfully assigned and updated.");
        }}
      />
    </div>
  );
}
