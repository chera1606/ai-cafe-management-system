import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MenuItemsService } from "../services/menu-items.service";
import { MenuItemsController } from "./menu-items.controller";

describe("MenuItemsController", () => {
  let controller: MenuItemsController;
  let mockService: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateAvailability: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    setRecipe: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateAvailability: vi.fn(),
      delete: vi.fn(),
      setRecipe: vi.fn(),
    };

    controller = new MenuItemsController(
      mockService as unknown as MenuItemsService,
    );
  });

  it("should return all items", async () => {
    mockService.findAll.mockResolvedValue([{ id: "m1", name: "Latte" }]);
    const result = await controller.findAll({});
    expect(result).toHaveLength(1);
  });

  it("should return item by id", async () => {
    mockService.findById.mockResolvedValue({ id: "m1", name: "Latte" });
    const result = await controller.findById("m1");
    expect(result.id).toBe("m1");
  });

  it("should create menu item", async () => {
    const dto = {
      name: "Latte",
      categoryId: "c1",
      departmentId: "d1",
      price: "4.50",
    };
    mockService.create.mockResolvedValue({ id: "m1", ...dto });
    const result = await controller.create(dto);
    expect(result.name).toBe("Latte");
  });

  it("should update menu item", async () => {
    const dto = { name: "Iced Latte" };
    mockService.update.mockResolvedValue({ id: "m1", ...dto });
    const result = await controller.update("m1", dto);
    expect(result.name).toBe("Iced Latte");
  });

  it("should update availability", async () => {
    mockService.updateAvailability.mockResolvedValue({
      id: "m1",
      availabilityStatus: "UNAVAILABLE",
    });
    const result = await controller.updateAvailability("m1", {
      availabilityStatus: "UNAVAILABLE",
    });
    expect(result.availabilityStatus).toBe("UNAVAILABLE");
  });

  it("should delete item", async () => {
    mockService.delete.mockResolvedValue({ message: "deleted" });
    const result = await controller.delete("m1");
    expect(result.message).toBe("deleted");
  });

  it("should set recipe via PUT and POST", async () => {
    const recipeDto = {
      ingredients: [
        { ingredientId: "i1", quantity: "18.000", unitOfMeasure: "g" },
      ],
    };
    mockService.setRecipe.mockResolvedValue({ id: "r1", version: 1 });

    const resultPut = await controller.setRecipe("m1", recipeDto);
    expect(resultPut.version).toBe(1);

    const resultPost = await controller.setRecipePost("m1", recipeDto);
    expect(resultPost.version).toBe(1);
  });
});
