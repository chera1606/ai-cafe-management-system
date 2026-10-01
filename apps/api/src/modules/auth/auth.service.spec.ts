import type { Database } from "@cafe/db";
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import * as passwordUtil from "./utils/password.util";

describe("AuthService", () => {
  let service: AuthService;
  let mockDb: { transaction: ReturnType<typeof vi.fn> };
  let mockUsersService: {
    findByEmail: ReturnType<typeof vi.fn>;
    getUserRolesAndPermissions: ReturnType<typeof vi.fn>;
    getUserProfile: ReturnType<typeof vi.fn>;
  };
  let mockJwtService: {
    sign: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      transaction: vi.fn(),
    };
    mockUsersService = {
      findByEmail: vi.fn(),
      getUserRolesAndPermissions: vi.fn(),
      getUserProfile: vi.fn(),
    };
    mockJwtService = {
      sign: vi.fn(),
    };

    service = new AuthService(
      mockDb as unknown as Database,
      mockUsersService as unknown as UsersService,
      mockJwtService as unknown as JwtService,
    );
  });

  describe("register", () => {
    it("should register a new user and customer inside a transaction", async () => {
      const dto = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password123!",
        phone: "+1234567890",
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.getUserRolesAndPermissions.mockResolvedValue({
        roles: ["customer"],
        permissions: ["orders:create"],
      });

      const mockInsertedUser = {
        id: "user-1",
        email: "jane@example.com",
        status: "active",
        createdAt: new Date(),
      };
      const mockInsertedCustomer = {
        id: "cust-1",
        name: "Jane Doe",
        phone: "+1234567890",
        email: "jane@example.com",
        status: "active",
      };

      mockDb.transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockReturnValue({
                returning: vi
                  .fn()
                  .mockResolvedValueOnce([mockInsertedUser])
                  .mockResolvedValueOnce([mockInsertedCustomer]),
              }),
            }),
            select: vi.fn().mockReturnValue({
              from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([{ id: "role-cust-1" }]),
                }),
              }),
            }),
          };
          return cb(mockTx);
        },
      );

      const response = await service.register(dto);

      expect(response.message).toBe("User registered successfully");
      expect(response.user.email).toBe("jane@example.com");
      expect(response.user.customer.name).toBe("Jane Doe");
      expect(response.user.roles).toEqual(["customer"]);
    });

    it("should throw ConflictException when email is already registered", async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: "user-existing" });

      await expect(
        service.register({
          name: "Test",
          email: "existing@example.com",
          password: "Password123!",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should return access token on valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "john@example.com",
        passwordHash: "$2b$10$hashedpass",
        status: "active",
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.getUserRolesAndPermissions.mockResolvedValue({
        roles: ["customer"],
        permissions: [],
      });
      vi.spyOn(passwordUtil, "comparePassword").mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("mock-jwt-token");

      const result = await service.login({
        email: "john@example.com",
        password: "validPassword",
      });

      expect(result.accessToken).toBe("mock-jwt-token");
      expect(result.user.id).toBe("user-1");
    });

    it("should throw UnauthorizedException on invalid email or password", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: "wrong@example.com",
          password: "pass",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when password compare fails", async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: "user-1",
        status: "active",
        passwordHash: "hash",
      });
      vi.spyOn(passwordUtil, "comparePassword").mockResolvedValue(false);

      await expect(
        service.login({
          email: "john@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getProfile", () => {
    it("should return user profile when found", async () => {
      const mockProfile = {
        id: "user-1",
        email: "test@example.com",
        status: "active",
        createdAt: new Date(),
        roles: ["customer"],
        permissions: [],
        customer: null,
        employee: null,
      };

      mockUsersService.getUserProfile.mockResolvedValue(mockProfile);

      const profile = await service.getProfile("user-1");
      expect(profile).toEqual(mockProfile);
    });

    it("should throw NotFoundException when profile is not found", async () => {
      mockUsersService.getUserProfile.mockResolvedValue(null);

      await expect(service.getProfile("user-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
