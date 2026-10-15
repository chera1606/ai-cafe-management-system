"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Clock,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OrderDetailResponse, OrderStatus } from "@/lib/orders-api";

interface OrderStatusTimelineProps {
  order: OrderDetailResponse;
  onCancelOrder: (reason?: string) => Promise<void>;
  isCancelling: boolean;
}

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  {
    status: "PENDING",
    label: "Order Placed",
    description: "Sent to baristas & kitchen",
  },
  {
    status: "CONFIRMED",
    label: "Confirmed",
    description: "Ticket accepted by floor team",
  },
  {
    status: "PREPARING",
    label: "Brewing & Cooking",
    description: "Crafting your order with care",
  },
  {
    status: "READY",
    label: "Ready for You",
    description: "Prepared and waiting for table or pickup",
  },
  {
    status: "COMPLETED",
    label: "Fulfilled",
    description: "Delivered & completed",
  },
];

export function OrderStatusTimeline({
  order,
  onCancelOrder,
  isCancelling,
}: OrderStatusTimelineProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const isCancelled = order.status === "CANCELLED";
  const canCancel =
    (order.status === "PENDING" || order.status === "CONFIRMED") &&
    !isCancelled;

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);

  const handleConfirmCancel = async () => {
    await onCancelOrder(cancelReason.trim() || undefined);
    setShowCancelConfirm(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-black text-2xl text-forest">
              Order{" "}
              {order.orderCode || `#ORD-${order.id.slice(0, 8).toUpperCase()}`}
            </h2>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                isCancelled
                  ? "bg-rose-100 text-rose-700"
                  : order.status === "COMPLETED"
                    ? "bg-meadow-tint text-meadow-dark"
                    : "bg-amber/15 text-amber-alt"
              }`}
            >
              {order.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Fulfilment:{" "}
            <span className="font-semibold text-forest">
              {order.orderType.replace("_", " ")}
            </span>
            {order.tableNumber && ` • Table ${order.tableNumber}`}
            {order.createdAt &&
              ` • Placed at ${new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>

        {/* Cancellation Button */}
        {canCancel && !showCancelConfirm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCancelConfirm(true)}
            className="text-stone-600 hover:text-rose-600 hover:border-rose-300 self-start sm:self-auto"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Cancellation Prompt Modal / Card */}
      {showCancelConfirm && (
        <div className="my-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-stone-700 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-forest">
                Confirm Order Cancellation
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Are you sure you wish to cancel this order? Preparation has not
                yet begun.
              </p>
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Optional reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl text-forest placeholder:text-stone-400 focus:outline-hidden focus:border-rose-400"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCancelling}
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Cancelled State Banner */}
      {isCancelled && (
        <div className="my-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-rose-900">
              Order Cancelled
            </div>
            <div className="text-xs text-rose-700 mt-0.5">
              {order.cancellationReason
                ? `Reason: ${order.cancellationReason}`
                : "This order was cancelled prior to preparation."}
            </div>
          </div>
        </div>
      )}

      {/* Status Progress Stepper */}
      {!isCancelled && (
        <div className="py-8">
          <div className="relative">
            {/* Background connection bar */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
            <div
              className="hidden md:block absolute top-1/2 left-0 h-1 bg-meadow -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100)}%`,
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
              {STEPS.map((step, idx) => {
                const isPassed = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;

                const getIcon = () => {
                  if (step.status === "PENDING") return Clock;
                  if (step.status === "CONFIRMED") return CheckCircle2;
                  if (step.status === "PREPARING") return ChefHat;
                  if (step.status === "READY")
                    return order.orderType === "DELIVERY" ? Truck : Sparkles;
                  return CheckCircle2;
                };

                const StepIcon = getIcon();

                return (
                  <div
                    key={step.status}
                    className="flex md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-3"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                        isPassed
                          ? "bg-meadow text-white border-meadow shadow-xs"
                          : isCurrent
                            ? "bg-forest text-white border-forest ring-4 ring-forest/10 shadow-md scale-105"
                            : "bg-white text-stone-400 border-stone-200"
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div
                        className={`text-sm font-bold leading-tight ${
                          isCurrent
                            ? "text-forest"
                            : isPassed
                              ? "text-meadow-dark"
                              : "text-stone-400"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 leading-snug">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Estimated ETA Banner */}
      {!isCancelled && order.status !== "COMPLETED" && (
        <div className="mt-4 p-4 rounded-2xl bg-cream border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber" />
            <div>
              <div className="text-xs text-stone-500">
                Estimated turnaround time
              </div>
              <div className="text-sm font-bold text-forest">
                {order.orderType === "DELIVERY"
                  ? "25–35 minutes for drop-off"
                  : "10–15 minutes fresh from the roastery & kitchen"}
              </div>
            </div>
          </div>

          <span className="text-xs font-mono font-medium text-stone-400">
            Live tracker
          </span>
        </div>
      )}
    </div>
  );
}
