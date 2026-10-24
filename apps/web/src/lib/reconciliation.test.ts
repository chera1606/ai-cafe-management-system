import { describe, expect, it } from "vitest";
import { calculateExpectedClosing, calculateVariance } from "./reconciliation";

describe("calculateExpectedClosing", () => {
  it("calculates exact closing balance: Opening + Purchases - Consumption - Waste + Adjustments", () => {
    // 100 + 40 - 30 - 5 + 0 = 105
    const closing = calculateExpectedClosing({
      openingStock: 100,
      purchases: 40,
      consumption: 30,
      waste: 5,
      adjustments: 0,
    });
    expect(closing).toBe(105);
  });

  it("handles negative adjustments (shrinkage) correctly", () => {
    // 100 + 50 - 60 - 5 - 3 = 82
    const closing = calculateExpectedClosing({
      openingStock: 100,
      purchases: 50,
      consumption: 60,
      waste: 5,
      adjustments: -3,
    });
    expect(closing).toBe(82);
  });

  it("handles positive adjustments (surplus count) correctly", () => {
    // 50 + 20 - 15 - 0 + 5 = 60
    const closing = calculateExpectedClosing({
      openingStock: 50,
      purchases: 20,
      consumption: 15,
      waste: 0,
      adjustments: 5,
    });
    expect(closing).toBe(60);
  });

  it("clamps negative closing balance to 0", () => {
    const closing = calculateExpectedClosing({
      openingStock: 10,
      purchases: 0,
      consumption: 50,
      waste: 10,
      adjustments: 0,
    });
    expect(closing).toBe(0);
  });
});

describe("calculateVariance", () => {
  it("returns zero variance and isBalanced true when physical count matches expected closing", () => {
    const result = calculateVariance(105, 105);
    expect(result.variance).toBe(0);
    expect(result.isBalanced).toBe(true);
  });

  it("detects shrinkage deficit variance and isBalanced false", () => {
    const result = calculateVariance(98, 105); // -7 units missing
    expect(result.variance).toBe(-7);
    expect(result.isBalanced).toBe(false);
  });

  it("detects surplus count variance and isBalanced false", () => {
    const result = calculateVariance(110, 105); // +5 units found
    expect(result.variance).toBe(5);
    expect(result.isBalanced).toBe(false);
  });
});
