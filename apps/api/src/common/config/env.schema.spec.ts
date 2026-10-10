import { describe, expect, it } from "vitest";
import { validateEnv } from "./env.schema";

describe("validateEnv", () => {
  it("should validate and return default values for valid config", () => {
    const config = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test_db",
      JWT_SECRET: "super-secret-key-12345",
    };

    const validated = validateEnv(config);

    expect(validated.NODE_ENV).toBe("development");
    expect(validated.PORT).toBe(3000);
    expect(validated.DATABASE_URL).toBe(config.DATABASE_URL);
    expect(validated.JWT_SECRET).toBe(config.JWT_SECRET);
    expect(validated.JWT_EXPIRES_IN).toBe("1d");
  });

  it("should allow overriding defaults with valid values", () => {
    const config = {
      NODE_ENV: "production",
      PORT: "8080",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/prod_db",
      JWT_SECRET: "production-secret-key",
      JWT_EXPIRES_IN: "7d",
    };

    const validated = validateEnv(config);

    expect(validated.NODE_ENV).toBe("production");
    expect(validated.PORT).toBe(8080);
    expect(validated.DATABASE_URL).toBe(config.DATABASE_URL);
    expect(validated.JWT_SECRET).toBe("production-secret-key");
    expect(validated.JWT_EXPIRES_IN).toBe("7d");
  });

  it("should throw error if DATABASE_URL is missing", () => {
    const config = {
      JWT_SECRET: "super-secret-key-12345",
    };

    expect(() => validateEnv(config)).toThrow(
      "Invalid environment configuration: [DATABASE_URL]",
    );
  });

  it("should throw error if JWT_SECRET is too short", () => {
    const config = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test_db",
      JWT_SECRET: "short",
    };

    expect(() => validateEnv(config)).toThrow(
      "Invalid environment configuration: [JWT_SECRET]",
    );
  });

  it("should throw error if NODE_ENV is invalid", () => {
    const config = {
      NODE_ENV: "staging",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test_db",
      JWT_SECRET: "super-secret-key-12345",
    };

    expect(() => validateEnv(config)).toThrow(
      "Invalid environment configuration: [NODE_ENV]",
    );
  });

  it("should normalize bare domain in RESEND_FROM_EMAIL to a valid email", () => {
    const config = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test_db",
      JWT_SECRET: "super-secret-key-12345",
      RESEND_FROM_EMAIL: "sablecafe.com",
    };

    const validated = validateEnv(config);
    expect(validated.RESEND_FROM_EMAIL).toBe("noreply@sablecafe.com");
  });

  it("should fallback malformed RESEND_FROM_EMAIL to onboarding@resend.dev safely", () => {
    const config = {
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test_db",
      JWT_SECRET: "super-secret-key-12345",
      RESEND_FROM_EMAIL: "not-an-email",
    };

    const validated = validateEnv(config);
    expect(validated.RESEND_FROM_EMAIL).toBe("onboarding@resend.dev");
  });
});
