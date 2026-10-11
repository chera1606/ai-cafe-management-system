import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CategoriesService } from "../services/categories.service";
import { CategoriesController } from "./categories.controller";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let mockService: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
    };

    controller = new CategoriesController(
      mockService as unknown as CategoriesService,
    );
  });

  it("should return all categories", async () => {
    mockService.findAll.mockResolvedValue([{ id: "c1", name: "Beverages" }]);
    const result = await controller.findAll({});
    expect(result).toHaveLength(1);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it("should return single category by id", async () => {
    mockService.findById.mockResolvedValue({ id: "c1", name: "Beverages" });
    const result = await controller.findById("c1");
    expect(result.id).toBe("c1");
  });

  it("should create a category", async () => {
    const dto = { name: "Tea" };
    mockService.create.mockResolvedValue({ id: "c2", ...dto });
    const result = await controller.create(dto);
    expect(result.name).toBe("Tea");
  });

  it("should update a category", async () => {
    const dto = { name: "Specialty Tea" };
    mockService.update.mockResolvedValue({ id: "c2", ...dto });
    const result = await controller.update("c2", dto);
    expect(result?.name).toBe("Specialty Tea");
  });

  it("should update category status", async () => {
    mockService.updateStatus.mockResolvedValue({
      id: "c2",
      status: "inactive",
    });
    const result = await controller.updateStatus("c2", { status: "inactive" });
    expect(result?.status).toBe("inactive");
  });

  it("should delete category", async () => {
    mockService.delete.mockResolvedValue({ message: "deleted" });
    const result = await controller.delete("c2");
    expect(result.message).toBe("deleted");
  });
});
