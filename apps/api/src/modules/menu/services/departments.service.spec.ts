import type { Database } from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DepartmentsService } from "./departments.service";

describe("DepartmentsService", () => {
  let service: DepartmentsService;
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

    service = new DepartmentsService(mockDb as unknown as Database);
  });

  describe("findAll", () => {
    it("should return departments list", async () => {
      const mockList = [{ id: "d1", name: "Espresso Bar", status: "active" }];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockList),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockList);
    });

    it("should apply status and search filters", async () => {
      const mockList = [{ id: "d1", name: "Espresso Bar", status: "active" }];

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
    it("should return department when found", async () => {
      const mockDept = { id: "d1", name: "Espresso Bar" };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockDept]),
          }),
        }),
      });

      const result = await service.findById("d1");
      expect(result).toEqual(mockDept);
    });

    it("should throw NotFoundException when missing", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.findById("d99")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create department successfully", async () => {
      const dto = { name: "Bakery" };
      const created = { id: "d2", ...dto };

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
            limit: vi.fn().mockResolvedValue([{ id: "d1", name: "Bakery" }]),
          }),
        }),
      });

      await expect(service.create({ name: "Bakery" })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("update", () => {
    it("should update department", async () => {
      const existing = { id: "d1", name: "Bakery" };
      const updated = { id: "d1", name: "Pastry Kitchen" };

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

      const result = await service.update("d1", { name: "Pastry Kitchen" });
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should throw BadRequestException if department has linked menu items", async () => {
      const existing = { id: "d1", name: "Bakery" };

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

      await expect(service.delete("d1")).rejects.toThrow(BadRequestException);
    });

    it("should delete department if no linked menu items", async () => {
      const existing = { id: "d1", name: "Bakery" };

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

      const result = await service.delete("d1");
      expect(result.message).toContain("deleted successfully");
    });
  });
});
