import type { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleStrategy } from "./google.strategy";

describe("GoogleStrategy", () => {
  let mockConfigService: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((_key: string, defaultVal: string) => defaultVal),
    };
  });

  it("should extract and normalize google profile data", async () => {
    const strategy = new GoogleStrategy(
      mockConfigService as unknown as ConfigService,
    );

    const mockProfile = {
      id: "google-12345",
      name: { givenName: "Alice", familyName: "Smith" },
      emails: [{ value: "alice@gmail.com" }],
      photos: [{ value: "https://example.com/avatar.jpg" }],
    };

    const done = vi.fn();
    await strategy.validate(
      "access-token",
      "refresh-token",
      mockProfile as any,
      done,
    );

    expect(done).toHaveBeenCalledWith(null, {
      provider: "google",
      providerUserId: "google-12345",
      email: "alice@gmail.com",
      name: "Alice Smith",
      avatarUrl: "https://example.com/avatar.jpg",
    });
  });
});
