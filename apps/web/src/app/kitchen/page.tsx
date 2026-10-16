"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ChefHat, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KdsHeader } from "@/components/kds/kds-header";
import { KdsKanbanBoard } from "@/components/kds/kds-kanban-board";
import { kdsAudio } from "@/components/kds/kds-audio-chime";
import {
  type KdsStation,
  type KdsWorkloadSummary,
  getKdsQueue,
  updateKdsOrderStatus,
} from "@/lib/kds-api";
import type { OrderDetailResponse, OrderStatus } from "@/lib/orders-api";

export default function KitchenDisplayPage() {
  const [station, setStation] = useState<KdsStation>("ALL");
  const [orders, setOrders] = useState<OrderDetailResponse[]>([]);
  const [metrics, setMetrics] = useState<KdsWorkloadSummary>({
    activeCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
    preparingCount: 0,
    readyCount: 0,
    completedTodayCount: 0,
    averagePrepTimeMinutes: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Track known order IDs to play chime when a genuinely new order arrives
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const fetchQueue = useCallback(
    async (isBackground = false) => {
      if (isBackground) {
        setIsPolling(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);

      try {
        const response = await getKdsQueue(station);
        setOrders(response.orders);
        setMetrics(response.metrics);
        setLastUpdated(new Date());

        // Check for new incoming orders
        const currentIds = new Set(response.orders.map((o) => o.id));
        if (!isInitialLoadRef.current) {
          const hasNewOrder = response.orders.some(
            (o) =>
              !previousOrderIdsRef.current.has(o.id) &&
              (o.status === "PENDING" || o.status === "CONFIRMED"),
          );
          if (hasNewOrder) {
            kdsAudio.playOrderChime();
          }
        } else {
          isInitialLoadRef.current = false;
        }

        previousOrderIdsRef.current = currentIds;
      } catch (err: unknown) {
        if (!isBackground) {
          setErrorMsg(
            err instanceof Error ? err.message : "Failed to load kitchen queue",
          );
        }
      } finally {
        setIsLoading(false);
        setIsPolling(false);
      }
    },
    [station],
  );

  // Initial fetch on station change
  useEffect(() => {
    fetchQueue(false);
  }, [fetchQueue]);

  // 5-second automatic heartbeat polling (FR-KDS-005)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );

    try {
      const updated = await updateKdsOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o)),
      );
      // Refresh metrics silently
      fetchQueue(true);
    } catch (err: unknown) {
      // Revert on failure
      fetchQueue(false);
      alert(
        `Failed to update status: ${
          err instanceof Error ? err.message : "Network error"
        }`,
      );
    }
  };

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    try {
      await updateKdsOrderStatus(orderId, "CANCELLED", reason);
      // Remove from active queue
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      fetchQueue(true);
    } catch (err: unknown) {
      alert(
        `Failed to cancel order: ${
          err instanceof Error ? err.message : "Network error"
        }`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Sticky Header */}
      <KdsHeader
        station={station}
        onStationChange={setStation}
        metrics={metrics}
        isPolling={isPolling}
        onRefresh={() => fetchQueue(false)}
        lastUpdated={lastUpdated}
      />

      {/* Main Board Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {isLoading && orders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mb-3" />
            <h2 className="text-base font-bold">Connecting to Kitchen Queue...</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Synchronizing active preparation stations
            </p>
          </div>
        ) : errorMsg && orders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold">Queue Sync Error</h2>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {errorMsg}
            </p>
            <Button size="sm" onClick={() => fetchQueue(false)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Try Again
            </Button>
          </div>
        ) : (
          <KdsKanbanBoard
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onCancelOrder={handleCancelOrder}
            station={station}
          />
        )}
      </main>
    </div>
  );
}
