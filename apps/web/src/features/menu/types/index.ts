export interface Category {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive" | string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive" | string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unitOfMeasure: string;
  status: "active" | "inactive" | string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName?: string;
  quantity: string;
  unitOfMeasure: string;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  name: string;
  version: number;
  status: "active" | "archived" | string;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  departmentId: string;
  departmentName?: string;
  name: string;
  description: string | null;
  price: string;
  availabilityStatus: "AVAILABLE" | "UNAVAILABLE" | string;
  createdAt: string;
  updatedAt: string;
  recipe?: Recipe | null;
}

export interface MenuItemFilterParams {
  categoryId?: string;
  departmentId?: string;
  availabilityStatus?: "AVAILABLE" | "UNAVAILABLE";
  search?: string;
}
