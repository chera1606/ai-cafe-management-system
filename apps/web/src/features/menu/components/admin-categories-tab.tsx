"use client";

import { Edit, FolderPlus, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { menuApi } from "../api/menu-api";
import { type CategoryFormData, categorySchema } from "../schemas";
import type { Category } from "../types";

export function AdminCategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", status: "active" });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      status: (cat.status as "active" | "inactive") || "active",
    });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    const validation = categorySchema.safeParse(formData);
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
      if (editingCategory) {
        await menuApi.updateCategory(editingCategory.id, validation.data);
        setSuccess(`Category "${validation.data.name}" updated successfully.`);
      } else {
        await menuApi.createCategory(validation.data);
        setSuccess(`Category "${validation.data.name}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    try {
      await menuApi.updateCategoryStatus(cat.id, nextStatus);
      setSuccess(`Status changed to ${nextStatus}.`);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete category "${name}"?`)
    ) {
      return;
    }

    try {
      await menuApi.deleteCategory(id);
      setSuccess(`Category "${name}" deleted.`);
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Notifications */}
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
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Description</th>
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
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-stone-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40"
                  >
                    <td className="px-5 py-3.5 font-medium text-stone-900 dark:text-stone-100">
                      {cat.name}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 max-w-xs truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                          cat.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700"
                        }`}
                      >
                        {cat.status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(cat)}
                        className="h-8 px-2"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat.id, cat.name)}
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
              <FolderPlus className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                placeholder="e.g. Signature Espresso"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={formErrors.name}
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="cat-desc"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Description
                </label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional details..."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cat-status"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Status
                </label>
                <select
                  id="cat-status"
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
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
