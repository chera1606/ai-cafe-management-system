"use client";

import { AlertCircle, CheckCircle, Scale, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { InventoryItemEntity } from "@/lib/inventory-api";

interface InventoryReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItemEntity | null;
  onSuccess: () => void;
  onReconcile: (id: string, actualCount: number, notes?: string) => Promise<void>;
}

export function InventoryReconcileModal({
  isOpen,
  onClose,
  item,
  onSuccess,
  onReconcile,
}: InventoryReconcileModalProps) {
  const [actualCount, setActualCount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const actualNum = parseFloat(actualCount);
  const hasValidCount = !isNaN(actualNum) && actualNum >= 0;
  const variance = hasValidCount
    ? Number((actualNum - item.currentQuantity).toFixed(3))
    : 0;
  const costImpact = variance * item.unitCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasValidCount) {
      setError("Please enter a valid non-negative physical count.");
      return;
    }

    if (variance === 0) {
      setError("Actual count matches system record. No reconciliation needed.");
      return;
    }

    setIsLoading(true);
    try {
      await onReconcile(
        item.id,
        actualNum,
        notes.trim() || `Physical audit: ${item.currentQuantity} -> ${actualNum} ${item.unitOfMeasure}`,
      );
      setActualCount("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit reconciliation. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-cream/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-meadow-tint text-meadow-dark">
              <Scale className="w-5 h-5 text-meadow" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-forest font-serif">
                Physical Stock Reconciliation
              </h3>
              <p className="text-xs text-sage">{item.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-alt text-sage hover:text-forest transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Current System vs Physical Count */}
          <div className="p-4 rounded-2xl bg-cream-alt/70 border border-border grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage block mb-1">
                System Record
              </span>
              <div className="text-xl font-black text-forest">
                {item.currentQuantity} {item.unitOfMeasure}
              </div>
              <span className="text-[11px] text-sage">Last known quantity</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage block mb-1">
                Variance
              </span>
              <div
                className={`text-xl font-black ${
                  !hasValidCount || variance === 0
                    ? "text-sage"
                    : variance > 0
                      ? "text-meadow-dark"
                      : "text-rose-700"
                }`}
              >
                {hasValidCount ? `${variance > 0 ? "+" : ""}${variance}` : "--"}{" "}
                {item.unitOfMeasure}
              </div>
              <span className="text-[11px] text-sage">
                {hasValidCount && variance !== 0
                  ? `${costImpact >= 0 ? "+" : ""}$${costImpact.toFixed(2)} cost impact`
                  : "Enter count below"}
              </span>
            </div>
          </div>

          {/* Actual Weighed Count Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
              Actual Weighed Count ({item.unitOfMeasure})
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              required
              autoFocus
              placeholder="e.g. 7.500"
              value={actualCount}
              onChange={(e) => setActualCount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-forest text-lg font-black focus:outline-none focus:ring-2 focus:ring-meadow"
            />
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
              Audit Notes
            </label>
            <input
              type="text"
              placeholder="e.g. End of shift scale audit by barista lead"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-xs font-medium focus:outline-none focus:ring-2 focus:ring-meadow"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              disabled={!hasValidCount || variance === 0}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Reconcile Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
