import type { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailService } from "./email.service";

const mockResendSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(() => {
    mockResendSend.mockReset();

    const mockConfigService = {
      get: vi.fn((_key: string, def: string) => def),
    } as unknown as ConfigService;

    service = new EmailService(mockConfigService);
  });

  it("should send a password reset email", async () => {
    mockResendSend.mockResolvedValue({ id: "email-1" });
    await expect(
      service.sendPasswordResetEmail("user@example.com", "tok123"),
    ).resolves.not.toThrow();
    expect(mockResendSend).toHaveBeenCalledOnce();
  });

  it("should send a magic link email", async () => {
    mockResendSend.mockResolvedValue({ id: "email-2" });
    await expect(
      service.sendMagicLinkEmail("user@example.com", "tok456"),
    ).resolves.not.toThrow();
    expect(mockResendSend).toHaveBeenCalledOnce();
  });

  it("should send a welcome verification email", async () => {
    mockResendSend.mockResolvedValue({ id: "email-3" });
    await expect(
      service.sendWelcomeVerificationEmail("user@example.com", "tok789"),
    ).resolves.not.toThrow();
    expect(mockResendSend).toHaveBeenCalledOnce();
  });

  it("should not throw when Resend API call fails", async () => {
    mockResendSend.mockRejectedValue(new Error("Resend API error"));
    await expect(
      service.sendPasswordResetEmail("user@example.com", "tok000"),
    ).resolves.not.toThrow();
  });
});
