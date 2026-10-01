import type { Database } from "@cafe/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let mockDb: { select: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
    };
    service = new UsersService(mockDb as unknown as Database);
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: "active",
      };
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await service.findByEmail("TEST@EXAMPLE.COM ");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user is not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.findByEmail("unknown@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: "active",
      };
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await service.findById("user-123");
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserRolesAndPermissions", () => {
    it("should return roles and permissions for user", async () => {
      const mockUserRoles = [{ roleId: "role-1", roleName: "customer" }];
      const mockPermissions = [{ permissionName: "orders:create" }];

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockUserRoles),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(mockPermissions),
            }),
          }),
        });

      const result = await service.getUserRolesAndPermissions("user-123");
      expect(result).toEqual({
        roles: ["customer"],
        permissions: ["orders:create"],
      });
    });

    it("should return empty permissions if user has no roles", async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.getUserRolesAndPermissions("user-123");
      expect(result).toEqual({
        roles: [],
        permissions: [],
      });
    });
  });

  describe("getUserProfile", () => {
    it("should return aggregated profile for customer user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        status: "active",
        createdAt: new Date("2026-01-01"),
        passwordHash: "hash",
        updatedAt: new Date("2026-01-01"),
      };
      const mockCustomer = {
        id: "cust-123",
        userId: "user-123",
        name: "Test Customer",
        phone: "+1234567890",
        email: "test@example.com",
        status: "active",
      };

      vi.spyOn(service, "findById").mockResolvedValue(mockUser);
      vi.spyOn(service, "getUserRolesAndPermissions").mockResolvedValue({
        roles: ["customer"],
        permissions: ["orders:create"],
      });

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockCustomer]),
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

      const profile = await service.getUserProfile("user-123");
      expect(profile).toEqual({
        id: "user-123",
        email: "test@example.com",
        status: "active",
        createdAt: mockUser.createdAt,
        roles: ["customer"],
        permissions: ["orders:create"],
        customer: {
          id: "cust-123",
          name: "Test Customer",
          phone: "+1234567890",
          email: "test@example.com",
          status: "active",
        },
        employee: null,
      });
    });

    it("should return null if user does not exist", async () => {
      vi.spyOn(service, "findById").mockResolvedValue(null);
      const profile = await service.getUserProfile("non-existent");
      expect(profile).toBeNull();
    });
  });
});
