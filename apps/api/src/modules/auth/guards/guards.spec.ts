import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionsGuard } from "./permissions.guard";
import { RolesGuard } from "./roles.guard";

describe("Auth Guards", () => {
  let mockReflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let mockExecutionContext: {
    getHandler: ReturnType<typeof vi.fn>;
    getClass: ReturnType<typeof vi.fn>;
    switchToHttp: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: vi.fn(),
    };
    mockExecutionContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn(),
      }),
    };
  });

  describe("JwtAuthGuard", () => {
    it("should allow public routes without authentication", () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      const guard = new JwtAuthGuard(mockReflector as unknown as Reflector);

      const canActivate = guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );
      expect(canActivate).toBe(true);
    });
  });

  describe("RolesGuard", () => {
    let guard: RolesGuard;

    beforeEach(() => {
      guard = new RolesGuard(mockReflector as unknown as Reflector);
    });

    it("should allow access if no roles are required", () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).toBe(true);
    });

    it("should allow access if user has required role", () => {
      mockReflector.getAllAndOverride.mockReturnValue(["admin", "manager"]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { roles: ["manager"] },
      });

      expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).toBe(true);
    });

    it("should throw ForbiddenException if user lacks required role", () => {
      mockReflector.getAllAndOverride.mockReturnValue(["admin"]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { roles: ["customer"] },
      });

      expect(() =>
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).toThrow(ForbiddenException);
    });
  });

  describe("PermissionsGuard", () => {
    let guard: PermissionsGuard;

    beforeEach(() => {
      guard = new PermissionsGuard(mockReflector as unknown as Reflector);
    });

    it("should allow access if no permissions are required", () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).toBe(true);
    });

    it("should allow access if user has all required permissions", () => {
      mockReflector.getAllAndOverride.mockReturnValue([
        "menu:read",
        "menu:write",
      ]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { permissions: ["menu:read", "menu:write", "orders:read"] },
      });

      expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).toBe(true);
    });

    it("should throw ForbiddenException if user misses any required permission", () => {
      mockReflector.getAllAndOverride.mockReturnValue([
        "menu:read",
        "menu:write",
      ]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { permissions: ["menu:read"] },
      });

      expect(() =>
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).toThrow(ForbiddenException);
    });
  });
});
