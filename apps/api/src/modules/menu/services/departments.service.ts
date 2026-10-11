import { type Database, departments, menuItems } from "@cafe/db";
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
  CreateDepartmentDto,
  DepartmentQueryDto,
  UpdateDepartmentDto,
} from "../dto/department.dto";

@Injectable()
export class DepartmentsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(query?: DepartmentQueryDto) {
    const conditions = [];

    if (query?.status) {
      conditions.push(eq(departments.status, query.status));
    }

    if (query?.search?.trim()) {
      conditions.push(ilike(departments.name, `%${query.search.trim()}%`));
    }

    if (conditions.length > 0) {
      return this.db
        .select()
        .from(departments)
        .where(and(...conditions))
        .orderBy(departments.name);
    }

    return this.db.select().from(departments).orderBy(departments.name);
  }

  async findById(id: string) {
    const [department] = await this.db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1);

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async create(dto: CreateDepartmentDto) {
    const [existing] = await this.db
      .select()
      .from(departments)
      .where(ilike(departments.name, dto.name.trim()))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Department with name "${dto.name}" already exists`,
      );
    }

    const [created] = await this.db
      .insert(departments)
      .values({
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        status: dto.status || "active",
      })
      .returning();

    if (!created) {
      throw new BadRequestException("Failed to create department");
    }

    return created;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findById(id);

    if (dto.name?.trim()) {
      const [existing] = await this.db
        .select()
        .from(departments)
        .where(ilike(departments.name, dto.name.trim()))
        .limit(1);

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Department with name "${dto.name}" already exists`,
        );
      }
    }

    const [updated] = await this.db
      .update(departments)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);

    const [linkedItem] = await this.db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.departmentId, id))
      .limit(1);

    if (linkedItem) {
      throw new BadRequestException(
        "Cannot delete department with associated menu items. Deactivate it instead.",
      );
    }

    await this.db.delete(departments).where(eq(departments.id, id));

    return { message: "Department deleted successfully" };
  }
}
