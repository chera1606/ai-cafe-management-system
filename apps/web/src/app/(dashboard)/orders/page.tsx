"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { SideDrawer } from "@/components/ui/side-drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, formatETB, formatTimeOnly } from "@/lib/formatters";
import { canTransitionOrder, type OrderStatus, type PaymentStatus } from "@/lib/status-rules";
import { dashboardService } from "@/services/dashboard-service";
import { type Order, type OrderLineItem } from "@/services/mock-data";
import { type ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Flame,
  Info,
  RefreshCw,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "READY" | "COMPLETED" | "CANCELLED">("ALL");

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getOrders();
      setOrders(data);
    } catch (e) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter by tabs
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "ACTIVE":
        return orders.filter((o) => ["PENDING", "CONFIRMED", "PREPARING"].includes(o.orderStatus));
      case "READY":
        return orders.filter((o) => o.orderStatus === "READY");
      case "COMPLETED":
        return orders.filter((o) => o.orderStatus === "COMPLETED");
      case "CANCELLED":
        return orders.filter((o) => o.orderStatus === "CANCELLED");
      default:
        return orders;
    }
  }, [orders, activeTab]);

  // Order status transition handler
  const handleStatusChange = async (targetStatus: OrderStatus) => {
    if (!selectedOrder) return;
    const check = canTransitionOrder(selectedOrder.orderStatus, targetStatus);
    if (!check.allowed) {
      toast.error(check.reason || "Transition not allowed");
      return;
    }

    try {
      const updated = await dashboardService.updateOrderStatus(selectedOrder.id, targetStatus);
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(`Order ${updated.orderNumber} updated to ${targetStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update order status");
    }
  };

  // Order cancellation handler
  const handleConfirmCancel = async (reason?: string) => {
    if (!orderToCancel || !reason) return;
    try {
      const updated = await dashboardService.cancelOrder(orderToCancel.id, reason);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder(updated);
      }
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
      toast.success(`Order ${updated.orderNumber} cancelled successfully.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel order");
    }
  };

  // Table Columns Definition
  const columns: ColumnDef<Order, any>[] = useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
          <div className="font-mono font-bold text-forest dark:text-white">
            {row.original.orderNumber}
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-forest dark:text-stone-200">
              {row.original.customerName}
            </div>
            {row.original.customerPhone && (
              <span className="text-[10px] text-sage">{row.original.customerPhone}</span>
            )}
          </div>
        ),
      },
      {
        id: "itemsCount",
        header: "Items",
        cell: ({ row }) => (
          <span className="tabular-nums font-medium text-stone-600 dark:text-stone-300">
            {row.original.lineItems.reduce((sum: number, item: OrderLineItem) => sum + item.quantity, 0)} items
          </span>
        ),
      },
      {
        accessorKey: "fulfillmentType",
        header: "Fulfilment",
        cell: ({ row }) => {
          const type = row.original.fulfillmentType;
          return (
            <div className="flex items-center gap-1.5 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-bold">
                {type === "DINE_IN" ? `Dine-In (${row.original.tableNumber || "T1"})` : type}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "orderStatus",
        header: "Order Status",
        cell: ({ row }) => <StatusBadge status={row.original.orderStatus} size="sm" />,
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} size="sm" />,
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <div className="font-bold tabular-nums text-forest dark:text-white">
            {formatETB(row.original.total)}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => (
          <span className="text-sage text-[11px] tabular-nums">
            {formatTimeOnly(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(row.original);
            }}
            className="p-1.5 rounded-lg border border-border dark:border-[#283a2d] hover:bg-stone-100 dark:hover:bg-[#141f18] text-sage hover:text-forest transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Real-time multi-channel ticket queue, payment verification, and line-item auditing.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center p-1 rounded-2xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] shadow-xs">
          {(["ALL", "ACTIVE", "READY", "COMPLETED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-forest dark:bg-meadow text-white dark:text-forest shadow-xs"
                  : "text-sage hover:text-forest dark:hover:text-stone-200"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search order number or patron..."
        searchColumn="customerName"
        onRowClick={(order) => setSelectedOrder(order)}
        exportFileName="sable-cafe-orders"
        isLoading={isLoading}
      />

      {/* Side Drawer: Order Full Detail & Timeline */}
      <SideDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Order Details"}
        subtitle={
          selectedOrder
            ? `Placed ${formatDateTime(selectedOrder.createdAt)} · ${selectedOrder.fulfillmentType}`
            : undefined
        }
        footer={
          selectedOrder && (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-xs">
                <span className="text-sage">Status: </span>
                <span className="font-bold text-forest dark:text-white">
                  {selectedOrder.orderStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* State-dependent transition action buttons */}
                {selectedOrder.orderStatus === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("CONFIRMED")}
                    className="px-3 py-1.5 bg-meadow hover:bg-meadow-alt text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Order</span>
                  </button>
                )}

                {selectedOrder.orderStatus === "CONFIRMED" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("PREPARING")}
                    className="px-3 py-1.5 bg-amber hover:bg-amber-alt text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Send to Kitchen</span>
                  </button>
                )}

                {selectedOrder.orderStatus === "PREPARING" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("READY")}
                    className="px-3 py-1.5 bg-meadow hover:bg-meadow-alt text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Ready</span>
                  </button>
                )}

                {selectedOrder.orderStatus === "READY" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("COMPLETED")}
                    className="px-3 py-1.5 bg-meadow-dark hover:bg-forest text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Order</span>
                  </button>
                )}

                {/* Cancel Button (requires mandatory audit reason) */}
                {["PENDING", "CONFIRMED", "PREPARING"].includes(selectedOrder.orderStatus) && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderToCancel(selectedOrder);
                      setIsCancelModalOpen(true);
                    }}
                    className="px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Status & Payment Split Cards (SRS BR-004 separate management) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] space-y-1.5">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider block">
                  Order Status
                </span>
                <StatusBadge status={selectedOrder.orderStatus} />
              </div>

              <div className="p-3.5 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] space-y-1.5">
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider block">
                  Payment Status
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedOrder.paymentStatus} />
                  <span className="text-sage font-medium">({selectedOrder.paymentMethod})</span>
                </div>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="p-4 rounded-2xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest dark:text-white">Customer Information</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-bold">
                  {selectedOrder.fulfillmentType}
                </span>
              </div>
              <div className="text-sage space-y-0.5">
                <p>Name: <span className="text-forest dark:text-stone-200 font-semibold">{selectedOrder.customerName}</span></p>
                {selectedOrder.customerPhone && <p>Phone: <span className="text-forest dark:text-stone-200">{selectedOrder.customerPhone}</span></p>}
                {selectedOrder.tableNumber && <p>Table: <span className="text-forest dark:text-stone-200 font-semibold">{selectedOrder.tableNumber}</span></p>}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <h3 className="font-bold text-forest dark:text-white text-xs uppercase tracking-wider">
                Line Items ({selectedOrder.lineItems.length})
              </h3>
              <div className="rounded-2xl border border-border dark:border-[#283a2d] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-[#141f18] border-b border-border dark:border-[#283a2d] text-sage">
                    <tr>
                      <th className="p-2.5 font-semibold">Item</th>
                      <th className="p-2.5 font-semibold text-center">Qty</th>
                      <th className="p-2.5 font-semibold text-right">Price</th>
                      <th className="p-2.5 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 dark:divide-[#283a2d]">
                    {selectedOrder.lineItems.map((li) => (
                      <tr key={li.id}>
                        <td className="p-2.5 font-medium text-forest dark:text-stone-200">
                          {li.name}
                          {li.notes && <p className="text-[10px] text-amber mt-0.5">Note: {li.notes}</p>}
                        </td>
                        <td className="p-2.5 text-center tabular-nums">{li.quantity}</td>
                        <td className="p-2.5 text-right tabular-nums">{formatETB(li.unitPrice)}</td>
                        <td className="p-2.5 text-right font-bold tabular-nums">{formatETB(li.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Financials */}
              <div className="p-3.5 rounded-2xl border border-border dark:border-[#283a2d] bg-stone-50 dark:bg-[#141f18] space-y-1.5 text-right">
                <div className="flex justify-between text-sage">
                  <span>Subtotal:</span>
                  <span className="tabular-nums font-medium">{formatETB(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sage">
                  <span>VAT (15%):</span>
                  <span className="tabular-nums font-medium">{formatETB(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-forest dark:text-white border-t border-border/80 dark:border-[#283a2d] pt-1.5">
                  <span>Total Amount:</span>
                  <span className="tabular-nums">{formatETB(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Notice if cancelled */}
            {selectedOrder.cancelReason && (
              <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Order Cancelled
                </p>
                <p className="mt-1 text-xs">{selectedOrder.cancelReason}</p>
              </div>
            )}

            {/* Audit History Timeline */}
            <div className="space-y-3">
              <h3 className="font-bold text-forest dark:text-white text-xs uppercase tracking-wider">
                Audit Timeline
              </h3>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border dark:before:bg-[#283a2d]">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-meadow ring-4 ring-white dark:ring-[#1b2820]" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-forest dark:text-white text-xs">
                          {event.status}
                        </span>
                        <span className="text-[10px] text-sage tabular-nums">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-sage dark:text-stone-400 mt-0.5">
                        By {event.actor} {event.note ? `— ${event.note}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* Confirm Cancellation Dialog with Mandatory Reason */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        title={`Cancel Order ${orderToCancel?.orderNumber}?`}
        description="Cancelling an active order halts preparation in the kitchen and initiates payment refund auditing. A justification reason is required for permanent compliance records."
        confirmLabel="Cancel Ticket"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="e.g. Patron changed mind / kitchen out of ingredient..."
        minReasonLength={5}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
