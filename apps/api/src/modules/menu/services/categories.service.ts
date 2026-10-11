import { categories, type Database, menuItems } from "@cafe/db";
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
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../dto/category.dto";

@Injectable()
export class CategoriesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(query?: CategoryQueryDto) {
    const conditions = [];

    if (query?.status) {
      conditions.push(eq(categories.status, query.status));
    }

    if (query?.search?.trim()) {
      conditions.push(ilike(categories.name, `%${query.search.trim()}%`));
    }

    if (conditions.length > 0) {
      return this.db
        .select()
        .from(categories)
        .where(and(...conditions))
        .orderBy(categories.name);
    }

    return this.db.select().from(categories).orderBy(categories.name);
  }

  async findById(id: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(ilike(categories.name, dto.name.trim()))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`,
      );
    }

    const [created] = await this.db
      .insert(categories)
      .values({
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        status: dto.status || "active",
      })
      .returning();

    if (!created) {
      throw new BadRequestException("Failed to create category");
    }

    return created;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    if (dto.name?.trim()) {
      const [existing] = await this.db
        .select()
        .from(categories)
        .where(ilike(categories.name, dto.name.trim()))
        .limit(1);

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }
    }

    const [updated] = await this.db
      .update(categories)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated;
  }

  async updateStatus(id: string, status: string) {
    await this.findById(id);

    const [updated] = await this.db
      .update(categories)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);

    const [linkedItem] = await this.db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.categoryId, id))
      .limit(1);

    if (linkedItem) {
      throw new BadRequestException(
        "Cannot delete category with associated menu items. Deactivate it instead.",
      );
    }

    await this.db.delete(categories).where(eq(categories.id, id));

    return { message: "Category deleted successfully" };
  }
}
