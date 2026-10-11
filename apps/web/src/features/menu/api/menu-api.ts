import { apiClient } from "@/lib/api-client";
import type {
  CategoryFormData,
  DepartmentFormData,
  IngredientFormData,
  MenuItemFormData,
  RecipeFormData,
} from "../schemas";
import type {
  Category,
  Department,
  Ingredient,
  MenuItem,
  MenuItemFilterParams,
  Recipe,
} from "../types";

export const menuApi = {
  // ─── Categories ─────────────────────────────────────────────────────────────
  async getCategories(params?: {
    status?: string;
    search?: string;
  }): Promise<Category[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    const queryString = query.toString();
    return apiClient<Category[]>(
      queryString ? `/menu/categories?${queryString}` : "/menu/categories",
    );
  },

  async getCategory(id: string): Promise<Category> {
    return apiClient<Category>(`/menu/categories/${id}`);
  },

  async createCategory(data: CategoryFormData): Promise<Category> {
    return apiClient<Category>("/menu/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCategory(
    id: string,
    data: Partial<CategoryFormData>,
  ): Promise<Category> {
    return apiClient<Category>(`/menu/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateCategoryStatus(id: string, status: string): Promise<Category> {
    return apiClient<Category>(`/menu/categories/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/menu/categories/${id}`, {
      method: "DELETE",
    });
  },

  // ─── Departments ───────────────────────────────────────────────────────────
  async getDepartments(params?: {
    status?: string;
    search?: string;
  }): Promise<Department[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    const queryString = query.toString();
    return apiClient<Department[]>(
      queryString ? `/menu/departments?${queryString}` : "/menu/departments",
    );
  },

  async getDepartment(id: string): Promise<Department> {
    return apiClient<Department>(`/menu/departments/${id}`);
  },

  async createDepartment(data: DepartmentFormData): Promise<Department> {
    return apiClient<Department>("/menu/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(
    id: string,
    data: Partial<DepartmentFormData>,
  ): Promise<Department> {
    return apiClient<Department>(`/menu/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteDepartment(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/menu/departments/${id}`, {
      method: "DELETE",
    });
  },

  // ─── Ingredients ───────────────────────────────────────────────────────────
  async getIngredients(params?: {
    status?: string;
    search?: string;
  }): Promise<Ingredient[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    const queryString = query.toString();
    return apiClient<Ingredient[]>(
      queryString ? `/menu/ingredients?${queryString}` : "/menu/ingredients",
    );
  },

  async getIngredient(id: string): Promise<Ingredient> {
    return apiClient<Ingredient>(`/menu/ingredients/${id}`);
  },

  async createIngredient(data: IngredientFormData): Promise<Ingredient> {
    return apiClient<Ingredient>("/menu/ingredients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateIngredient(
    id: string,
    data: Partial<IngredientFormData>,
  ): Promise<Ingredient> {
    return apiClient<Ingredient>(`/menu/ingredients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteIngredient(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/menu/ingredients/${id}`, {
      method: "DELETE",
    });
  },

  // ─── Menu Items ────────────────────────────────────────────────────────────
  async getMenuItems(params?: MenuItemFilterParams): Promise<MenuItem[]> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append("categoryId", params.categoryId);
    if (params?.departmentId) query.append("departmentId", params.departmentId);
    if (params?.availabilityStatus)
      query.append("availabilityStatus", params.availabilityStatus);
    if (params?.search) query.append("search", params.search);
    const queryString = query.toString();
    return apiClient<MenuItem[]>(
      queryString ? `/menu/items?${queryString}` : "/menu/items",
    );
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    return apiClient<MenuItem>(`/menu/items/${id}`);
  },

  async createMenuItem(data: MenuItemFormData): Promise<MenuItem> {
    return apiClient<MenuItem>("/menu/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateMenuItem(
    id: string,
    data: Partial<MenuItemFormData>,
  ): Promise<MenuItem> {
    return apiClient<MenuItem>(`/menu/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateMenuItemAvailability(
    id: string,
    availabilityStatus: "AVAILABLE" | "UNAVAILABLE",
  ): Promise<MenuItem> {
    return apiClient<MenuItem>(`/menu/items/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ availabilityStatus }),
    });
  },

  async deleteMenuItem(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/menu/items/${id}`, {
      method: "DELETE",
    });
  },

  // ─── Recipes ───────────────────────────────────────────────────────────────
  async setMenuItemRecipe(
    menuItemId: string,
    data: RecipeFormData,
  ): Promise<Recipe> {
    return apiClient<Recipe>(`/menu/items/${menuItemId}/recipe`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
