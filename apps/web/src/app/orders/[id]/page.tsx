"use client";

import {
  AlertCircle,
  ArrowLeft,
  FileText,
  HelpCircle,
  Loader2,
  MapPin,
  RefreshCw,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { Button } from "@/components/ui/button";
import {
  cancelOrder,
  getOrderById,
  type OrderDetailResponse,
} from "@/lib/orders-api";

export default function OrderTrackerPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrder = useCallback(
    async (isManualRefresh = false) => {
      if (!orderId) return;
      if (isManualRefresh) setIsRefreshing(true);

      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        setErrorMsg(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg(
            "Failed to retrieve order details. Please verify your order ID.",
          );
        }
      } finally {
        setIsLoading(false);
        if (isManualRefresh) setIsRefreshing(false);
      }
    },
    [orderId],
  );

  // Initial load
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Polling updates every 8 seconds if order is active
  useEffect(() => {
    if (!order) return;
    if (order.status === "COMPLETED" || order.status === "CANCELLED") return;

    const intervalId = setInterval(() => {
      fetchOrder();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [order, fetchOrder]);

  const handleCancelOrder = async (reason?: string) => {
    if (!orderId) return;
    setIsCancelling(true);
    try {
      const updated = await cancelOrder(orderId, reason);
      setOrder(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sage hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Artisan Menu
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/orders/${orderId}/receipt`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-stone-700 hover:text-forest gap-1.5 text-xs font-semibold"
              >
                <FileText className="w-3.5 h-3.5 text-forest" />
                <span>View Receipt</span>
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fetchOrder(true)}
              disabled={isRefreshing || isLoading}
              className="text-stone-500 hover:text-forest gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-meadow" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-xs">
            <Loader2 className="w-8 h-8 text-meadow animate-spin mx-auto mb-4" />
            <h3 className="font-serif font-bold text-lg text-forest">
              Retrieving Order Status
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Connecting with our roastery &amp; kitchen management system...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && !order && (
          <div className="bg-white rounded-3xl p-12 text-center border border-rose-200 shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-forest mb-2">
              Unable to Find Order
            </h3>
            <p className="text-sm text-stone-600 mb-6">{errorMsg}</p>
            <Link href="/menu">
              <Button variant="primary">Return to Menu</Button>
            </Link>
          </div>
        )}

        {/* Loaded Order View */}
        {!isLoading && order && (
          <div className="space-y-6">
            {/* Timeline Stepper Component */}
            <OrderStatusTimeline
              order={order}
              onCancelOrder={handleCancelOrder}
              isCancelling={isCancelling}
            />

            {/* Two-Column Details Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Itemized Receipt */}
              <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
                  <ShoppingBag className="w-4 h-4 text-meadow" />
                  <h3 className="font-serif font-bold text-base text-forest">
                    Itemized Order Details
                  </h3>
                </div>

                <div className="py-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between text-sm py-2 border-b border-stone-50 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-meadow text-xs px-2 py-0.5 rounded-md bg-meadow-tint shrink-0">
                          {item.quantity}x
                        </span>
                        <div>
                          <div className="font-semibold text-forest">
                            {item.name}
                          </div>
                          {item.specialInstruction && (
                            <div className="text-xs text-stone-500 italic mt-0.5">
                              Note: {item.specialInstruction}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-medium text-forest text-sm">
                        ${Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">
                      ${Number(order.subtotal).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-mono">
                      {Number(order.deliveryFee) === 0
                        ? "Free"
                        : `$${Number(order.deliveryFee).toFixed(2)}`}
                    </span>
                  </div>

                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-meadow-dark">
                      <span>Discount</span>
                      <span className="font-mono">
                        -${Number(order.discountAmount).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-stone-100 flex justify-between font-serif font-bold text-lg text-forest">
                    <span>Total Paid</span>
                    <span className="font-mono text-xl">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Official Receipt Action Banner (FR-PAY-006) */}
                <div className="mt-6 p-4 rounded-2xl bg-cream/70 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-forest">
                        Electronic Fiscal Receipt
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Itemized breakdown with 15% VAT &amp; verification QR code
                      </div>
                    </div>
                  </div>
                  <Link href={`/orders/${orderId}/receipt`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold shrink-0">
                      View Receipt
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Fulfilment Details & Support */}
              <div className="md:col-span-5 space-y-6">
                {/* Fulfilment Destination Card */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-4">
                    {order.orderType === "DINE_IN" ? (
                      <UtensilsCrossed className="w-4 h-4 text-meadow" />
                    ) : order.orderType === "DELIVERY" ? (
                      <MapPin className="w-4 h-4 text-meadow" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-meadow" />
                    )}
                    <h3 className="font-serif font-bold text-base text-forest">
                      Fulfilment Details
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-stone-400 uppercase font-mono">
                        Method
                      </div>
                      <div className="font-semibold text-forest mt-0.5">
                        {order.orderType.replace("_", " ")}
                      </div>
                    </div>

                    {order.tableNumber && (
                      <div>
                        <div className="text-xs text-stone-400 uppercase font-mono">
                          Table Location
                        </div>
                        <div className="font-semibold text-forest mt-0.5">
                          {order.tableNumber}
                        </div>
                      </div>
                    )}

                    {order.delivery && (
                      <div>
                        <div className="text-xs text-stone-400 uppercase font-mono">
                          Drop-off Address
                        </div>
                        <div className="font-semibold text-forest mt-0.5">
                          {order.delivery.address}
                        </div>
                        {order.delivery.providerReference && (
                          <div className="text-xs text-stone-500 mt-1 italic">
                            Notes: {order.delivery.providerReference}
                          </div>
                        )}
                      </div>
                    )}

                    {order.notes && (
                      <div>
                        <div className="text-xs text-stone-400 uppercase font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3 text-stone-400" />
                          Kitchen Instructions
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5 italic bg-cream/70 p-2.5 rounded-xl border border-stone-200/50">
                          &ldquo;{order.notes}&rdquo;
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-amber" />
                    <h4 className="font-serif font-bold text-sm text-forest">
                      Need assistance with your order?
                    </h4>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed mb-3">
                    If you require changes to your preparation or order notes,
                    please inform our counter staff or reach us directly.
                  </p>
                  <div className="text-xs font-mono font-medium text-stone-600">
                    Order Reference: #{order.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
