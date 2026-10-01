import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "./password.util";

describe("PasswordUtil", () => {
  it("should hash a password and verify it correctly", async () => {
    const rawPassword = "SecurePassword123!";
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword("WrongPassword", hashed);
    expect(isWrongMatch).toBe(false);
  });
});
