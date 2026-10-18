"use client";

import { useState } from "react";
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  PhoneCall,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/payments-api";
import { cn } from "@/lib/utils";

interface PosTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmTender: (
    method: PaymentMethod,
    tenderedAmount: number,
    providerRef?: string,
  ) => Promise<void>;
  isSubmitting: boolean;
}

const TENDER_METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "CASH", label: "Cash Tender", icon: Banknote },
  { id: "TELEBIRR", label: "Telebirr", icon: Smartphone },
  { id: "CBE_BIRR", label: "CBE Birr", icon: PhoneCall },
  { id: "CARD", label: "Card Terminal", icon: CreditCard },
  { id: "CREDIT", label: "House Credit", icon: Building2 },
];

export function PosTenderModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmTender,
  isSubmitting,
}: PosTenderModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CASH");
  const [tenderedStr, setTenderedStr] = useState<string>(totalAmount.toFixed(2));
  const [providerRef, setProviderRef] = useState<string>("");

  if (!isOpen) return null;

  const tenderedAmount = parseFloat(tenderedStr) || 0;
  const changeDue = Math.max(0, Number((tenderedAmount - totalAmount).toFixed(2)));
  const isSufficient = selectedMethod !== "CASH" || tenderedAmount >= totalAmount;

  const handleQuickCash = (amount: number) => {
    setTenderedStr(amount.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!isSufficient) return;
    await onConfirmTender(
      selectedMethod,
      selectedMethod === "CASH" ? tenderedAmount : totalAmount,
      providerRef.trim() || undefined,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div>
            <h2 className="font-serif font-black text-xl text-stone-900 dark:text-stone-100">
              Payment Settlement
            </h2>
            <p className="text-xs text-stone-500">
              Select tender channel and collect payment to fire order
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Total Amount Due Callout */}
          <div className="p-4 rounded-2xl bg-forest/5 dark:bg-emerald-950/20 border border-forest/15 dark:border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              Total Balance Due
            </span>
            <span className="font-mono font-black text-3xl text-forest dark:text-emerald-400">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Tender Method Selection Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TENDER_METHODS.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMethod === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(m.id);
                    if (m.id !== "CASH") setTenderedStr(totalAmount.toFixed(2));
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-semibold cursor-pointer gap-1.5",
                    isSelected
                      ? "bg-forest dark:bg-emerald-600 text-white border-transparent shadow-sm ring-2 ring-forest/20"
                      : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] text-center leading-tight">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cash Specific Tender Controls */}
          {selectedMethod === "CASH" && (
            <div className="space-y-4 pt-1">
              {/* Quick Cash Increment Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCash(totalAmount)}
                  className="text-xs font-bold font-mono h-9 px-3 bg-stone-50 dark:bg-stone-800"
                >
                  Exact (${totalAmount.toFixed(2)})
                </Button>
                {[5, 10, 20, 50, 100].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCash(amt)}
                    className="text-xs font-bold font-mono h-9 px-3 bg-stone-50 dark:bg-stone-800"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>

              {/* Tender Amount Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cash-tendered-input"
                    className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1"
                  >
                    Cash Received
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono font-bold">
                      $
                    </span>
                    <input
                      id="cash-tendered-input"
                      type="number"
                      step="0.01"
                      value={tenderedStr}
                      onChange={(e) => setTenderedStr(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl font-mono font-black text-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Change Due
                  </div>
                  <div className="h-11 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between font-mono font-black text-xl text-emerald-700 dark:text-emerald-400">
                    <span>${changeDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reference input for Telebirr / CBE / Card */}
          {selectedMethod !== "CASH" && (
            <div className="space-y-1 pt-1">
              <label
                htmlFor="pos-provider-ref-input"
                className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider"
              >
                Transaction Reference / Confirmation Code
              </label>
              <input
                id="pos-provider-ref-input"
                type="text"
                placeholder={
                  selectedMethod === "TELEBIRR"
                    ? "e.g. TXN-TB-98214"
                    : selectedMethod === "CBE_BIRR"
                      ? "e.g. CBE-FT-7182"
                      : "Optional terminal reference ID"
                }
                value={providerRef}
                onChange={(e) => setProviderRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl font-mono text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-forest"
              />
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Back to Ticket
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !isSufficient}
            className="font-bold text-xs uppercase tracking-wider gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <span>Dispatching...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale &amp; Fire to KDS</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
