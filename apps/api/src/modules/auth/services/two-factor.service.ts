import * as crypto from "node:crypto";
import { Injectable } from "@nestjs/common";
import { generateSecret, generateURI, verifySync } from "otplib";
import * as qrcode from "qrcode";
import { hashToken } from "../utils/token.util";

@Injectable()
export class TwoFactorService {
  async generateSecret(
    userEmail: string,
  ): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      secret,
      label: userEmail,
      issuer: "AI Cafe System",
    });
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    return { secret, qrCodeUrl };
  }

  verifyToken(code: string, secret: string): boolean {
    try {
      const trimmed = code.trim();
      if (!/^\d{6}$/.test(trimmed)) {
        return false;
      }
      const result = verifySync({ token: trimmed, secret });
      return Boolean(result.valid);
    } catch {
      return false;
    }
  }

  generateRecoveryCodes(count = 8): {
    rawCodes: string[];
    hashedCodes: string[];
  } {
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const codePart1 = crypto.randomBytes(2).toString("hex").toUpperCase();
      const codePart2 = crypto.randomBytes(2).toString("hex").toUpperCase();
      const formattedCode = `${codePart1}-${codePart2}`;

      rawCodes.push(formattedCode);
      hashedCodes.push(hashToken(formattedCode));
    }

    return { rawCodes, hashedCodes };
  }
}
