"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/context/cart-context";
import type { FulfilmentType } from "@/data/types";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    tax,
    total,
  } = useCart();
  const router = useRouter();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [fulfilmentMode, setFulfilmentMode] =
    useState<FulfilmentType>("pickup");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    const newOrderId = `SBL-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newOrderId);
    setIsOrderPlaced(true);
    clearCart();
  };

  const handleReset = () => {
    setIsOrderPlaced(false);
    setIsCheckingOut(false);
    setIsCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Order tray and checkout"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full z-10"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-cream">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-meadow-tint text-meadow flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-black text-lg text-forest flex items-center gap-2 leading-none">
                    Your Order Tray
                    {totalItems > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber text-white font-extrabold">
                        {totalItems}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-sage mt-1">
                    Artisanal roastery &amp; kitchen
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-sage hover:text-forest hover:bg-cream-alt transition-colors cursor-pointer"
                aria-label="Close tray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fulfilment Selector (Dine-in / Pickup / Delivery) */}
            <div className="p-3 bg-white border-b border-border">
              <div className="grid grid-cols-3 p-1 bg-cream-alt rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFulfilmentMode("dine-in")}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    fulfilmentMode === "dine-in"
                      ? "bg-meadow text-white shadow-forest"
                      : "text-sage hover:text-forest"
                  }`}
                >
                  Dine-in
                </button>
                <button
                  type="button"
                  onClick={() => setFulfilmentMode("pickup")}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    fulfilmentMode === "pickup"
                      ? "bg-meadow text-white shadow-forest"
                      : "text-sage hover:text-forest"
                  }`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setFulfilmentMode("delivery")}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    fulfilmentMode === "delivery"
                      ? "bg-meadow text-white shadow-forest"
                      : "text-sage hover:text-forest"
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>

            {/* Order Success State */}
            {isOrderPlaced ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-meadow-tint text-meadow flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-meadow">
                    Order Dispatched
                  </span>
                  <h3 className="font-serif text-3xl font-black text-forest">
                    Ameseginalehu!
                  </h3>
                  <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
                    Your order <strong>#{orderId}</strong> has been routed to
                    the kitchen dispatch queue. Real-time telemetry is now
                    active!
                  </p>
                </div>

                <div className="w-full bg-cream p-4 rounded-2xl border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Fulfilment Method:</span>
                    <span className="font-bold uppercase text-meadow-dark">
                      {fulfilmentMode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Estimated Preparation:</span>
                    <span className="font-bold text-forest flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber" /> 12–18 mins
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={handleReset}
                  className="w-full"
                >
                  Continue Browsing
                </Button>
              </div>
            ) : isCheckingOut ? (
              /* Checkout Form View */
              <form
                onSubmit={handlePlaceOrder}
                className="flex-1 flex flex-col justify-between p-6 overflow-y-auto"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-meadow">
                      Confirm Contact &amp; Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="text-xs font-semibold text-sage hover:text-forest cursor-pointer"
                    >
                      Back to Tray
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="cart-customer-name"
                        className="block text-xs font-bold text-forest mb-1"
                      >
                        Your Name
                      </label>
                      <input
                        id="cart-customer-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs text-forest focus:outline-none focus:border-meadow focus:ring-2 focus:ring-meadow-tint"
                      />
                    </div>

                    {fulfilmentMode === "delivery" && (
                      <div>
                        <label
                          htmlFor="cart-delivery-address"
                          className="block text-xs font-bold text-forest mb-1"
                        >
                          Delivery Address
                        </label>
                        <textarea
                          id="cart-delivery-address"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Street, suite, floor or pickup landmark"
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs text-forest focus:outline-none focus:border-meadow focus:ring-2 focus:ring-meadow-tint"
                        />
                      </div>
                    )}

                    {fulfilmentMode === "dine-in" && (
                      <div>
                        <label
                          htmlFor="cart-table-number"
                          className="block text-xs font-bold text-forest mb-1"
                        >
                          Table Number (Optional)
                        </label>
                        <input
                          id="cart-table-number"
                          type="text"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="e.g. Table 7"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs text-forest focus:outline-none focus:border-meadow focus:ring-2 focus:ring-meadow-tint"
                        />
                      </div>
                    )}
                  </div>

                  {/* Subtotal Summary */}
                  <div className="p-4 rounded-2xl bg-cream border border-border space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal ({totalItems} items):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Tax &amp; Service:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    {fulfilmentMode === "delivery" && (
                      <div className="flex justify-between text-stone-600">
                        <span>Delivery Fee:</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-forest pt-2 border-t border-border">
                      <span>Est. Total:</span>
                      <span className="text-meadow-dark font-extrabold">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-sage pt-1">
                      Final total confirmed at payment gateway (SRS BR-001).
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Place Order ({fulfilmentMode})
                  </Button>
                </div>
              </form>
            ) : items.length === 0 ? (
              /* Empty Tray View */
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cream-alt text-sage flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 opacity-40 text-meadow" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-lg text-forest">
                    Your Tray is Empty
                  </h3>
                  <p className="text-xs text-sage max-w-xs leading-relaxed">
                    Explore single-origin Yirgacheffe pour-overs, doro wot, or
                    sizzling skillets.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-border">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex items-center gap-3"
                    >
                      {item.image && (
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-cream-alt shrink-0 border border-border">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-forest truncate">
                          {item.name}
                        </h4>
                        {item.notes && (
                          <p className="text-[11px] text-sage truncate italic">
                            Note: {item.notes}
                          </p>
                        )}
                        <p className="text-xs font-black text-meadow-dark mt-0.5">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrement={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        onDecrement={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                        size="sm"
                      />

                      {/* Delete Item */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-sage hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bottom Tray Footer */}
                <div className="p-5 pb-safe border-t border-border bg-cream space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-sage">
                      <span>Subtotal</span>
                      <span className="font-semibold text-forest">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sage">
                      <span>Est. Tax &amp; Prep</span>
                      <span className="font-semibold text-forest">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-base text-forest pt-2 border-t border-border">
                      <span>Est. Total</span>
                      <span className="text-meadow-dark font-extrabold">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsCartOpen(false);
                        router.push("/checkout");
                      }}
                      className="flex-1"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={clearCart}
                      className="text-xs"
                      title="Clear tray"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
