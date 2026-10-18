"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  FileText,
  Flame,
  HelpCircle,
  MapPin,
  RefreshCw,
  Repeat,
  ShoppingBag,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import {
  getLocalOrderIds,
  getMyOrders,
  getOrderById,
  type OrderDetailResponse,
  type OrderStatus,
} from "@/lib/orders-api";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export default function CustomerOrdersHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const { addItem, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<OrderDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMsg(null);

    const orderMap = new Map<string, OrderDetailResponse>();

    try {
      // 1. Fetch server orders if authenticated
      if (isAuthenticated) {
        try {
          const serverOrders = await getMyOrders();
          for (const ord of serverOrders) {
            orderMap.set(ord.id, ord);
          }
        } catch {
          // Non-fatal if server has no account orders yet
        }
      }

      // 2. Fetch locally recorded orders from this device (supports guest checkouts)
      const localIds = getLocalOrderIds();
      if (localIds.length > 0) {
        const localFetches = localIds.map(async (id) => {
          if (orderMap.has(id)) return;
          try {
            const data = await getOrderById(id);
            orderMap.set(data.id, data);
          } catch {
            // Deleted or non-existent order
          }
        });
        await Promise.allSettled(localFetches);
      }

      const merged = Array.from(orderMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(merged);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Unable to load order history.");
      }
    } finally {
      setIsLoading(false);
      if (manual) setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Tab filtering
  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "ACTIVE") {
      return orders.filter(
        (o) =>
          o.status === "PENDING" ||
          o.status === "CONFIRMED" ||
          o.status === "PREPARING" ||
          o.status === "READY",
      );
    }
    if (activeTab === "COMPLETED") {
      return orders.filter((o) => o.status === "COMPLETED");
    }
    if (activeTab === "CANCELLED") {
      return orders.filter((o) => o.status === "CANCELLED");
    }
    return orders;
  }, [orders, activeTab]);

  // Summary Metrics
  const activeCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "PENDING" ||
          o.status === "CONFIRMED" ||
          o.status === "PREPARING" ||
          o.status === "READY",
      ).length,
    [orders],
  );

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === "COMPLETED").length,
    [orders],
  );

  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "CANCELLED")
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    [orders],
  );

  // Reorder functionality
  const handleReorder = (order: OrderDetailResponse) => {
    setReorderingId(order.id);
    try {
      for (const item of order.items) {
        addItem(
          {
            id: `reorder-${item.id}-${Date.now()}`,
            menuItemId: item.menuItemId,
            name: item.name,
            price: Number(item.unitPrice),
            specialInstructions: item.specialInstruction || undefined,
          },
          item.quantity,
          { openDrawer: false },
        );
      }
      setIsCartOpen(true);
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Queued</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Brewing &amp; Cooking</span>
          </span>
        );
      case "READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready for Service</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 dark:text-stone-300 border border-stone-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fulfilled</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest">
              Your Order History
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Track active preparation, recall past receipts, and reorder your favorites.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing || isLoading}
              className="text-xs font-semibold gap-1.5"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-meadow")}
              />
              <span>Refresh Orders</span>
            </Button>

            <Link href="/menu">
              <Button variant="primary" size="sm" className="text-xs font-bold gap-1">
                <span>Order Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                Active in Flight
              </span>
              <div className="font-mono font-black text-2xl text-forest mt-0.5">
                {activeCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                Fulfilled Orders
              </span>
              <div className="font-mono font-black text-2xl text-forest mt-0.5">
                {completedCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                Total Settled
              </span>
              <div className="font-mono font-black text-2xl text-forest mt-0.5">
                ${totalSpent.toFixed(2)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all shrink-0",
              activeTab === "ALL"
                ? "bg-forest text-white font-bold shadow-xs"
                : "text-stone-600 hover:text-forest hover:bg-stone-100",
            )}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all shrink-0",
              activeTab === "ACTIVE"
                ? "bg-forest text-white font-bold shadow-xs"
                : "text-stone-600 hover:text-forest hover:bg-stone-100",
            )}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all shrink-0",
              activeTab === "COMPLETED"
                ? "bg-forest text-white font-bold shadow-xs"
                : "text-stone-600 hover:text-forest hover:bg-stone-100",
            )}
          >
            Fulfilled ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CANCELLED")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all shrink-0",
              activeTab === "CANCELLED"
                ? "bg-forest text-white font-bold shadow-xs"
                : "text-stone-600 hover:text-forest hover:bg-stone-100",
            )}
          >
            Cancelled
          </button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="w-32 h-5 bg-stone-200 rounded-md" />
                  <div className="w-24 h-5 bg-stone-200 rounded-full" />
                </div>
                <div className="w-3/4 h-4 bg-stone-100 rounded-md" />
                <div className="w-1/2 h-4 bg-stone-100 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {!isLoading && errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-stone-200/80 shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-cream flex items-center justify-center text-sage mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-forest">
              No orders found
            </h2>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              {activeTab === "ALL"
                ? "You haven't placed any orders yet. Discover our artisanal coffee and heritage dining menu."
                : `No orders currently match the '${activeTab.toLowerCase()}' filter.`}
            </p>
            <Link href="/menu">
              <Button variant="primary" size="lg" className="text-xs font-bold">
                Explore Artisan Menu
              </Button>
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderCode =
                order.orderNumber || order.id.slice(0, 8).toUpperCase();
              const dateFormatted = new Date(order.createdAt).toLocaleString(
                undefined,
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                },
              );

              const isActive =
                order.status === "PENDING" ||
                order.status === "CONFIRMED" ||
                order.status === "PREPARING" ||
                order.status === "READY";

              return (
                <div
                  key={order.id}
                  className={cn(
                    "bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs transition-all hover:shadow-md",
                    isActive && "ring-1 ring-forest/15 border-forest/30",
                  )}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-black text-base text-forest">
                        {orderCode}
                      </span>

                      {/* Fulfilment Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-stone-100 text-stone-700">
                        {order.orderType === "DINE_IN" ? (
                          <>
                            <UtensilsCrossed className="w-3.5 h-3.5 text-meadow" />
                            <span>
                              {order.tableNumber
                                ? `Table ${order.tableNumber}`
                                : "Dine In"}
                            </span>
                          </>
                        ) : order.orderType === "DELIVERY" ? (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-meadow" />
                            <span>Delivery</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-meadow" />
                            <span>Takeaway</span>
                          </>
                        )}
                      </span>

                      <span className="text-xs text-stone-400 font-mono">
                        {dateFormatted}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Items Preview */}
                  <div className="py-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs sm:text-sm text-stone-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-meadow text-xs px-1.5 py-0.5 rounded bg-meadow-tint">
                            {item.quantity}x
                          </span>
                          <span className="font-semibold">{item.name}</span>
                          {item.specialInstruction && (
                            <span className="text-xs text-stone-400 italic hidden sm:inline">
                              ({item.specialInstruction})
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-medium text-stone-600">
                          ${Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer: Financial Total & Actions */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                        Total Amount:
                      </span>
                      <span className="font-mono font-black text-lg text-forest">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Track Live button */}
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          variant={isActive ? "primary" : "outline"}
                          size="sm"
                          className="text-xs font-semibold gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isActive ? "Track Live" : "Order Status"}</span>
                        </Button>
                      </Link>

                      {/* View Receipt button */}
                      <Link href={`/orders/${order.id}/receipt`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </Button>
                      </Link>

                      {/* Reorder button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReorder(order)}
                        disabled={reorderingId === order.id}
                        className="text-xs font-bold gap-1.5 bg-meadow-tint text-meadow-dark hover:bg-meadow-tint/80"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Order Again</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
