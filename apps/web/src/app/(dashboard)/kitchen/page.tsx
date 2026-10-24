"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatElapsedMinutes } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import { type Order } from "@/services/mock-data";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Coffee,
  Flame,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStation, setActiveStation] = useState<"ALL" | "HOT_KITCHEN" | "ESPRESSO_BAR" | "BAKERY">("ALL");
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reportModalItem, setReportModalItem] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await dashboardService.getOrders();
      // Filter orders relevant to kitchen
      setOrders(
        data.filter((o) => ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.orderStatus))
      );
    } catch (e) {
      toast.error("Failed to refresh KDS queue");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  // Columns
  const newOrders = orders.filter((o) => o.orderStatus === "PENDING");
  const acceptedOrders = orders.filter((o) => o.orderStatus === "CONFIRMED");
  const preparingOrders = orders.filter((o) => o.orderStatus === "PREPARING");
  const readyOrders = orders.filter((o) => o.orderStatus === "READY");

  // Move forward in status pipeline
  const advanceOrder = async (orderId: string, nextStatus: Order["orderStatus"]) => {
    try {
      const updated = await dashboardService.updateOrderStatus(orderId, nextStatus, "Kitchen Expediter");
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(`Ticket ${updated.orderNumber} moved to ${nextStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to advance order");
    }
  };

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const renderOrderCard = (order: Order, nextStatus?: Order["orderStatus"], nextLabel?: string) => {
    const elapsed = formatElapsedMinutes(order.createdAt);
    const isUrgent = elapsed.minutes >= 15;
    const isWarning = elapsed.minutes >= 8 && !isUrgent;

    return (
      <div
        key={order.id}
        className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all bg-white dark:bg-[#1b2820] ${
          isUrgent
            ? "border-rose-400 ring-2 ring-rose-400/20"
            : isWarning
            ? "border-amber-400"
            : "border-border dark:border-[#283a2d]"
        }`}
      >
        {/* Card Header */}
        <div className="space-y-2 pb-3 border-b border-border/80 dark:border-[#283a2d]">
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-sm text-forest dark:text-white">
              {order.orderNumber}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                isUrgent
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse"
                  : isWarning
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsed.formatted}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-forest dark:text-stone-200">
              {order.tableNumber ? `Table ${order.tableNumber}` : order.fulfillmentType}
            </span>
            <span className="text-[11px] text-sage">{order.customerName}</span>
          </div>
        </div>

        {/* Line Items with special instructions */}
        <div className="py-3 flex-1 space-y-2">
          {order.lineItems.map((li) => (
            <div key={li.id} className="text-xs">
              <div className="flex items-baseline justify-between font-bold text-forest dark:text-white">
                <span className="flex-1">
                  <span className="text-meadow-dark dark:text-emerald-400 font-black mr-1.5 tabular-nums">
                    {li.quantity}x
                  </span>
                  {li.name}
                </span>
              </div>
              {li.notes && (
                <div className="mt-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber/30 text-amber-900 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber shrink-0" />
                  <span>{li.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card Footer Bump Button */}
        {nextStatus && (
          <div className="pt-3 border-t border-border/80 dark:border-[#283a2d]">
            <button
              type="button"
              onClick={() => advanceOrder(order.id, nextStatus)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-forest dark:bg-meadow text-white dark:text-forest hover:bg-forest-2 dark:hover:bg-meadow-alt transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-meadow dark:text-forest" />
              <span>{nextLabel || `Mark ${nextStatus}`}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top KDS Controls & Workload Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black font-display text-forest dark:text-white tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <span className="w-2 h-2 rounded-full bg-meadow animate-ping" />
            </div>
            <p className="text-xs text-sage dark:text-stone-400">
              Touch-friendly expedited ticketing. Live SLA escalation active.
            </p>
          </div>
        </div>

        {/* Station Tabs & Utility Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Workload counters */}
          <div className="flex items-center gap-2 text-xs font-bold mr-2">
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              Active: {orders.length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              In Prep: {preparingOrders.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            title={isSoundMuted ? "Sound alerts muted" : "Sound alerts active"}
            className="p-2 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] text-forest dark:text-stone-300 hover:bg-stone-100"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-meadow" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen KDS"}
            className="p-2 rounded-xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] text-forest dark:text-stone-300 hover:bg-stone-100"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4 Kanban Columns: New -> Accepted -> Preparing -> Ready */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Column 1: New (Pending) */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#141f18] border border-border dark:border-[#283a2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-white">
                New Tickets
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1b2820] text-xs font-bold tabular-nums">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {newOrders.map((o) => renderOrderCard(o, "CONFIRMED", "Accept Ticket"))}
            {newOrders.length === 0 && (
              <div className="py-12 border-2 border-dashed border-border dark:border-[#283a2d] rounded-2xl text-center text-xs text-sage">
                No new pending tickets.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Accepted (Confirmed) */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#141f18] border border-border dark:border-[#283a2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-white">
                Accepted
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1b2820] text-xs font-bold tabular-nums">
              {acceptedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {acceptedOrders.map((o) => renderOrderCard(o, "PREPARING", "Start Preparing"))}
            {acceptedOrders.length === 0 && (
              <div className="py-12 border-2 border-dashed border-border dark:border-[#283a2d] rounded-2xl text-center text-xs text-sage">
                Queue is clear.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Preparing */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#141f18] border border-border dark:border-[#283a2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-white">
                In Preparation
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1b2820] text-xs font-bold tabular-nums">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.map((o) => renderOrderCard(o, "READY", "Mark Ready"))}
            {preparingOrders.length === 0 && (
              <div className="py-12 border-2 border-dashed border-border dark:border-[#283a2d] rounded-2xl text-center text-xs text-sage">
                No orders currently in prep.
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Ready */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#141f18] border border-border dark:border-[#283a2d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-meadow" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-white">
                Ready for Service
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1b2820] text-xs font-bold tabular-nums">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyOrders.map((o) => renderOrderCard(o, "COMPLETED", "Complete Hand-off"))}
            {readyOrders.length === 0 && (
              <div className="py-12 border-2 border-dashed border-border dark:border-[#283a2d] rounded-2xl text-center text-xs text-sage">
                No items waiting for hand-off.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
