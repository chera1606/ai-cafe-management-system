"use client";

import { AlertCircle, Boxes, CheckCircle2, Truck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import {
  type PurchaseEntity,
  receivePurchaseOrder,
} from "@/lib/procurement-api";

interface ReceivePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: PurchaseEntity | null;
  onSuccess: () => void;
}

export function ReceivePoModal({
  isOpen,
  onClose,
  purchase,
  onSuccess,
}: ReceivePoModalProps) {
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split("T")[0] || "",
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !purchase) return null;

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await receivePurchaseOrder(purchase.id, {
        receivedDate: receivedDate || undefined,
        notes: notes.trim() || undefined,
      });

      showToast(
        "success",
        "Shipment Received & Restocked",
        `Order ${purchase.purchaseReference} received. Physical inventory updated automatically.`,
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to receive shipment";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber/20 text-amber-alt">
              <Truck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-950">
                Receive Inbound Shipment
              </h3>
              <p className="text-xs text-amber-800">
                Order {purchase.purchaseReference} • {purchase.supplierName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-amber-800 hover:text-amber-950 hover:bg-amber-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Items Summary */}
        <form onSubmit={handleReceive} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Automated Inventory Restock Banner */}
          <div className="p-4 rounded-2xl bg-meadow-tint/70 border border-meadow/20 text-xs text-meadow-dark flex items-start gap-2.5">
            <Boxes className="w-4 h-4 text-meadow shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                Automatic Physical Stock Synchronization
              </span>
              <span>
                Confirming receipt will automatically log a PURCHASE stock movement
                in the inventory engine and replenish stock levels for all {purchase.items.length} items.
              </span>
            </div>
          </div>

          {/* Items to Restock Preview */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage block mb-1.5">
              Items Being Received
            </span>
            <div className="rounded-2xl border border-border bg-cream/20 p-2.5 space-y-1.5 max-h-40 overflow-y-auto">
              {purchase.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-border/60"
                >
                  <span className="font-semibold text-forest">
                    {item.ingredientName || "Ingredient SKU"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-meadow-dark">
                      +{item.quantity} {item.unitOfMeasure || "units"}
                    </span>
                    <span className="text-[11px] text-sage">
                      (${item.totalCost.toFixed(2)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-bold text-forest block mb-1">
                Receipt Verification Date
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1">
                Quality Inspection & Delivery Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Moisture verified at 10.8%, bags intact and clean, batch accepted."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs font-bold text-forest">
              Total Order Value: ${purchase.totalCost.toFixed(2)}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                {isSubmitting ? "Restocking..." : "Confirm & Restock"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
