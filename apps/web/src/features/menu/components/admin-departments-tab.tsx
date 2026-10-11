"use client";

import { Building2, Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { menuApi } from "../api/menu-api";
import { type DepartmentFormData, departmentSchema } from "../schemas";
import type { Department } from "../types";

export function AdminDepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await menuApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load departments",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const openCreateModal = () => {
    setEditingDepartment(null);
    setFormData({ name: "", description: "", status: "active" });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || "",
      status: (dept.status as "active" | "inactive") || "active",
    });
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    const validation = departmentSchema.safeParse(formData);
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
      if (editingDepartment) {
        await menuApi.updateDepartment(editingDepartment.id, validation.data);
        setSuccess(
          `Department "${validation.data.name}" updated successfully.`,
        );
      } else {
        await menuApi.createDepartment(validation.data);
        setSuccess(
          `Department "${validation.data.name}" created successfully.`,
        );
      }
      setIsModalOpen(false);
      await loadDepartments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save department",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete department "${name}"?`)
    ) {
      return;
    }

    try {
      await menuApi.deleteDepartment(id);
      setSuccess(`Department "${name}" deleted.`);
      await loadDepartments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete department",
      );
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search preparation stations..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <Button onClick={openCreateModal} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Department Station
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-5 py-3">Station Name</th>
                <th className="px-5 py-3">Station Scope</th>
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
                    Loading department stations...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-stone-500"
                  >
                    No department stations configured.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40"
                  >
                    <td className="px-5 py-3.5 font-medium text-stone-900 dark:text-stone-100">
                      {dept.name}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 max-w-xs truncate">
                      {dept.description || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          dept.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700"
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(dept)}
                        className="h-8 px-2"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dept.id, dept.name)}
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
              <Building2 className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-bold">
                {editingDepartment
                  ? "Edit Department Station"
                  : "Create Preparation Station"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Department Name"
                placeholder="e.g. Cold Beverage Station"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={formErrors.name}
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="dept-desc"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Station Equipment & Preparation Scope
                </label>
                <textarea
                  id="dept-desc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g. Iced drinks, cold brew kegs, and blenders..."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="dept-status"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Operational Status
                </label>
                <select
                  id="dept-status"
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
                  {editingDepartment ? "Save Changes" : "Create Station"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
