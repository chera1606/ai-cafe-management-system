import type { Database } from "@cafe/db";
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditService } from "../audit/audit.service";
import type { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import * as passwordUtil from "./utils/password.util";

describe("AuthService", () => {
  let service: AuthService;
  let mockDb: {
    transaction: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockUsersService: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    getUserRolesAndPermissions: ReturnType<typeof vi.fn>;
    getUserProfile: ReturnType<typeof vi.fn>;
  };
  let mockJwtService: {
    sign: ReturnType<typeof vi.fn>;
  };
  let mockAuditService: {
    record: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      transaction: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
    };
    mockUsersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      getUserRolesAndPermissions: vi.fn(),
      getUserProfile: vi.fn(),
    };
    mockJwtService = {
      sign: vi.fn(),
    };
    mockAuditService = {
      record: vi.fn().mockResolvedValue(null),
    };

    service = new AuthService(
      mockDb as unknown as Database,
      mockUsersService as unknown as UsersService,
      mockJwtService as unknown as JwtService,
      mockAuditService as unknown as AuditService,
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
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "AUTH_USER_REGISTERED" }),
      );
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
    it("should return access token and refresh token on valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "john@example.com",
        passwordHash: "$2b$10$hashedpass",
        status: "active",
        failedLoginAttempts: 0,
        lockedUntil: null,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.getUserRolesAndPermissions.mockResolvedValue({
        roles: ["customer"],
        permissions: [],
      });
      vi.spyOn(passwordUtil, "comparePassword").mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("mock-jwt-token");

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "session-1" }]),
        }),
      });

      const result = await service.login({
        email: "john@example.com",
        password: "validPassword",
      });

      expect(result.accessToken).toBe("mock-jwt-token");
      expect(result.refreshToken).toBeDefined();
      expect(result.sessionId).toBe("session-1");
      expect(result.user.id).toBe("user-1");
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "AUTH_LOGIN_SUCCESS" }),
      );
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

    it("should throw UnauthorizedException and increment failed attempts on password failure", async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: "user-1",
        status: "active",
        passwordHash: "hash",
        failedLoginAttempts: 2,
        lockedUntil: null,
      });
      vi.spyOn(passwordUtil, "comparePassword").mockResolvedValue(false);

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.login({
          email: "john@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "AUTH_LOGIN_FAILED" }),
      );
    });

    it("should lock account after 5 consecutive failed login attempts", async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: "user-1",
        status: "active",
        passwordHash: "hash",
        failedLoginAttempts: 4, // 5th attempt!
        lockedUntil: null,
      });
      vi.spyOn(passwordUtil, "comparePassword").mockResolvedValue(false);

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.login({
          email: "john@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(/locked for 15 minutes/);

      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "AUTH_ACCOUNT_LOCKED" }),
      );
    });

    it("should reject login when account is currently locked", async () => {
      const futureLockDate = new Date(Date.now() + 10 * 60 * 1000); // 10 mins remaining
      mockUsersService.findByEmail.mockResolvedValue({
        id: "user-1",
        status: "active",
        passwordHash: "hash",
        failedLoginAttempts: 5,
        lockedUntil: futureLockDate,
      });

      await expect(
        service.login({
          email: "john@example.com",
          password: "anyPassword",
        }),
      ).rejects.toThrow(/temporarily locked/);
    });
  });

  describe("refreshTokens", () => {
    it("should rotate refresh token and return new tokens", async () => {
      const mockSession = {
        id: "session-old",
        userId: "user-1",
        isRevoked: false,
        replacedBySessionId: null,
        expiresAt: new Date(Date.now() + 100000),
        device: "Chrome on macOS",
        ipAddress: "127.0.0.1",
        userAgent: "Chrome",
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSession]),
          }),
        }),
      });

      mockUsersService.findById.mockResolvedValue({
        id: "user-1",
        status: "active",
      });
      mockUsersService.getUserRolesAndPermissions.mockResolvedValue({
        roles: ["customer"],
        permissions: [],
      });
      mockJwtService.sign.mockReturnValue("new-jwt-token");

      mockDb.transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            insert: vi.fn().mockReturnValue({
              values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: "session-new" }]),
              }),
            }),
            update: vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([]),
              }),
            }),
          };
          return cb(mockTx);
        },
      );

      const result = await service.refreshTokens({
        refreshToken: "valid-old-refresh-token",
      });

      expect(result.accessToken).toBe("new-jwt-token");
      expect(result.refreshToken).toBeDefined();
    });

    it("should detect token reuse and revoke all sessions", async () => {
      const reusedSession = {
        id: "session-old",
        userId: "user-1",
        isRevoked: true, // Already revoked or replaced!
        replacedBySessionId: "session-compromised",
        expiresAt: new Date(Date.now() + 100000),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([reusedSession]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.refreshTokens({ refreshToken: "reused-stolen-token" }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockAuditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: "AUTH_TOKEN_THEFT_DETECTED" }),
      );
    });
  });

  describe("session management", () => {
    it("should return list of active sessions for user", async () => {
      const mockSessions = [
        {
          id: "session-1",
          device: "Safari on iPhone",
          ipAddress: "10.0.0.1",
          userAgent: "Safari",
          createdAt: new Date(),
          lastActiveAt: new Date(),
          expiresAt: new Date(Date.now() + 100000),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockSessions),
          }),
        }),
      });

      const sessions = await service.getUserSessions("user-1", "session-1");
      expect(sessions).toHaveLength(1);
      expect(sessions[0]?.isCurrentSession).toBe(true);
    });

    it("should revoke specific session", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "session-1" }]),
          }),
        }),
      });

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.revokeSession("user-1", "session-1");
      expect(result.message).toBe("Session revoked successfully");
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
