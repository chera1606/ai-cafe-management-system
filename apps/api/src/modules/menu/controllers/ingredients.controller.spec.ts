import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IngredientsService } from "../services/ingredients.service";
import { IngredientsController } from "./ingredients.controller";

describe("IngredientsController", () => {
  let controller: IngredientsController;
  let mockService: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    controller = new IngredientsController(
      mockService as unknown as IngredientsService,
    );
  });

  it("should return ingredients", async () => {
    mockService.findAll.mockResolvedValue([
      { id: "i1", name: "Arabica Beans" },
    ]);
    const result = await controller.findAll({});
    expect(result).toHaveLength(1);
  });

  it("should return ingredient by id", async () => {
    mockService.findById.mockResolvedValue({ id: "i1", name: "Arabica Beans" });
    const result = await controller.findById("i1");
    expect(result.id).toBe("i1");
  });

  it("should create ingredient", async () => {
    const dto = { name: "Vanilla Syrup", unitOfMeasure: "ml" };
    mockService.create.mockResolvedValue({ id: "i2", ...dto });
    const result = await controller.create(dto);
    expect(result.name).toBe("Vanilla Syrup");
  });

  it("should update ingredient", async () => {
    const dto = { name: "Madagascar Vanilla Syrup" };
    mockService.update.mockResolvedValue({ id: "i2", ...dto });
    const result = await controller.update("i2", dto);
    expect(result.name).toBe("Madagascar Vanilla Syrup");
  });

  it("should delete ingredient", async () => {
    mockService.delete.mockResolvedValue({ message: "deleted" });
    const result = await controller.delete("i2");
    expect(result.message).toBe("deleted");
  });
});
