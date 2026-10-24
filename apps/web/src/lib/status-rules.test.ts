import { describe, expect, it } from "vitest";
import {
  canTransitionOrder,
  validateCancellationReason,
  validateCreditAdjustment,
} from "./status-rules";

describe("canTransitionOrder", () => {
  it("allows standard forward pipeline: PENDING -> CONFIRMED", () => {
    expect(canTransitionOrder("PENDING", "CONFIRMED").allowed).toBe(true);
  });

  it("allows kitchen preparation transition: CONFIRMED -> PREPARING", () => {
    expect(canTransitionOrder("CONFIRMED", "PREPARING").allowed).toBe(true);
  });

  it("allows expediting transition: PREPARING -> READY", () => {
    expect(canTransitionOrder("PREPARING", "READY").allowed).toBe(true);
  });

  it("allows completion transition: READY -> COMPLETED", () => {
    expect(canTransitionOrder("READY", "COMPLETED").allowed).toBe(true);
  });

  it("blocks backward or skipping transitions (e.g. PENDING -> COMPLETED directly)", () => {
    const result = canTransitionOrder("PENDING", "COMPLETED");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("forbids any transition once order is COMPLETED", () => {
    const result = canTransitionOrder("COMPLETED", "PREPARING");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("finalized");
  });

  it("forbids reopening CANCELLED orders", () => {
    const result = canTransitionOrder("CANCELLED", "PENDING");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("cannot be reopened");
  });
});

describe("validateCancellationReason", () => {
  it("passes when reason exceeds minimum audit character threshold", () => {
    const result = validateCancellationReason("Customer cancelled due to meeting");
    expect(result.valid).toBe(true);
  });

  it("fails when reason is empty or too short (< 5 chars)", () => {
    expect(validateCancellationReason("").valid).toBe(false);
    expect(validateCancellationReason("test").valid).toBe(false);
    expect(validateCancellationReason(null).valid).toBe(false);
  });
});

describe("validateCreditAdjustment", () => {
  it("passes when adjustment amount is non-zero and has audit justification", () => {
    const result = validateCreditAdjustment(-450, "Approved billing correction from ticket #9812");
    expect(result.valid).toBe(true);
  });

  it("fails when adjustment amount is zero", () => {
    const result = validateCreditAdjustment(0, "Valid audit reason here");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("cannot be zero");
  });

  it("fails when reason is less than 8 characters", () => {
    const result = validateCreditAdjustment(500, "refund");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("at least 8 characters");
  });
});
