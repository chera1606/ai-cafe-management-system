"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KdsStation } from "@/lib/kds-api";
import type { OrderDetailResponse, OrderStatus } from "@/lib/orders-api";
import { cn } from "@/lib/utils";
import { KdsTicketCard } from "./kds-ticket-card";

interface KdsKanbanBoardProps {
  orders: OrderDetailResponse[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>;
  station: KdsStation;
}

export function KdsKanbanBoard({
  orders,
  onUpdateStatus,
  onCancelOrder,
  station,
}: KdsKanbanBoardProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  // Split orders into the 3 active columns + completed
  const { newAndQueued, inPreparation, readyForService, completedOrders } =
    useMemo(() => {
      const newAndQueued: OrderDetailResponse[] = [];
      const inPreparation: OrderDetailResponse[] = [];
      const readyForService: OrderDetailResponse[] = [];
      const completedOrders: OrderDetailResponse[] = [];

      for (const order of orders) {
        if (order.status === "PENDING" || order.status === "CONFIRMED") {
          newAndQueued.push(order);
        } else if (order.status === "PREPARING") {
          inPreparation.push(order);
        } else if (order.status === "READY") {
          readyForService.push(order);
        } else if (order.status === "COMPLETED") {
          completedOrders.push(order);
        }
      }

      return { newAndQueued, inPreparation, readyForService, completedOrders };
    }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      {/* 3-Column Active Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: New & Queued */}
        <div className="flex flex-col rounded-xl border bg-muted/20 overflow-hidden">
          <div className="p-3.5 border-b bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="font-bold text-sm text-foreground uppercase tracking-wide">
                New & Queued
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {newAndQueued.length}
            </span>
          </div>

          <div className="p-3.5 space-y-3.5 min-h-[300px] max-h-[calc(100vh-220px)] overflow-y-auto">
            {newAndQueued.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                <Sparkles className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
                <p className="text-sm font-medium">No incoming orders</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  New orders will sound a chime upon arrival
                </p>
              </div>
            ) : (
              newAndQueued.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onCancelOrder={onCancelOrder}
                  currentStation={station}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="flex flex-col rounded-xl border bg-muted/20 overflow-hidden">
          <div className="p-3.5 border-b bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-sm text-foreground uppercase tracking-wide">
                In Preparation
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              {inPreparation.length}
            </span>
          </div>

          <div className="p-3.5 space-y-3.5 min-h-[300px] max-h-[calc(100vh-220px)] overflow-y-auto">
            {inPreparation.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                <Clock className="w-8 h-8 mb-2 opacity-30 text-blue-500" />
                <p className="text-sm font-medium">No orders in prep</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Click &apos;Start Prep&apos; on queued orders to begin cooking
                </p>
              </div>
            ) : (
              inPreparation.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onCancelOrder={onCancelOrder}
                  currentStation={station}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Service */}
        <div className="flex flex-col rounded-xl border bg-muted/20 overflow-hidden">
          <div className="p-3.5 border-b bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-sm text-foreground uppercase tracking-wide">
                Ready for Service
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {readyForService.length}
            </span>
          </div>

          <div className="p-3.5 space-y-3.5 min-h-[300px] max-h-[calc(100vh-220px)] overflow-y-auto">
            {readyForService.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                <AlertCircle className="w-8 h-8 mb-2 opacity-30 text-emerald-500" />
                <p className="text-sm font-medium">Nothing awaiting pickup</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Ready orders will appear here for staff hand-off
                </p>
              </div>
            ) : (
              readyForService.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onCancelOrder={onCancelOrder}
                  currentStation={station}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completed Orders Recall Tray Toggle */}
      {completedOrders.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold">
                Recently Fulfilled Orders ({completedOrders.length})
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-xs"
            >
              {showCompleted ? "Hide Completed" : "Show Completed Orders"}
            </Button>
          </div>

          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {completedOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onCancelOrder={onCancelOrder}
                  currentStation={station}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
