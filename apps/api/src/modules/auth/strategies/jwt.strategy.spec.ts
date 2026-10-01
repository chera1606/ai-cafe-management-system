import { UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let mockConfigService: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockReturnValue("super-secret-key-12345"),
    };
  });

  it("should validate and return standard jwt payload", async () => {
    const strategy = new JwtStrategy(
      mockConfigService as unknown as ConfigService,
    );
    const payload: JwtPayload = {
      sub: "user-123",
      userId: "user-123",
      email: "user@example.com",
      roles: ["admin"],
      permissions: ["users:read"],
    };

    const result = await strategy.validate(payload);
    expect(result).toEqual({
      sub: "user-123",
      userId: "user-123",
      email: "user@example.com",
      roles: ["admin"],
      permissions: ["users:read"],
    });
  });

  it("should throw error if JWT_SECRET is missing", () => {
    mockConfigService.get.mockReturnValue(undefined);
    expect(
      () => new JwtStrategy(mockConfigService as unknown as ConfigService),
    ).toThrow("JWT_SECRET is not configured");
  });

  it("should throw UnauthorizedException for empty payload", async () => {
    const strategy = new JwtStrategy(
      mockConfigService as unknown as ConfigService,
    );
    await expect(
      strategy.validate(null as unknown as JwtPayload),
    ).rejects.toThrow(UnauthorizedException);
  });
});
