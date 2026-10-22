"use client";

import { AlertCircle, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import type { InventoryItemEntity } from "@/lib/inventory-api";
import {
  type SupplierEntity,
  createPurchaseOrder,
} from "@/lib/procurement-api";

interface LineItemFormState {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
  batchReference?: string;
  expirationDate?: string;
}

interface CreatePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierEntity[];
  inventoryItems: InventoryItemEntity[];
  preselectedSupplierId?: string;
  onSuccess: () => void;
}

export function CreatePoModal({
  isOpen,
  onClose,
  suppliers,
  inventoryItems,
  preselectedSupplierId,
  onSuccess,
}: CreatePoModalProps) {
  const [supplierId, setSupplierId] = useState("");
  const [purchaseReference, setPurchaseReference] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItemFormState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize modal state when opened
  useEffect(() => {
    if (isOpen) {
      const activeSuppliers = suppliers.filter((s) => s.status === "ACTIVE");
      const defaultSupplier = preselectedSupplierId
        ? suppliers.find((s) => s.id === preselectedSupplierId)
        : activeSuppliers[0];

      setSupplierId(defaultSupplier ? defaultSupplier.id : suppliers[0]?.id || "");
      setPurchaseReference(
        `PO-${Math.floor(100000 + Math.random() * 900000)}`,
      );
      setPurchaseDate(new Date().toISOString().split("T")[0] || "");
      setNotes("");
      setErrorMessage(null);

      // Default line item if items exist
      if (inventoryItems.length > 0) {
        const firstItem = inventoryItems[0]!;
        setItems([
          {
            inventoryItemId: firstItem.id,
            quantity: 20,
            unitCost: firstItem.unitCost || 5.0,
            batchReference: `BATCH-${Date.now().toString().slice(-4)}`,
            expirationDate: new Date(Date.now() + 180 * 86400000)
              .toISOString()
              .split("T")[0],
          },
        ]);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, preselectedSupplierId, suppliers, inventoryItems]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (inventoryItems.length === 0) return;
    const defaultItem = inventoryItems[0]!;
    setItems((prev) => [
      ...prev,
      {
        inventoryItemId: defaultItem.id,
        quantity: 10,
        unitCost: defaultItem.unitCost || 5.0,
        batchReference: `BATCH-${Date.now().toString().slice(-4)}`,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItemFormState,
    value: string | number,
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      if (field === "inventoryItemId") {
        const selectedInventory = inventoryItems.find((inv) => inv.id === value);
        item.inventoryItemId = String(value);
        if (selectedInventory) {
          item.unitCost = selectedInventory.unitCost;
        }
      } else if (field === "quantity" || field === "unitCost") {
        item[field] = Number(value) || 0;
      } else if (field === "batchReference" || field === "expirationDate") {
        item[field] = String(value);
      }
      return updated;
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!supplierId) {
      setErrorMessage("Please select a sourcing partner / supplier.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Please add at least one line item to the purchase order.");
      return;
    }

    for (const item of items) {
      if (!item.inventoryItemId) {
        setErrorMessage("All line items must select an ingredient.");
        return;
      }
      if (item.quantity <= 0) {
        setErrorMessage("Item quantities must be greater than zero.");
        return;
      }
      if (item.unitCost < 0) {
        setErrorMessage("Unit costs cannot be negative.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createPurchaseOrder({
        supplierId,
        purchaseReference: purchaseReference.trim() || undefined,
        purchaseDate: purchaseDate || undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          batchReference: item.batchReference || undefined,
          expirationDate: item.expirationDate || undefined,
        })),
      });

      showToast(
        "success",
        "Purchase Order Created",
        `Order ${purchaseReference} logged successfully in INBOUND status.`,
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create purchase order";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-3xl my-8 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-cream/30">
          <div>
            <h3 className="text-lg font-black text-forest">
              Create Purchase Order
            </h3>
            <p className="text-xs text-sage">
              Procure direct-trade ingredients and log inbound shipments
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-sage hover:text-forest hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Supplier & Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-forest block mb-1.5">
                Supplier / Cooperative *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1.5">
                PO Reference Number
              </label>
              <input
                type="text"
                value={purchaseReference}
                onChange={(e) => setPurchaseReference(e.target.value)}
                placeholder="e.g. PO-YIRG-2026-009"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1.5">
                Order Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-forest block">
                Ordered Items & Formulations *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Add Item
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-cream/20 p-3 space-y-3 max-h-60 overflow-y-auto">
              {items.map((item, idx) => {
                const selectedInv = inventoryItems.find(
                  (inv) => inv.id === item.inventoryItemId,
                );
                const subtotal = item.quantity * item.unitCost;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-border shadow-xs grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end"
                  >
                    {/* Item selection */}
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-sage uppercase block mb-1">
                        Ingredient
                      </label>
                      <select
                        value={item.inventoryItemId}
                        onChange={(e) =>
                          handleItemChange(idx, "inventoryItemId", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-white text-forest focus:outline-none focus:border-meadow"
                      >
                        {inventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} ({inv.unitOfMeasure})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-sage uppercase block mb-1">
                        Quantity ({selectedInv?.unitOfMeasure || "units"})
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-white text-forest focus:outline-none focus:border-meadow"
                      />
                    </div>

                    {/* Unit Cost */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-sage uppercase block mb-1">
                        Unit Cost ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) =>
                          handleItemChange(idx, "unitCost", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-white text-forest focus:outline-none focus:border-meadow"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-bold text-sage uppercase block mb-1">
                        Subtotal
                      </label>
                      <div className="py-1.5 px-2 text-xs font-black text-forest">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-sage hover:text-rose-600 disabled:opacity-30 disabled:hover:text-sage transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-forest block mb-1.5">
              Order Notes & Handling Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Direct delivery to Addis roastery green storage. Moisture check required upon intake."
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow"
            />
          </div>

          {/* Footer & Order Total */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sage block">
                Estimated Order Total
              </span>
              <span className="text-2xl font-black text-forest">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>

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
              >
                {isSubmitting ? "Submitting..." : "Generate Purchase Order"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
