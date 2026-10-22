export const SUPPLIER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const PURCHASE_STATUSES = [
  "ORDERED",
  "RECEIVED",
  "CANCELLED",
] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];
