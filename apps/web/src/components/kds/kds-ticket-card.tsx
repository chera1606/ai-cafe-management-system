"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Flame,
  MapPin,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBaristaItem } from "@/lib/kds-api";
import type { OrderDetailResponse, OrderStatus } from "@/lib/orders-api";
import { cn } from "@/lib/utils";
import { KdsSlaTimer } from "./kds-sla-timer";

interface KdsTicketCardProps {
  order: OrderDetailResponse;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>;
  currentStation?: "ALL" | "BARISTA" | "KITCHEN";
}

export function KdsTicketCard({
  order,
  onUpdateStatus,
  onCancelOrder,
  currentStation = "ALL",
}: KdsTicketCardProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCheck = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleNextStatus = async () => {
    let nextStatus: OrderStatus | null = null;
    if (order.status === "PENDING") nextStatus = "CONFIRMED";
    else if (order.status === "CONFIRMED") nextStatus = "PREPARING";
    else if (order.status === "PREPARING") nextStatus = "READY";
    else if (order.status === "READY") nextStatus = "COMPLETED";

    if (!nextStatus) return;

    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Enter reason for kitchen cancellation / 86:") || undefined;
    if (reason === null) return;
    setIsUpdating(true);
    try {
      await onCancelOrder(order.id, reason);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine station styling
  const orderNumber = order.orderNumber || order.orderCode || order.id.slice(0, 8).toUpperCase();
  const isAllChecked =
    order.items.length > 0 && order.items.every((it) => checkedItems[it.id]);

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border bg-card text-card-foreground shadow-sm transition-all overflow-hidden",
        order.status === "PENDING" && "border-amber-500/50 bg-amber-500/[0.02]",
        order.status === "PREPARING" && "border-blue-500/40 shadow-blue-500/5",
        order.status === "READY" && "border-emerald-500/40 bg-emerald-500/[0.02]",
        order.status === "COMPLETED" && "opacity-75 border-border/40",
      )}
    >
      {/* Header Bar */}
      <div className="p-3.5 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-base font-black tracking-tight text-foreground">
            {orderNumber}
          </span>

          {/* Fulfilment Badge */}
          {order.orderType === "DINE_IN" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <UtensilsCrossed className="w-3 h-3" />
              {order.tableNumber ? `Table ${order.tableNumber}` : "Dine In"}
            </span>
          )}
          {order.orderType === "TAKEAWAY" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Takeaway
            </span>
          )}
          {order.orderType === "DELIVERY" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <MapPin className="w-3 h-3" />
              Delivery
            </span>
          )}
        </div>

        {/* SLA Timer */}
        <KdsSlaTimer
          createdAt={order.createdAt}
          completedAt={order.status === "COMPLETED" ? order.updatedAt : null}
          status={order.status}
        />
      </div>

      {/* Customer & Kitchen Note Callout */}
      {(order.customerId || order.notes) && (
        <div className="px-3.5 py-2 bg-muted/10 border-b border-border/40 text-xs">
          {order.notes && (
            <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-start gap-1">
              <span className="uppercase text-[10px] tracking-wider font-bold text-amber-500">
                Note:
              </span>
              <span>{order.notes}</span>
            </p>
          )}
        </div>
      )}

      {/* Item Checklist */}
      <div className="p-3.5 flex-1 divide-y divide-border/30 space-y-1.5">
        {order.items.map((item) => {
          const isDrink = isBaristaItem(item.menuItemId);
          const isStationMatch =
            currentStation === "ALL" ||
            (currentStation === "BARISTA" && isDrink) ||
            (currentStation === "KITCHEN" && !isDrink);

          const isChecked = !!checkedItems[item.id];

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={cn(
                "pt-1.5 first:pt-0 flex items-start justify-between gap-3 cursor-pointer select-none group transition-opacity",
                !isStationMatch && "opacity-40 grayscale",
                isChecked && "opacity-50 line-through",
              )}
            >
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  aria-label={isChecked ? "Mark incomplete" : "Mark prepared"}
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isChecked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40 group-hover:border-primary",
                  )}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                    {isDrink ? (
                      <Coffee className="w-3 h-3 text-amber-600 dark:text-amber-400 opacity-60" />
                    ) : (
                      <Flame className="w-3 h-3 text-orange-600 dark:text-orange-400 opacity-60" />
                    )}
                  </div>

                  {item.specialInstruction && (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                      {item.specialInstruction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer Bar */}
      <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-2">
        {order.status !== "COMPLETED" && order.status !== "CANCELLED" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isUpdating}
            className="text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 px-2"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            86 / Cancel
          </Button>
        ) : (
          <div />
        )}

        {/* Primary Progression Button */}
        {order.status === "PENDING" && (
          <Button
            size="sm"
            onClick={handleNextStatus}
            disabled={isUpdating}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
          >
            Accept Order
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {order.status === "CONFIRMED" && (
          <Button
            size="sm"
            onClick={handleNextStatus}
            disabled={isUpdating}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
          >
            Start Prep
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {order.status === "PREPARING" && (
          <Button
            size="sm"
            onClick={handleNextStatus}
            disabled={isUpdating}
            className={cn(
              "text-xs font-bold transition-all",
              isAllChecked
                ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                : "bg-emerald-600/90 hover:bg-emerald-600 text-white",
            )}
          >
            Mark Ready
            <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        )}

        {order.status === "READY" && (
          <Button
            size="sm"
            onClick={handleNextStatus}
            disabled={isUpdating}
            className="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs border border-border"
          >
            Order Picked Up
            <Check className="w-4 h-4 ml-1" />
          </Button>
        )}

        {order.status === "COMPLETED" && (
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Fulfilled
          </span>
        )}
      </div>
    </div>
  );
}
