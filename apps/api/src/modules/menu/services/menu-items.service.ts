import {
  categories,
  type Database,
  departments,
  ingredients,
  menuItems,
  recipeItems,
  recipes,
} from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { DATABASE_TOKEN } from "../../database/database.constants";
import type {
  CreateMenuItemDto,
  MenuItemQueryDto,
  SetRecipeDto,
  UpdateMenuItemDto,
} from "../dto/menu-item.dto";

@Injectable()
export class MenuItemsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(query?: MenuItemQueryDto) {
    const conditions = [];

    if (query?.categoryId) {
      conditions.push(eq(menuItems.categoryId, query.categoryId));
    }

    if (query?.departmentId) {
      conditions.push(eq(menuItems.departmentId, query.departmentId));
    }

    if (query?.availabilityStatus) {
      conditions.push(
        eq(menuItems.availabilityStatus, query.availabilityStatus),
      );
    }

    if (query?.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(ilike(menuItems.name, term), ilike(menuItems.description, term)),
      );
    }

    const baseQuery = this.db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        availabilityStatus: menuItems.availabilityStatus,
        categoryId: menuItems.categoryId,
        categoryName: categories.name,
        departmentId: menuItems.departmentId,
        departmentName: departments.name,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
      })
      .from(menuItems)
      .innerJoin(categories, eq(menuItems.categoryId, categories.id))
      .innerJoin(departments, eq(menuItems.departmentId, departments.id));

    if (conditions.length > 0) {
      return baseQuery.where(and(...conditions)).orderBy(menuItems.name);
    }

    return baseQuery.orderBy(menuItems.name);
  }

  async findById(id: string) {
    const [item] = await this.db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        availabilityStatus: menuItems.availabilityStatus,
        categoryId: menuItems.categoryId,
        categoryName: categories.name,
        departmentId: menuItems.departmentId,
        departmentName: departments.name,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
      })
      .from(menuItems)
      .innerJoin(categories, eq(menuItems.categoryId, categories.id))
      .innerJoin(departments, eq(menuItems.departmentId, departments.id))
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Fetch active recipe if present
    const [activeRecipe] = await this.db
      .select()
      .from(recipes)
      .where(and(eq(recipes.menuItemId, id), eq(recipes.status, "active")))
      .orderBy(desc(recipes.version))
      .limit(1);

    let recipeDetails = null;

    if (activeRecipe) {
      const items = await this.db
        .select({
          ingredientId: recipeItems.ingredientId,
          ingredientName: ingredients.name,
          quantity: recipeItems.quantity,
          unitOfMeasure: recipeItems.unitOfMeasure,
        })
        .from(recipeItems)
        .innerJoin(ingredients, eq(recipeItems.ingredientId, ingredients.id))
        .where(eq(recipeItems.recipeId, activeRecipe.id));

      recipeDetails = {
        ...activeRecipe,
        ingredients: items,
      };
    }

    return {
      ...item,
      recipe: recipeDetails,
    };
  }

  async create(dto: CreateMenuItemDto) {
    const [existingCategory] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, dto.categoryId))
      .limit(1);

    if (!existingCategory) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found`,
      );
    }

    const [existingDepartment] = await this.db
      .select()
      .from(departments)
      .where(eq(departments.id, dto.departmentId))
      .limit(1);

    if (!existingDepartment) {
      throw new NotFoundException(
        `Department with ID ${dto.departmentId} not found`,
      );
    }

    const [existingName] = await this.db
      .select()
      .from(menuItems)
      .where(ilike(menuItems.name, dto.name.trim()))
      .limit(1);

    if (existingName) {
      throw new ConflictException(
        `Menu item with name "${dto.name}" already exists`,
      );
    }

    return this.db.transaction(async (tx) => {
      const [insertedItem] = await tx
        .insert(menuItems)
        .values({
          name: dto.name.trim(),
          categoryId: dto.categoryId,
          departmentId: dto.departmentId,
          description: dto.description?.trim() || null,
          price: String(dto.price),
          availabilityStatus: dto.availabilityStatus || "AVAILABLE",
        })
        .returning();

      if (!insertedItem) {
        throw new BadRequestException("Failed to create menu item");
      }

      if (dto.recipe && dto.recipe.ingredients.length > 0) {
        const [insertedRecipe] = await tx
          .insert(recipes)
          .values({
            menuItemId: insertedItem.id,
            name:
              dto.recipe.name?.trim() || `${insertedItem.name} Standard Recipe`,
            version: 1,
            status: "active",
          })
          .returning();

        if (insertedRecipe) {
          for (const ing of dto.recipe.ingredients) {
            await tx.insert(recipeItems).values({
              recipeId: insertedRecipe.id,
              ingredientId: ing.ingredientId,
              quantity: String(ing.quantity),
              unitOfMeasure: ing.unitOfMeasure,
            });
          }
        }
      }

      return insertedItem;
    });
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findById(id);

    if (dto.categoryId) {
      const [cat] = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, dto.categoryId))
        .limit(1);
      if (!cat) {
        throw new NotFoundException(
          `Category with ID ${dto.categoryId} not found`,
        );
      }
    }

    if (dto.departmentId) {
      const [dept] = await this.db
        .select()
        .from(departments)
        .where(eq(departments.id, dto.departmentId))
        .limit(1);
      if (!dept) {
        throw new NotFoundException(
          `Department with ID ${dto.departmentId} not found`,
        );
      }
    }

    if (dto.name?.trim()) {
      const [conflict] = await this.db
        .select()
        .from(menuItems)
        .where(ilike(menuItems.name, dto.name.trim()))
        .limit(1);

      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Menu item with name "${dto.name}" already exists`,
        );
      }
    }

    const [updated] = await this.db
      .update(menuItems)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.departmentId ? { departmentId: dto.departmentId } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.price !== undefined ? { price: String(dto.price) } : {}),
        ...(dto.availabilityStatus
          ? { availabilityStatus: dto.availabilityStatus }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, id))
      .returning();

    return updated;
  }

  async updateAvailability(id: string, availabilityStatus: string) {
    await this.findById(id);

    const [updated] = await this.db
      .update(menuItems)
      .set({
        availabilityStatus,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);

    return this.db.transaction(async (tx) => {
      // Find all recipes for this item
      const itemRecipes = await tx
        .select({ id: recipes.id })
        .from(recipes)
        .where(eq(recipes.menuItemId, id));

      for (const r of itemRecipes) {
        await tx.delete(recipeItems).where(eq(recipeItems.recipeId, r.id));
      }

      await tx.delete(recipes).where(eq(recipes.menuItemId, id));
      await tx.delete(menuItems).where(eq(menuItems.id, id));

      return { message: "Menu item deleted successfully" };
    });
  }

  async setRecipe(menuItemId: string, dto: SetRecipeDto) {
    const item = await this.findById(menuItemId);

    // Validate that each ingredient exists
    for (const ing of dto.ingredients) {
      const [foundIngredient] = await this.db
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, ing.ingredientId))
        .limit(1);

      if (!foundIngredient) {
        throw new NotFoundException(
          `Ingredient with ID ${ing.ingredientId} not found`,
        );
      }
    }

    return this.db.transaction(async (tx) => {
      // Find highest existing recipe version
      const [latest] = await tx
        .select({ version: recipes.version })
        .from(recipes)
        .where(eq(recipes.menuItemId, menuItemId))
        .orderBy(desc(recipes.version))
        .limit(1);

      const nextVersion = (latest?.version || 0) + 1;

      // Archive previous recipes
      await tx
        .update(recipes)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(recipes.menuItemId, menuItemId));

      // Insert new active recipe
      const [createdRecipe] = await tx
        .insert(recipes)
        .values({
          menuItemId,
          name: dto.name?.trim() || `${item.name} Recipe v${nextVersion}`,
          version: nextVersion,
          status: "active",
        })
        .returning();

      if (!createdRecipe) {
        throw new BadRequestException("Failed to create recipe");
      }

      // Insert recipe items
      for (const ing of dto.ingredients) {
        await tx.insert(recipeItems).values({
          recipeId: createdRecipe.id,
          ingredientId: ing.ingredientId,
          quantity: String(ing.quantity),
          unitOfMeasure: ing.unitOfMeasure,
        });
      }

      const completeIngredients = await tx
        .select({
          ingredientId: recipeItems.ingredientId,
          ingredientName: ingredients.name,
          quantity: recipeItems.quantity,
          unitOfMeasure: recipeItems.unitOfMeasure,
        })
        .from(recipeItems)
        .innerJoin(ingredients, eq(recipeItems.ingredientId, ingredients.id))
        .where(eq(recipeItems.recipeId, createdRecipe.id));

      return {
        ...createdRecipe,
        ingredients: completeIngredients,
      };
    });
  }
}
