"use client";

import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Package,
  PlusCircle,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PurchaseEntity, PurchaseStatus } from "@/lib/procurement-api";

interface PurchaseOrdersTableProps {
  purchases: PurchaseEntity[];
  onReceivePo: (purchase: PurchaseEntity) => void;
  onOpenCreatePo: () => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export function PurchaseOrdersTable({
  purchases,
  onReceivePo,
  onOpenCreatePo,
  statusFilter = "",
  onStatusFilterChange,
}: PurchaseOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((po) => {
      const matchesStatus = !statusFilter || po.status === statusFilter;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        po.purchaseReference.toLowerCase().includes(term) ||
        (po.supplierName && po.supplierName.toLowerCase().includes(term)) ||
        (po.notes && po.notes.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [purchases, statusFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedPoId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 border border-slate-200 self-start md:self-auto">
          {[
            { key: "", label: "All Orders" },
            { key: "ORDERED", label: "Inbound Pending" },
            { key: "RECEIVED", label: "Received & Stocked" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => onStatusFilterChange?.(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreatePo}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Create PO
          </Button>
        </div>
      </div>

      {/* Clean Semantic Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50/75 text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-5">PO Reference</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4">Order Date</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Total Cost</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-sm text-slate-800 mb-0.5">
                    No purchase orders found
                  </p>
                  <p className="text-xs text-slate-500">
                    Try adjusting your status filter or search query.
                  </p>
                </td>
              </tr>
            ) : (
              filteredPurchases.map((po) => {
                const isExpanded = expandedPoId === po.id;
                return (
                  <Fragment key={po.id}>
                    <tr
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => toggleExpand(po.id)}
                    >
                      {/* Reference */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="font-mono text-xs">
                            {po.purchaseReference}
                          </span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate">
                          {po.supplierName || "Direct Partner"}
                        </span>
                        {po.notes && (
                          <span className="text-[11px] text-slate-400 truncate block">
                            {po.notes}
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-800 block">
                          {po.purchaseDate}
                        </span>
                        {po.receivedDate ? (
                          <span className="text-[10px] text-emerald-600 block">
                            Rec: {po.receivedDate}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 block font-semibold">
                            Awaiting intake
                          </span>
                        )}
                      </td>

                      {/* Items count */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {po.items.length}{" "}
                        {po.items.length === 1 ? "line item" : "line items"}
                      </td>

                      {/* Total Cost */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 tabular-nums text-sm">
                          ${po.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {po.status === "ORDERED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Inbound Ship
                          </span>
                        )}
                        {po.status === "RECEIVED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Restocked
                          </span>
                        )}
                        {po.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div onClick={(e) => e.stopPropagation()}>
                          {po.status === "ORDERED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReceivePo(po)}
                              className="text-xs border-amber-500 text-amber-700 hover:bg-amber-50"
                              leftIcon={<Truck className="w-3.5 h-3.5 text-amber-600" />}
                            >
                              Receive
                            </Button>
                          ) : po.status === "RECEIVED" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Complete</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Void
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Line Items Detail */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={7} className="p-4 px-6">
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                              Purchase Order Manifest ({po.items.length} items)
                            </h4>
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                                <tr>
                                  <th className="py-2 px-3">Ingredient</th>
                                  <th className="py-2 px-3">Quantity</th>
                                  <th className="py-2 px-3">Unit Cost</th>
                                  <th className="py-2 px-3">Total</th>
                                  <th className="py-2 px-3">Batch Code</th>
                                  <th className="py-2 px-3">Expiration</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {po.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="py-2 px-3 font-semibold text-slate-900">
                                      {item.ingredientName || "Ingredient SKU"}
                                    </td>
                                    <td className="py-2 px-3 text-slate-700 tabular-nums">
                                      {item.quantity} {item.unitOfMeasure || "units"}
                                    </td>
                                    <td className="py-2 px-3 text-slate-700 tabular-nums">
                                      ${item.unitCost.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 font-bold text-slate-900 tabular-nums">
                                      ${item.totalCost.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                                      {item.batchReference || "Auto-assigned"}
                                    </td>
                                    <td className="py-2 px-3 text-slate-500">
                                      {item.expirationDate || "Standard shelf life"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
