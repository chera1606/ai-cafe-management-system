"use client";

import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/context/cart-context";
import type { OrderType } from "@/lib/orders-api";

interface CheckoutSummaryProps {
  items: CartItem[];
  orderType: OrderType;
  subtotal: number;
  deliveryFee: number;
  total?: number;
  isSubmitting: boolean;
  onPlaceOrder: () => void;
  submitDisabled?: boolean;
}

export function CheckoutSummary({
  items,
  orderType,
  subtotal,
  deliveryFee,
  total: _total,
  isSubmitting,
  onPlaceOrder,
  submitDisabled = false,
}: CheckoutSummaryProps) {
  // Authoritative delivery calculation: $2.50 for delivery, $0 for pickup/dine-in
  const effectiveDeliveryFee =
    orderType === "DELIVERY" ? deliveryFee || 2.5 : 0;
  const grandTotal = Math.round((subtotal + effectiveDeliveryFee) * 100) / 100;

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <h3 className="font-serif font-bold text-lg text-forest">
          Order Summary
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cream text-stone-600">
          {items.reduce((acc, it) => acc + it.quantity, 0)} items
        </span>
      </div>

      {/* Itemized List */}
      <div className="py-4 space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            {item.image ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream shrink-0 border border-stone-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-meadow-tint text-meadow flex items-center justify-center font-bold text-xs shrink-0">
                {item.quantity}x
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-forest truncate text-sm">
                  {item.name}
                </span>
                <span className="font-mono font-medium text-forest text-sm shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                <span>Qty: {item.quantity}</span>
                {item.selectedModifiers &&
                  item.selectedModifiers.length > 0 && (
                    <span className="truncate text-stone-400">
                      • {item.selectedModifiers.join(", ")}
                    </span>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="pt-4 border-t border-stone-100 space-y-2.5 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span>Fulfilment ({orderType.replace("_", " ").toLowerCase()})</span>
          <span className="font-mono">
            {effectiveDeliveryFee === 0
              ? "Free"
              : `$${effectiveDeliveryFee.toFixed(2)}`}
          </span>
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
          <div>
            <span className="font-serif font-black text-lg text-forest">
              Total
            </span>
            <span className="text-[11px] text-stone-400 block">
              Taxes included where applicable
            </span>
          </div>
          <span className="font-mono text-xl font-bold text-forest">
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Turnaround Notice */}
      <div className="mt-4 p-3 rounded-2xl bg-cream/70 border border-stone-200/60 flex items-center gap-2.5 text-xs text-stone-600">
        <Clock className="w-4 h-4 text-amber shrink-0" />
        <span>Estimated preparation time: 10–20 minutes</span>
      </div>

      {/* Place Order CTA */}
      <div className="mt-5 space-y-2.5">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full justify-center"
          isLoading={isSubmitting}
          disabled={submitDisabled || isSubmitting || items.length === 0}
          onClick={onPlaceOrder}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isSubmitting
            ? "Placing Order..."
            : `Place Order • $${grandTotal.toFixed(2)}`}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-meadow" />
          <span>Duplicate-request protected with verified server pricing</span>
        </div>
      </div>
    </div>
  );
}
