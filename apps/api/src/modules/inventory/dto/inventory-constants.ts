export const MOVEMENT_TYPES = [
  "PURCHASE",
  "CONSUMPTION",
  "WASTE",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
  "TRANSFER",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const INVENTORY_STATUSES = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
] as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[number];

export const INVENTORY_DEPARTMENTS = ["BARISTA", "KITCHEN", "ALL"] as const;

export type InventoryDepartment = (typeof INVENTORY_DEPARTMENTS)[number];
