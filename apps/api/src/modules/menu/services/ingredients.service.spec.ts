import type { Database } from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IngredientsService } from "./ingredients.service";

describe("IngredientsService", () => {
  let service: IngredientsService;
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new IngredientsService(mockDb as unknown as Database);
  });

  describe("findAll", () => {
    it("should return ingredients list", async () => {
      const mockList = [
        { id: "i1", name: "Arabica Beans", unitOfMeasure: "g" },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockList),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockList);
    });

    it("should apply status and search filters", async () => {
      const mockList = [
        { id: "i1", name: "Arabica Beans", unitOfMeasure: "g" },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockList),
          }),
        }),
      });

      const result = await service.findAll({
        status: "active",
        search: "Beans",
      });
      expect(result).toEqual(mockList);
    });
  });

  describe("findById", () => {
    it("should return ingredient when found", async () => {
      const mockIng = { id: "i1", name: "Whole Milk", unitOfMeasure: "ml" };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockIng]),
          }),
        }),
      });

      const result = await service.findById("i1");
      expect(result).toEqual(mockIng);
    });

    it("should throw NotFoundException when missing", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.findById("i99")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create ingredient successfully", async () => {
      const dto = { name: "Oat Milk", unitOfMeasure: "ml" };
      const created = { id: "i2", ...dto, status: "active" };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([created]),
        }),
      });

      const result = await service.create(dto);
      expect(result).toEqual(created);
    });

    it("should throw ConflictException on duplicate name", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "i1", name: "Oat Milk" }]),
          }),
        }),
      });

      await expect(
        service.create({ name: "Oat Milk", unitOfMeasure: "ml" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should update ingredient", async () => {
      const existing = { id: "i1", name: "Whole Milk", unitOfMeasure: "ml" };
      const updated = { ...existing, unitOfMeasure: "l" };

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([existing]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updated]),
          }),
        }),
      });

      const result = await service.update("i1", { unitOfMeasure: "l" });
      expect(result.unitOfMeasure).toBe("l");
    });
  });

  describe("delete", () => {
    it("should throw BadRequestException if ingredient is used in recipes", async () => {
      const existing = { id: "i1", name: "Whole Milk", unitOfMeasure: "ml" };

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([existing]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ recipeId: "r1" }]),
            }),
          }),
        });

      await expect(service.delete("i1")).rejects.toThrow(BadRequestException);
    });

    it("should delete ingredient if not used in any recipes", async () => {
      const existing = { id: "i1", name: "Whole Milk", unitOfMeasure: "ml" };

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([existing]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });

      const result = await service.delete("i1");
      expect(result.message).toContain("deleted successfully");
    });
  });
});
