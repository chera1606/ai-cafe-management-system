"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  DollarSign,
  Eye,
  Filter,
  MoreVertical,
  Package,
  Receipt,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getKdsQueue, updateKdsOrderStatus } from "@/lib/kds-api";
import type { OrderDetailResponse, OrderStatus, OrderType } from "@/lib/orders-api";

// Fallback demo orders matching exact OrderDetailResponse type
const DEMO_ORDERS: OrderDetailResponse[] = [
  {
    id: "ord-8842-uuid",
    orderNumber: "8842",
    orderType: "DINE_IN",
    status: "PREPARING",
    tableNumber: "Table 4",
    totalAmount: 24.5,
    subtotal: 22.0,
    deliveryFee: 0,
    discountAmount: 0,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Customer requested table window seating",
    items: [
      { id: "i1", menuItemId: "1", name: "Ceremonial Ethiopian Yirgacheffe Pour-Over", quantity: 2, unitPrice: 6.5, subtotal: 13.0, specialInstruction: "Single-origin beans, medium roast" },
      { id: "i2", menuItemId: "2", name: "Blueberry Cardamom Scone", quantity: 2, unitPrice: 4.5, subtotal: 9.0, specialInstruction: "Warmed with butter" },
    ],
  },
  {
    id: "ord-8841-uuid",
    orderNumber: "8841",
    orderType: "TAKEAWAY",
    status: "READY",
    tableNumber: "Counter",
    totalAmount: 14.75,
    subtotal: 13.5,
    deliveryFee: 0,
    discountAmount: 0,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: "i3", menuItemId: "3", name: "Honey Pistachio Latte", quantity: 1, unitPrice: 7.25, subtotal: 7.25, specialInstruction: "Oat milk, extra foam" },
      { id: "i4", menuItemId: "4", name: "Cardamom Morning Bun", quantity: 1, unitPrice: 6.25, subtotal: 6.25 },
    ],
  },
  {
    id: "ord-8840-uuid",
    orderNumber: "8840",
    orderType: "DELIVERY",
    status: "PREPARING",
    totalAmount: 38.5,
    subtotal: 34.0,
    deliveryFee: 4.5,
    discountAmount: 0,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    delivery: { id: "d1", address: "452 Oak Street, Apt 3B", deliveryFee: 4.5, status: "DISPATCHED" },
    items: [
      { id: "i5", menuItemId: "5", name: "Slow-Steeped Cold Brew Nitro", quantity: 2, unitPrice: 7.0, subtotal: 14.0 },
      { id: "i6", menuItemId: "6", name: "Special Doro Wot Flatbread", quantity: 2, unitPrice: 10.0, subtotal: 20.0, specialInstruction: "Extra berbere sauce on side" },
    ],
  },
  {
    id: "ord-8839-uuid",
    orderNumber: "8839",
    orderType: "DINE_IN",
    status: "COMPLETED",
    tableNumber: "Table 9",
    totalAmount: 19.5,
    subtotal: 18.0,
    deliveryFee: 0,
    discountAmount: 0,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: "i7", menuItemId: "7", name: "Jebena Buna Traditional Pot", quantity: 1, unitPrice: 12.0, subtotal: 12.0 },
      { id: "i8", menuItemId: "8", name: "Foul Mudammas Bowl", quantity: 1, unitPrice: 7.5, subtotal: 7.5 },
    ],
  },
  {
    id: "ord-8838-uuid",
    orderNumber: "8838",
    orderType: "TAKEAWAY",
    status: "COMPLETED",
    totalAmount: 8.5,
    subtotal: 7.75,
    deliveryFee: 0,
    discountAmount: 0,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: "i9", menuItemId: "9", name: "Layered Spris Juice", quantity: 1, unitPrice: 8.5, subtotal: 8.5 },
    ],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDetailResponse[]>(DEMO_ORDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [activeType, setActiveType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailResponse | null>(null);

  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await getKdsQueue("ALL");
      if (res?.orders && res.orders.length > 0) {
        setOrders(res.orders);
      } else {
        setOrders(DEMO_ORDERS);
      }
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateKdsOrderStatus(orderId, newStatus);
    } catch {
      // Local optimistic update
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeStatus === "ALL" || order.status === activeStatus;
    const matchesType =
      activeType === "ALL" || order.orderType === activeType;
    const term = searchQuery.toLowerCase().trim();
    const orderNum = (order.orderNumber || order.orderCode || order.id).toLowerCase();
    const matchesSearch =
      !term ||
      orderNum.includes(term) ||
      (order.notes && order.notes.toLowerCase().includes(term)) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(term));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate live counts
  const totalOrdersCount = orders.length;
  const preparingCount = orders.filter((o) => o.status === "PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
              Orders Management
            </h1>
            <p className="text-xs text-slate-500">
              Live floor and digital orders, dispatch routing, tickets, and fulfillment status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
              />
            }
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Link
            href="/kitchen"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Launch KDS</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Orders Today
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {totalOrdersCount}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Across all channels
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            In Preparation
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {preparingCount}
          </div>
          <span className="text-xs text-amber-600 font-semibold mt-1 block flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Active on stations
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Ready for Pickup
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {readyCount}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Awaiting customer/runner
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Gross Order Value
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Avg ticket: ${(totalRevenue / (totalOrdersCount || 1)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto max-w-full">
            {[
              { key: "ALL", label: "All Orders" },
              { key: "PREPARING", label: `Preparing (${preparingCount})` },
              { key: "READY", label: `Ready (${readyCount})` },
              { key: "COMPLETED", label: `Completed (${completedCount})` },
              { key: "CANCELLED", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeStatus === tab.key
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Channel Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order #, table, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">All Channels</option>
              <option value="DINE_IN">Dine-In</option>
              <option value="TAKEAWAY">Takeaway</option>
              <option value="DELIVERY">Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Order #</th>
                <th className="py-3 px-4">Channel / Destination</th>
                <th className="py-3 px-4">Notes / Details</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time Placed</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-800 mb-0.5">
                      No matching orders found
                    </p>
                    <p className="text-xs text-slate-500">
                      Try clearing search filters or changing the order status tab.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const minutesAgo = Math.floor(
                    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60),
                  );
                  const displayNum = order.orderNumber || order.orderCode || order.id.slice(-4);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                          #{displayNum}
                        </span>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            order.orderType === "DINE_IN"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : order.orderType === "DELIVERY"
                                ? "bg-sky-50 text-sky-700 border border-sky-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {order.orderType === "DINE_IN"
                            ? order.tableNumber || "Table"
                            : order.orderType}
                        </span>
                      </td>

                      {/* Notes / Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-slate-700 block truncate">
                          {order.notes || order.delivery?.address || "Standard order"}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-800 block truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 tabular-nums text-sm">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                            order.status === "PREPARING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : order.status === "READY"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : order.status === "COMPLETED"
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 tabular-nums">
                        {minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Slide-Over Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Order Details
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-mono">
                    #{selectedOrder.orderNumber || selectedOrder.orderCode || selectedOrder.id.slice(-4)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6">
                {/* Status & Type Banner */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Status:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Channel:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedOrder.orderType} {selectedOrder.tableNumber && `(${selectedOrder.tableNumber})`}
                    </span>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Order Items ({selectedOrder.items.length})
                  </h4>
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900">
                            {item.quantity}x {item.name}
                          </div>
                          {item.specialInstruction && (
                            <div className="text-[11px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                              Note: {item.specialInstruction}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 tabular-nums">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery or Table Info */}
                {selectedOrder.delivery && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Delivery Destination
                    </h4>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <p className="font-bold text-slate-900">{selectedOrder.delivery.address}</p>
                      <p className="text-slate-500 mt-1">Status: {selectedOrder.delivery.status}</p>
                    </div>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="tabular-nums">${selectedOrder.deliveryFee?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>Total Charged</span>
                    <span className="tabular-nums">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleUpdateStatus(selectedOrder.id, "COMPLETED")}
              >
                Mark Completed
              </Button>
              <Link
                href={`/orders/${selectedOrder.id}/receipt`}
                target="_blank"
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Print Receipt
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
