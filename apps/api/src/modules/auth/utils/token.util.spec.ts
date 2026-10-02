import { describe, expect, it } from "vitest";
import { generateRandomToken, hashToken, parseClientInfo } from "./token.util";

describe("TokenUtil", () => {
  it("should generate cryptographically random token string", () => {
    const token1 = generateRandomToken();
    const token2 = generateRandomToken();

    expect(token1).toHaveLength(80); // 40 bytes hex = 80 chars
    expect(token2).toHaveLength(80);
    expect(token1).not.toBe(token2);
  });

  it("should generate consistent sha256 hashes", () => {
    const raw = "sample-secret-token";
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    expect(hash1).toHaveLength(64); // sha256 hex = 64 chars
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(raw);
  });

  it("should parse user agent information into readable device label", () => {
    const chromeMacUA =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    const info = parseClientInfo(chromeMacUA, "192.168.1.50");

    expect(info.device).toContain("Chrome");
    expect(info.device).toContain("Mac");
    expect(info.ipAddress).toBe("192.168.1.50");
  });

  it("should fallback gracefully on empty client details", () => {
    const info = parseClientInfo();

    expect(info.device).toBeDefined();
    expect(info.ipAddress).toBe("Unknown IP");
  });
});
