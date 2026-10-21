"use client";

import { AlertCircle, AlertTriangle, DollarSign, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  InventoryItemEntity,
  WasteReason,
} from "@/lib/inventory-api";

interface InventoryWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItemEntity[];
  initialItemId?: string;
  onSuccess: () => void;
  onSubmit: (data: {
    inventoryItemId: string;
    quantity: number;
    reason: WasteReason;
    department?: "BARISTA" | "KITCHEN";
    notes?: string;
  }) => Promise<void>;
}

const WASTE_REASON_OPTIONS: Array<{
  value: WasteReason;
  label: string;
  description: string;
}> = [
  { value: "SPOILED", label: "Spoiled / Sour", description: "Perished or degraded in storage" },
  { value: "EXPIRED", label: "Past Expiration", description: "Breached shelf-life or holding limit" },
  { value: "SPILLAGE", label: "Spillage / Dropped", description: "Physical accidental spill or purge" },
  { value: "PREPARATION_ERROR", label: "Prep / Cook Error", description: "Burnt, mismeasured, or faulty brew" },
  { value: "DAMAGED", label: "Packaging Damaged", description: "Punctured carton or cracked container" },
  { value: "OVERPRODUCTION", label: "Overproduction", description: "Unsold prepared batch surplus" },
  { value: "OTHER", label: "Other Operational Loss", description: "Documented in incident notes" },
];

export function InventoryWasteModal({
  isOpen,
  onClose,
  items,
  initialItemId,
  onSuccess,
  onSubmit,
}: InventoryWasteModalProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialItemId || (items[0]?.id ?? ""),
  );
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<WasteReason>("SPOILED");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedItem = items.find((i) => i.id === selectedId) || items[0];
  const qtyNum = parseFloat(quantity);
  const estimatedCost =
    selectedItem && !isNaN(qtyNum) && qtyNum > 0
      ? Number((qtyNum * selectedItem.unitCost).toFixed(2))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedId) {
      setError("Please select an ingredient.");
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        inventoryItemId: selectedId,
        quantity: qtyNum,
        reason,
        department: selectedItem?.department,
        notes: notes.trim() || undefined,
      });

      setQuantity("");
      setNotes("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to record waste incident. Please try again.",
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
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-forest font-serif">
                Record Inventory Waste
              </h3>
              <p className="text-xs text-sage">
                Categorized loss tracking and cost accounting (FR-WASTE-001 - FR-WASTE-004)
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
              Wasted Ingredient
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-sm font-medium focus:outline-none focus:ring-2 focus:ring-meadow"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentQuantity} {item.unitOfMeasure} on hand) — ${item.unitCost.toFixed(2)}/{item.unitOfMeasure}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Estimated Financial Loss */}
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
                placeholder="0.000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-meadow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
                Estimated Loss (USD)
              </label>
              <div className="px-3.5 py-2.5 rounded-2xl border border-border bg-cream-alt/70 text-rose-700 text-sm font-black flex items-center gap-1">
                <span>${estimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Waste Reason Picker (FR-WASTE-002) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-2">
              Categorized Reason
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WASTE_REASON_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setReason(opt.value)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    reason === opt.value
                      ? "border-rose-400 bg-rose-50/60 ring-1 ring-rose-400 text-rose-950"
                      : "border-border hover:border-border-strong hover:bg-cream text-forest"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-sage">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Context Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">
              Incident Notes & Details
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Broken vacuum seal observed during morning restocking..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-white text-forest text-xs font-medium focus:outline-none focus:ring-2 focus:ring-meadow resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              isLoading={isLoading}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Record Waste Incident
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
