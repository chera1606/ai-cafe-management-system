export const CreditAccountStatus = {
  ACTIVE: "ACTIVE",
  FROZEN: "FROZEN",
  CLOSED: "CLOSED",
} as const;

export type CreditAccountStatus =
  (typeof CreditAccountStatus)[keyof typeof CreditAccountStatus];

export const CreditTransactionType = {
  CHARGE: "CHARGE",
  PAYMENT: "PAYMENT",
  ADJUSTMENT: "ADJUSTMENT",
} as const;

export type CreditTransactionType =
  (typeof CreditTransactionType)[keyof typeof CreditTransactionType];
