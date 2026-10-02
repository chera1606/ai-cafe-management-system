import { generateSecret, generateSync } from "otplib";
import { describe, expect, it } from "vitest";
import { TwoFactorService } from "./two-factor.service";

describe("TwoFactorService", () => {
  const service = new TwoFactorService();

  it("should generate secret and valid QR code data url", async () => {
    const { secret, qrCodeUrl } = await service.generateSecret("user@test.com");

    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThan(10);
    expect(qrCodeUrl).toContain("data:image/png;base64,");
  });

  it("should verify valid TOTP token", () => {
    const secret = generateSecret();
    const token = generateSync({ secret });

    const isValid = service.verifyToken(token, secret);
    expect(isValid).toBe(true);

    const isWrongValid = service.verifyToken("000000", secret);
    expect(isWrongValid).toBe(false);
  });

  it("should generate 8 formatted recovery codes and hashes", () => {
    const { rawCodes, hashedCodes } = service.generateRecoveryCodes();

    expect(rawCodes).toHaveLength(8);
    expect(hashedCodes).toHaveLength(8);
    expect(rawCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(hashedCodes[0]).toHaveLength(64);
  });
});
