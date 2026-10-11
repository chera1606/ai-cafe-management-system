import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

export const ingredientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  unitOfMeasure: z.string().min(1, "Unit of measure is required").max(20),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type IngredientFormData = z.infer<typeof ingredientSchema>;

export const recipeIngredientItemSchema = z.object({
  ingredientId: z.string().uuid("Invalid ingredient ID"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Quantity must be a positive number",
    }),
  unitOfMeasure: z.string().min(1, "Unit is required"),
});

export const recipeSchema = z.object({
  name: z.string().max(100).optional(),
  ingredients: z
    .array(recipeIngredientItemSchema)
    .min(1, "At least one ingredient is required"),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  categoryId: z.string().uuid("Please select a category"),
  departmentId: z.string().uuid("Please select a department station"),
  description: z.string().max(500).optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message: "Price must be a valid number",
    }),
  availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE"]).default("AVAILABLE"),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;
