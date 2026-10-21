export const WASTE_REASONS = [
  "EXPIRED",
  "SPOILED",
  "DAMAGED",
  "SPILLAGE",
  "PREPARATION_ERROR",
  "OVERPRODUCTION",
  "OTHER",
] as const;

export type WasteReason = (typeof WASTE_REASONS)[number];
