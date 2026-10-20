"use client";

import { AlertCircle, Calendar, Hash, PackageCheck, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { InventoryItemEntity, MovementType } from "@/lib/inventory-api";

interface InventoryAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItemEntity[];
  initialItemId?: string;
  onSuccess: () => void;
  onSubmit: (data: {
    inventoryItemId: string;
    movementType: MovementType;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    batchReference?: string;
    expirationDate?: string;
    notes?: string;
  }) => Promise<void>;
}

export function InventoryAdjustModal({
  isOpen,
  onClose,
  items,
  initialItemId,
  onSuccess,
  onSubmit,
}: InventoryAdjustModalProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialItemId || (items[0]?.id ?? ""),
  );
  const [movementType, setMovementType] = useState<MovementType>("PURCHASE");
  const [quantity, setQuantity] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [batchRef, setBatchRef] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedItem = items.find((i) => i.id === selectedId) || items[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }

    if (!selectedId) {
      setError("Please select an ingredient.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        inventoryItemId: selectedId,
        movementType,
        quantity: qty,
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        batchReference: batchRef.trim() || undefined,
        expirationDate: expirationDate || undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setQuantity("");
      setNotes("");
      setBatchRef("");
      setExpirationDate("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to record movement. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-cream/50">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-forest font-serif">
              Record Stock Movement
            </h3>
            <p className="text-xs text-sage mt-0.5">
              Log inventory intake deliveries, waste, or physical count audits
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-alt text-sage hover:text-forest transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Movement Type Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-2">
              Movement Reason
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "PURCHASE", label: "Supplier Intake (In)", desc: "Delivery / Restock" },
                { type: "WASTE", label: "Waste / Spoilage (Out)", desc: "Spill / Purge / Expiry" },
                { type: "CONSUMPTION", label: "Prep Usage (Out)", desc: "Kitchen Batch Usage" },
                { type: "ADJUSTMENT_IN", label: "Manual Count (+)", desc: "Physical Audit Surplus" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setMovementType(opt.type as MovementType)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    movementType === opt.type
                      ? "border-meadow bg-meadow-tint/40 ring-1 ring-meadow"
                      : "border-border hover:border-border-strong hover:bg-cream"
                  }`}
                >
                  <div className="text-xs font-bold text-forest">{opt.label}</div>
                  <div className="text-[11px] text-sage">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
              Ingredient Item
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-meadow"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentQuantity} {item.unitOfMeasure} available) — {item.department}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
                Quantity {selectedItem ? `(${selectedItem.unitOfMeasure})` : ""}
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-meadow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
                Unit Cost (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={selectedItem ? `$${selectedItem.unitCost.toFixed(2)}` : "$0.00"}
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-meadow"
              />
            </div>
          </div>

          {/* Batch Reference & Expiration Date (Shown especially on Purchases) */}
          {(movementType === "PURCHASE" || movementType === "ADJUSTMENT_IN") && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-sage" />
                  Batch / Lot Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-2026-X1"
                  value={batchRef}
                  onChange={(e) => setBatchRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-border bg-white text-forest text-xs font-medium focus:outline-none focus:ring-2 focus:ring-meadow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sage" />
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-border bg-white text-forest text-xs font-medium focus:outline-none focus:ring-2 focus:ring-meadow"
                />
              </div>
            </div>
          )}

          {/* Notes / Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
              Movement Remarks & Context
            </label>
            <textarea
              rows={2}
              placeholder={
                movementType === "WASTE"
                  ? "Describe waste reason (e.g. curdled milk batch, dropped bag)..."
                  : "Optional vendor invoice number or delivery note..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-xs font-medium focus:outline-none focus:ring-2 focus:ring-meadow resize-none"
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
              leftIcon={<PackageCheck className="w-4 h-4" />}
            >
              Confirm Movement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
