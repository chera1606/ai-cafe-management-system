import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller";
import type { AuthService } from "./auth.service";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";

describe("AuthController", () => {
  let controller: AuthController;
  let mockAuthService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    authenticateWith2Fa: ReturnType<typeof vi.fn>;
    generate2FaSecret: ReturnType<typeof vi.fn>;
    enable2Fa: ReturnType<typeof vi.fn>;
    disable2Fa: ReturnType<typeof vi.fn>;
    refreshTokens: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    getUserSessions: ReturnType<typeof vi.fn>;
    revokeSession: ReturnType<typeof vi.fn>;
    revokeAllSessions: ReturnType<typeof vi.fn>;
    getProfile: ReturnType<typeof vi.fn>;
    requestMagicLink: ReturnType<typeof vi.fn>;
    verifyMagicLink: ReturnType<typeof vi.fn>;
    forgotPassword: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
    handleOAuthLogin: ReturnType<typeof vi.fn>;
    verifyEmail: ReturnType<typeof vi.fn>;
    changePassword: ReturnType<typeof vi.fn>;
  };
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      authenticateWith2Fa: vi.fn(),
      generate2FaSecret: vi.fn(),
      enable2Fa: vi.fn(),
      disable2Fa: vi.fn(),
      refreshTokens: vi.fn(),
      logout: vi.fn(),
      getUserSessions: vi.fn(),
      revokeSession: vi.fn(),
      revokeAllSessions: vi.fn(),
      getProfile: vi.fn(),
      requestMagicLink: vi.fn(),
      verifyMagicLink: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      handleOAuthLogin: vi.fn(),
      verifyEmail: vi.fn(),
      changePassword: vi.fn(),
    };
    mockRequest = {
      headers: { "user-agent": "Mozilla/5.0 Chrome/128" },
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" } as unknown as Request["socket"],
    };
    controller = new AuthController(mockAuthService as unknown as AuthService);
  });

  it("should handle registration", async () => {
    const dto = {
      name: "Jane",
      email: "jane@example.com",
      password: "Password123!",
    };
    const expected = {
      message: "User registered successfully",
      user: {
        id: "1",
        email: "jane@example.com",
        status: "active",
        createdAt: new Date(),
        roles: [],
        permissions: [],
        customer: {
          id: "c1",
          name: "Jane",
          phone: null,
          email: "jane@example.com",
          status: "active",
        },
      },
    };
    mockAuthService.register.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toBe(expected);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it("should handle login with client connection info", async () => {
    const dto = { email: "jane@example.com", password: "Password123!" };
    const expected = {
      accessToken: "token-123",
      refreshToken: "refresh-123",
      user: {
        id: "1",
        email: "jane@example.com",
        status: "active",
        roles: [],
        permissions: [],
      },
    };
    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto, mockRequest as Request);
    expect(result).toBe(expected);
    expect(mockAuthService.login).toHaveBeenCalledWith(
      dto,
      expect.objectContaining({ ipAddress: "127.0.0.1" }),
    );
  });

  it("should handle 2FA authentication", async () => {
    const dto = { tempToken: "temp-token", code: "123456" };
    const expected = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };
    mockAuthService.authenticateWith2Fa.mockResolvedValue(expected);

    const result = await controller.authenticate2Fa(
      dto,
      mockRequest as Request,
    );
    expect(result).toBe(expected);
    expect(mockAuthService.authenticateWith2Fa).toHaveBeenCalledWith(
      dto,
      expect.any(Object),
    );
  });

  it("should handle 2FA secret generation", async () => {
    const userPayload: JwtPayload = {
      sub: "user-1",
      userId: "user-1",
      email: "jane@example.com",
      roles: [],
      permissions: [],
    };
    const expected = { secret: "BASE32", qrCodeUrl: "data:image/png;base64" };
    mockAuthService.generate2FaSecret.mockResolvedValue(expected);

    const result = await controller.generate2Fa(userPayload);
    expect(result).toBe(expected);
    expect(mockAuthService.generate2FaSecret).toHaveBeenCalledWith("user-1");
  });

  it("should handle refresh tokens", async () => {
    const dto = { refreshToken: "valid-refresh-token" };
    const expected = { accessToken: "new-access", refreshToken: "new-refresh" };
    mockAuthService.refreshTokens.mockResolvedValue(expected);

    const result = await controller.refreshTokens(dto, mockRequest as Request);
    expect(result).toBe(expected);
    expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
      dto,
      expect.any(Object),
    );
  });

  it("should handle session list retrieval", async () => {
    const userPayload: JwtPayload = {
      sub: "user-123",
      userId: "user-123",
      email: "jane@example.com",
      roles: ["customer"],
      permissions: [],
    };
    const mockSessions = [{ id: "session-1", device: "Chrome" }];
    mockAuthService.getUserSessions.mockResolvedValue(mockSessions);

    const result = await controller.getSessions(userPayload);
    expect(result).toBe(mockSessions);
    expect(mockAuthService.getUserSessions).toHaveBeenCalledWith("user-123");
  });

  it("should handle session revocation", async () => {
    const userPayload: JwtPayload = {
      sub: "user-123",
      userId: "user-123",
      email: "jane@example.com",
      roles: [],
      permissions: [],
    };
    mockAuthService.revokeSession.mockResolvedValue({
      message: "Session revoked successfully",
    });

    const result = await controller.revokeSession(userPayload, "session-1");
    expect(result.message).toBe("Session revoked successfully");
    expect(mockAuthService.revokeSession).toHaveBeenCalledWith(
      "user-123",
      "session-1",
    );
  });

  it("should return current user profile", async () => {
    const userPayload: JwtPayload = {
      sub: "user-123",
      userId: "user-123",
      email: "jane@example.com",
      roles: ["customer"],
      permissions: [],
    };
    const mockProfile = {
      id: "user-123",
      email: "jane@example.com",
      status: "active",
      createdAt: new Date(),
      roles: ["customer"],
      permissions: [],
      customer: null,
      employee: null,
    };
    mockAuthService.getProfile.mockResolvedValue(mockProfile);

    const result = await controller.getProfile(userPayload);
    expect(result).toBe(mockProfile);
    expect(mockAuthService.getProfile).toHaveBeenCalledWith("user-123");
  });
});
