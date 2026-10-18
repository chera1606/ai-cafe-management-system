"use client";

import { useState } from "react";
import {
  CreditCard,
  Edit2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderType } from "@/lib/orders-api";
import { cn } from "@/lib/utils";

export interface PosLineItem {
  id: string; // unique ticket line id
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstruction?: string;
}

interface PosTicketProps {
  items: PosLineItem[];
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  tableNumber: string;
  onTableNumberChange: (table: string) => void;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onUpdateNote: (lineId: string, note: string) => void;
  onRemoveItem: (lineId: string) => void;
  onOpenTender: () => void;
}

const QUICK_TABLES = ["1", "2", "3", "4", "5", "6", "8", "10", "12", "15"];

export function PosTicket({
  items,
  orderType,
  onOrderTypeChange,
  tableNumber,
  onTableNumberChange,
  customerName,
  onCustomerNameChange,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem,
  onOpenTender,
}: PosTicketProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const subtotal = items.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0,
  );
  const vatAmount = Number((subtotal * 0.15).toFixed(2));
  const total = Number((subtotal + vatAmount).toFixed(2));

  const startEditNote = (item: PosLineItem) => {
    setEditingNoteId(item.id);
    setNoteDraft(item.specialInstruction || "");
  };

  const saveEditNote = (lineId: string) => {
    onUpdateNote(lineId, noteDraft.trim());
    setEditingNoteId(null);
    setNoteDraft("");
  };

  return (
    <div className="w-full lg:w-[420px] xl:w-[460px] bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col h-full shrink-0 shadow-lg select-none">
      {/* Ticket Header & Destination Controls */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-3 bg-stone-50/50 dark:bg-stone-900/50">
        {/* Fulfilment Toggle: Dine In vs Takeaway */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-200/60 dark:bg-stone-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => onOrderTypeChange("DINE_IN")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer",
              orderType === "DINE_IN"
                ? "bg-white dark:bg-stone-700 text-forest dark:text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200",
            )}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dine In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOrderTypeChange("TAKEAWAY");
              onTableNumberChange("");
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer",
              orderType === "TAKEAWAY"
                ? "bg-white dark:bg-stone-700 text-forest dark:text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200",
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
        </div>

        {/* Dine In Table Selector */}
        {orderType === "DINE_IN" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              <span>Select Table</span>
              {tableNumber && (
                <span className="text-forest dark:text-emerald-400 font-mono">
                  Table {tableNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
              {QUICK_TABLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTableNumberChange(t)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer",
                    tableNumber === t
                      ? "bg-forest dark:bg-emerald-600 text-white border-transparent shadow-xs"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guest Name input */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Guest name (optional, defaults to Walk-in)"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-forest"
          />
        </div>
      </div>

      {/* Ticket Line Items (Scrollable) */}
      <div className="flex-1 p-4 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-2 p-6">
            <ShoppingBag className="w-10 h-10 opacity-30 text-stone-500" />
            <p className="text-sm font-bold text-stone-600 dark:text-stone-400">
              Ticket is empty
            </p>
            <p className="text-xs text-stone-400 max-w-[200px]">
              Tap items on the left catalog grid to add to current order
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                    {item.name}
                  </div>
                  <div className="font-mono text-xs text-stone-500">
                    ${item.unitPrice.toFixed(2)} each
                  </div>
                </div>

                <div className="font-mono font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 shrink-0">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </div>
              </div>

              {/* Special Instruction / Customization line */}
              {editingNoteId === item.id ? (
                <div className="flex items-center gap-1 pt-1">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="e.g. Oat milk, Extra hot"
                    className="flex-1 text-xs px-2 py-1 rounded bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveEditNote(item.id)}
                    className="h-7 px-2 text-[11px]"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => startEditNote(item)}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>
                      {item.specialInstruction
                        ? `Note: ${item.specialInstruction}`
                        : "+ Add instruction"}
                    </span>
                  </button>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100 w-5 text-center">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="w-6 h-6 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 flex items-center justify-center ml-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ticket Footer: Financial Breakdown & Tender Button */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70 space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-stone-600 dark:text-stone-400">
            <span>VAT (15%)</span>
            <span className="font-mono">${vatAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-serif font-black text-lg text-stone-900 dark:text-stone-100 pt-1.5 border-t border-stone-200 dark:border-stone-800">
            <span>Total Due</span>
            <span className="font-mono text-xl text-forest dark:text-emerald-400">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Primary Tender Button */}
        <Button
          variant="primary"
          size="lg"
          disabled={items.length === 0}
          onClick={onOpenTender}
          className="w-full h-12 text-sm font-black uppercase tracking-wider gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <CreditCard className="w-4 h-4" />
          <span>Charge &amp; Tender (${total.toFixed(2)})</span>
        </Button>
      </div>
    </div>
  );
}
