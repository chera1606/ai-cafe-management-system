import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DepartmentsService } from "../services/departments.service";
import { DepartmentsController } from "./departments.controller";

describe("DepartmentsController", () => {
  let controller: DepartmentsController;
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

    controller = new DepartmentsController(
      mockService as unknown as DepartmentsService,
    );
  });

  it("should return departments", async () => {
    mockService.findAll.mockResolvedValue([{ id: "d1", name: "Bar" }]);
    const result = await controller.findAll({});
    expect(result).toHaveLength(1);
  });

  it("should return department by id", async () => {
    mockService.findById.mockResolvedValue({ id: "d1", name: "Bar" });
    const result = await controller.findById("d1");
    expect(result.id).toBe("d1");
  });

  it("should create department", async () => {
    const dto = { name: "Bar" };
    mockService.create.mockResolvedValue({ id: "d1", ...dto });
    const result = await controller.create(dto);
    expect(result.name).toBe("Bar");
  });

  it("should update department", async () => {
    const dto = { name: "Barista Bar" };
    mockService.update.mockResolvedValue({ id: "d1", ...dto });
    const result = await controller.update("d1", dto);
    expect(result?.name).toBe("Barista Bar");
  });

  it("should delete department", async () => {
    mockService.delete.mockResolvedValue({ message: "deleted" });
    const result = await controller.delete("d1");
    expect(result.message).toBe("deleted");
  });
});
