import type { Database } from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoriesService } from "./categories.service";

describe("CategoriesService", () => {
  let service: CategoriesService;
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

    service = new CategoriesService(mockDb as unknown as Database);
  });

  describe("findAll", () => {
    it("should return categories list without filters", async () => {
      const mockList = [
        { id: "c1", name: "All-Day Breakfast", status: "active" },
        { id: "c2", name: "Signature Espresso", status: "active" },
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
        { id: "c2", name: "Signature Espresso", status: "active" },
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
        search: "Espresso",
      });
      expect(result).toEqual(mockList);
    });
  });

  describe("findById", () => {
    it("should return category when found", async () => {
      const mockCat = {
        id: "c1",
        name: "Signature Espresso",
        status: "active",
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCat]),
          }),
        }),
      });

      const result = await service.findById("c1");
      expect(result).toEqual(mockCat);
    });

    it("should throw NotFoundException when category is missing", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.findById("c99")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create category when name is unique", async () => {
      const dto = {
        name: "Iced Tea",
        description: "Freshly brewed",
        status: "active",
      };
      const created = { id: "c3", ...dto };

      // Duplicate check: not found
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

    it("should throw ConflictException when category name exists", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([{ id: "c1", name: "Signature Espresso" }]),
          }),
        }),
      });

      await expect(
        service.create({ name: "Signature Espresso" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should update category successfully", async () => {
      const existing = {
        id: "c1",
        name: "Signature Espresso",
        status: "active",
      };
      const updated = { ...existing, name: "Specialty Espresso" };

      // findById check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existing]),
          }),
        }),
      });

      // Name conflict check: not found
      mockDb.select.mockReturnValueOnce({
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

      const result = await service.update("c1", { name: "Specialty Espresso" });
      expect(result).toEqual(updated);
    });
  });

  describe("updateStatus", () => {
    it("should update category status", async () => {
      const existing = {
        id: "c1",
        name: "Signature Espresso",
        status: "active",
      };
      const updated = { ...existing, status: "inactive" };

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existing]),
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

      const result = await service.updateStatus("c1", "inactive");
      expect(result?.status).toBe("inactive");
    });
  });

  describe("delete", () => {
    it("should throw BadRequestException if category has linked menu items", async () => {
      const existing = {
        id: "c1",
        name: "Signature Espresso",
        status: "active",
      };

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
              limit: vi.fn().mockResolvedValue([{ id: "item-1" }]),
            }),
          }),
        });

      await expect(service.delete("c1")).rejects.toThrow(BadRequestException);
    });

    it("should delete category if no linked menu items", async () => {
      const existing = {
        id: "c1",
        name: "Signature Espresso",
        status: "active",
      };

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

      const result = await service.delete("c1");
      expect(result.message).toContain("deleted successfully");
    });
  });
});
