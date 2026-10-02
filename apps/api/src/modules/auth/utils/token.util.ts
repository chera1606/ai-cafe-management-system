import * as crypto from "node:crypto";
import { UAParser } from "ua-parser-js";

export function generateRandomToken(bytes = 40): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseClientInfo(
  userAgent?: string,
  ip?: string,
): { device: string; ipAddress: string; userAgent: string } {
  const uaString = userAgent || "Unknown Device";
  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  let deviceName = os.name || "Desktop";
  if (device.vendor && device.model) {
    deviceName = `${device.vendor} ${device.model}`;
  } else if (os.name) {
    deviceName = os.name;
  }

  const deviceSummary = browser.name
    ? `${browser.name} on ${deviceName}`
    : deviceName;

  return {
    device: deviceSummary,
    ipAddress: ip || "Unknown IP",
    userAgent: uaString,
  };
}
