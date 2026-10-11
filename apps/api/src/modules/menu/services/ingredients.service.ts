import { type Database, ingredients, recipeItems } from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq, ilike } from "drizzle-orm";
import { DATABASE_TOKEN } from "../../database/database.constants";
import type {
  CreateIngredientDto,
  IngredientQueryDto,
  UpdateIngredientDto,
} from "../dto/ingredient.dto";

@Injectable()
export class IngredientsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(query?: IngredientQueryDto) {
    const conditions = [];

    if (query?.status) {
      conditions.push(eq(ingredients.status, query.status));
    }

    if (query?.search?.trim()) {
      conditions.push(ilike(ingredients.name, `%${query.search.trim()}%`));
    }

    if (conditions.length > 0) {
      return this.db
        .select()
        .from(ingredients)
        .where(and(...conditions))
        .orderBy(ingredients.name);
    }

    return this.db.select().from(ingredients).orderBy(ingredients.name);
  }

  async findById(id: string) {
    const [ingredient] = await this.db
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, id))
      .limit(1);

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  }

  async create(dto: CreateIngredientDto) {
    const [existing] = await this.db
      .select()
      .from(ingredients)
      .where(ilike(ingredients.name, dto.name.trim()))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Ingredient with name "${dto.name}" already exists`,
      );
    }

    const [created] = await this.db
      .insert(ingredients)
      .values({
        name: dto.name.trim(),
        unitOfMeasure: dto.unitOfMeasure.trim(),
        status: dto.status || "active",
      })
      .returning();

    if (!created) {
      throw new BadRequestException("Failed to create ingredient");
    }

    return created;
  }

  async update(id: string, dto: UpdateIngredientDto) {
    await this.findById(id);

    if (dto.name?.trim()) {
      const [existing] = await this.db
        .select()
        .from(ingredients)
        .where(ilike(ingredients.name, dto.name.trim()))
        .limit(1);

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ingredient with name "${dto.name}" already exists`,
        );
      }
    }

    const [updated] = await this.db
      .update(ingredients)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.unitOfMeasure
          ? { unitOfMeasure: dto.unitOfMeasure.trim() }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);

    const [linkedRecipeItem] = await this.db
      .select({ recipeId: recipeItems.recipeId })
      .from(recipeItems)
      .where(eq(recipeItems.ingredientId, id))
      .limit(1);

    if (linkedRecipeItem) {
      throw new BadRequestException(
        "Cannot delete ingredient that is actively used in recipes. Remove it from recipes first.",
      );
    }

    await this.db.delete(ingredients).where(eq(ingredients.id, id));

    return { message: "Ingredient deleted successfully" };
  }
}
