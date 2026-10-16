export const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "TELEBIRR",
  "CBE_BIRR",
  "CHAPA",
  "CREDIT",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "PARTIALLY_PAID",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
