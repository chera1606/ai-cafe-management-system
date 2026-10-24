/**
 * State transition rules and business logic validations.
 * Per SRS BR-004: Payment status and Order status are managed separately.
 * Per SRS BR-009: Corrections happen via adjustments with mandatory audit reasons.
 */

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";

export type KdsColumn = "NEW" | "ACCEPTED" | "PREPARING" | "READY";

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERING", "COMPLETED"],
  DELIVERING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionOrder(
  current: OrderStatus,
  target: OrderStatus,
): { allowed: boolean; reason?: string } {
  if (current === target) {
    return { allowed: true };
  }
  if (current === "COMPLETED") {
    return {
      allowed: false,
      reason: "Completed orders are finalized and cannot transition.",
    };
  }
  if (current === "CANCELLED") {
    return {
      allowed: false,
      reason: "Cancelled orders cannot be reopened.",
    };
  }
  const allowedNext = ALLOWED_ORDER_TRANSITIONS[current] || [];
  if (!allowedNext.includes(target)) {
    return {
      allowed: false,
      reason: `Cannot move directly from ${current} to ${target}.`,
    };
  }
  return { allowed: true };
}

export function validateCancellationReason(reason: string | null | undefined): {
  valid: boolean;
  message?: string;
} {
  if (!reason || reason.trim().length < 5) {
    return {
      valid: false,
      message: "A cancellation reason of at least 5 characters is required for auditing.",
    };
  }
  return { valid: true };
}

export function validateCreditAdjustment(
  amount: number,
  reason: string,
): { valid: boolean; message?: string } {
  if (amount === 0 || Number.isNaN(amount)) {
    return { valid: false, message: "Adjustment amount cannot be zero." };
  }
  if (!reason || reason.trim().length < 8) {
    return {
      valid: false,
      message: "A detailed reason (at least 8 characters) is required for financial auditing.",
    };
  }
  return { valid: true };
}
