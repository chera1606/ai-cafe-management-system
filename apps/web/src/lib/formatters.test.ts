import { describe, expect, it } from "vitest";
import { formatDuration, formatETB, formatNumber, formatPercentage } from "./formatters";

describe("formatETB", () => {
  it("formats positive numbers with ETB currency symbol and two decimals", () => {
    const formatted = formatETB(1250);
    expect(formatted).toContain("ETB");
    expect(formatted).toContain("1,250.00");
  });

  it("handles decimal fractional amounts accurately", () => {
    const formatted = formatETB(99.5);
    expect(formatted).toContain("99.50");
  });

  it("returns ETB 0.00 for null, undefined, or NaN", () => {
    expect(formatETB(null)).toBe("ETB 0.00");
    expect(formatETB(undefined)).toBe("ETB 0.00");
    expect(formatETB(Number.NaN)).toBe("ETB 0.00");
  });

  it("formats zero amount accurately", () => {
    expect(formatETB(0)).toContain("ETB");
    expect(formatETB(0)).toContain("0.00");
  });
});

describe("formatNumber", () => {
  it("formats integer thousands with commas", () => {
    expect(formatNumber(1500000)).toBe("1,500,000");
  });

  it("handles empty or invalid values safely", () => {
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
  });
});

describe("formatPercentage", () => {
  it("adds + prefix for positive growth percentages", () => {
    expect(formatPercentage(14.8)).toBe("+14.8%");
  });

  it("formats negative shrinkage percentages", () => {
    expect(formatPercentage(-3.2)).toBe("-3.2%");
  });
});

describe("formatDuration", () => {
  it("formats seconds into mm:ss format", () => {
    expect(formatDuration(95)).toBe("1:35");
    expect(formatDuration(600)).toBe("10:00");
    expect(formatDuration(5)).toBe("0:05");
  });
});
