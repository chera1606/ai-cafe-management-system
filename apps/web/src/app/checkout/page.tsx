"use client";

import { AlertCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import {
  type CustomerFormData,
  CustomerInfoForm,
} from "@/components/checkout/customer-info-form";
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import {
  type CreateOrderPayload,
  MENU_ITEM_UUID_MAP,
  createOrder,
  recordPlacedOrderId,
} from "@/lib/orders-api";
import { type PaymentMethod, initiatePayment } from "@/lib/payments-api";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    clearCart,
    generateCheckoutIdempotencyKey,
  } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<CustomerFormData>({
    orderType: "DINE_IN",
    tableNumber: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    dropoffNotes: "",
    kitchenNotes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentPhone, setPaymentPhone] = useState<string>("");
  const [paymentTxnRef, setPaymentTxnRef] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync authenticated user info if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.customer?.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleFormChange = (updated: Partial<CustomerFormData>) => {
    setErrorMsg(null);
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handlePlaceOrder = async () => {
    setErrorMsg(null);

    // Validation per FR-ORD-001 & FR-ORD-007
    if (items.length === 0) {
      setErrorMsg("Your order tray is empty. Add items before checking out.");
      return;
    }

    if (formData.orderType === "DINE_IN" && !formData.tableNumber.trim()) {
      setErrorMsg(
        "Please specify your table number or booth for dine-in service.",
      );
      return;
    }

    if (formData.orderType === "DELIVERY" && !formData.address.trim()) {
      setErrorMsg("Please provide a complete delivery address.");
      return;
    }

    const effectiveName = isAuthenticated
      ? user?.customer?.name || user?.email
      : formData.name.trim();
    if (!effectiveName) {
      setErrorMsg("Please provide your name for order identification.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateOrderPayload = {
        orderType: formData.orderType,
        tableNumber:
          formData.orderType === "DINE_IN"
            ? formData.tableNumber.trim()
            : undefined,
        notes: formData.kitchenNotes.trim() || undefined,
        specialInstruction: formData.kitchenNotes.trim() || undefined,
        idempotencyKey: generateCheckoutIdempotencyKey(),
        items: items.map((it) => {
          const rawId = it.menuItemId || it.id;
          const resolvedId = MENU_ITEM_UUID_MAP[rawId] || rawId;
          return {
            menuItemId: resolvedId,
            quantity: it.quantity,
            specialInstruction:
              it.specialInstructions || it.notes || undefined,
          };
        }),
        guestCustomer: !isAuthenticated
          ? {
              name: effectiveName,
              email: formData.email.trim() || undefined,
              phone: formData.phone.trim() || undefined,
            }
          : undefined,
        deliveryInfo:
          formData.orderType === "DELIVERY"
            ? {
                address: formData.address.trim(),
                dropoffNotes: formData.dropoffNotes.trim() || undefined,
              }
            : undefined,
      };

      const createdOrder = await createOrder(payload);

      // Persist order ID locally so customer/guest can always recall order history
      recordPlacedOrderId(createdOrder.id);

      // Initiate payment record (FR-PAY-001 through FR-PAY-003)
      try {
        await initiatePayment({
          orderId: createdOrder.id,
          paymentMethod,
          customerPhone: paymentPhone.trim() || formData.phone.trim() || undefined,
          providerReference: paymentTxnRef.trim() || undefined,
          notes: `Fulfilment: ${formData.orderType}. Method: ${paymentMethod}`,
        });
      } catch (payErr) {
        // Non-blocking for order continuation, cashier/station can verify payment
        console.warn("Payment initiation log:", payErr);
      }

      // Successfully placed: clear cart and redirect to live order tracker
      clearCart();
      router.push(`/my-orders/${createdOrder.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(
          "Failed to place order. Please review your details and try again.",
        );
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb / Back button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sage hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Artisan Menu
          </Link>

          <span className="text-xs uppercase font-mono tracking-widest text-stone-400">
            Secure Checkout
          </span>
        </div>

        {items.length === 0 ? (
          /* Empty Order Tray State */
          <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-stone-200 shadow-xs my-8">
            <div className="w-16 h-16 rounded-3xl bg-cream flex items-center justify-center text-sage mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-forest mb-2">
              Your order tray is empty
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              Select your handcrafted coffees, pastries, and culinary plates to
              begin your order.
            </p>
            <Link href="/menu">
              <Button variant="primary" size="lg">
                Explore Artisan Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest">
                Checkout &amp; Service
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Confirm your fulfilment preferences and review your order
                details.
              </p>
            </div>

            {/* Error Notification Banner */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {/* Main Checkout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Customer, Fulfilment Information, and Payment Selector */}
              <div className="lg:col-span-7 space-y-6">
                <CustomerInfoForm
                  data={formData}
                  onChange={handleFormChange}
                  isAuthenticated={isAuthenticated}
                  userName={user?.customer?.name || user?.email}
                  userEmail={user?.email}
                  disabled={isSubmitting}
                />

                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  customerPhone={paymentPhone}
                  onPhoneChange={setPaymentPhone}
                  transactionRef={paymentTxnRef}
                  onTransactionRefChange={setPaymentTxnRef}
                  orderTotal={total}
                />
              </div>

              {/* Right Column: Authoritative Order Summary */}
              <div className="lg:col-span-5">
                <CheckoutSummary
                  items={items}
                  orderType={formData.orderType}
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  total={total}
                  isSubmitting={isSubmitting}
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
