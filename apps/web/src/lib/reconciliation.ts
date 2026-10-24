/**
 * Inventory stock reconciliation calculations based on SRS BR-009:
 * Closing Stock = Opening Stock + Purchases - Consumption - Waste +/- Adjustments
 */

export interface ReconciliationInputs {
  openingStock: number;
  purchases: number;
  consumption: number;
  waste: number;
  adjustments: number; // Positive (found stock / count surplus) or negative (shrinkage)
}

export interface ReconciliationResult {
  expectedClosingStock: number;
  variance: number; // actualCount - expectedClosingStock
  isBalanced: boolean;
}

export function calculateExpectedClosing(inputs: ReconciliationInputs): number {
  const { openingStock, purchases, consumption, waste, adjustments } = inputs;
  const closing = openingStock + purchases - consumption - waste + adjustments;
  return Math.max(0, Math.round(closing * 100) / 100);
}

export function calculateVariance(
  actualPhysicalCount: number,
  expectedClosingStock: number,
): { variance: number; isBalanced: boolean } {
  const variance = Math.round((actualPhysicalCount - expectedClosingStock) * 100) / 100;
  return {
    variance,
    isBalanced: Math.abs(variance) < 0.001,
  };
}
