"use client";

import {
  CheckCircle2,
  ChefHat,
  DollarSign,
  Plus,
  Printer,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PosSuccessDialogProps {
  isOpen: boolean;
  orderNumber: string;
  orderId: string;
  totalPaid: number;
  changeDue: number;
  onNewOrder: () => void;
}

export function PosSuccessDialog({
  isOpen,
  orderNumber,
  orderId,
  totalPaid,
  changeDue,
  onNewOrder,
}: PosSuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 text-center space-y-6">
        {/* Animated Success Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-50 dark:border-emerald-900/50">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
            Sale Completed &amp; Dispatched
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 mt-1">
            Order #{orderNumber}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 mt-1">
            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
            <span>Ticket actively queued on Kitchen KDS</span>
          </div>
        </div>

        {/* Change Due Callout if applicable */}
        {changeDue > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Change Due to Customer
            </span>
            <span className="font-mono font-black text-2xl text-amber-700 dark:text-amber-400">
              ${changeDue.toFixed(2)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onNewOrder}
            className="w-full text-xs font-black uppercase tracking-wider gap-2 h-11"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Next Customer Ticket</span>
          </Button>

          <Link
            href={`/orders/${orderId}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full text-xs font-semibold gap-2 h-11 border-stone-200 dark:border-stone-800"
            >
              <Printer className="w-4 h-4" />
              <span>Print Fiscal Receipt</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
