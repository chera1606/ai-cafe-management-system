import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller";
import type { AuthService } from "./auth.service";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";

describe("AuthController", () => {
  let controller: AuthController;
  let mockAuthService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    getProfile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      getProfile: vi.fn(),
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

  it("should handle login", async () => {
    const dto = { email: "jane@example.com", password: "Password123!" };
    const expected = {
      accessToken: "token-123",
      user: {
        id: "1",
        email: "jane@example.com",
        status: "active",
        roles: [],
        permissions: [],
      },
    };
    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);
    expect(result).toBe(expected);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
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
