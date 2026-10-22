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
import { useMemo, useState } from "react";
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
    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cream/30">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-cream-alt border border-border/80 self-start md:self-auto">
          {[
            { key: "", label: "All Orders" },
            { key: "ORDERED", label: "Inbound Pending" },
            { key: "RECEIVED", label: "Received & Restocked" },
            { key: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => onStatusFilterChange?.(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? "bg-white text-forest shadow-sm"
                  : "text-sage hover:text-forest"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-border bg-white text-forest placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-meadow/20 focus:border-meadow transition-all"
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-alt/70 text-sage uppercase font-bold tracking-wider text-[11px] border-b border-border">
            <tr>
              <th className="py-3.5 px-4">PO Reference</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">Order Date</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Total Cost</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sage">
                  <Package className="w-8 h-8 mx-auto mb-2 text-sage/60" />
                  <p className="font-semibold text-sm text-forest mb-0.5">
                    No purchase orders found
                  </p>
                  <p className="text-xs">
                    Try adjusting your status filter or search query.
                  </p>
                </td>
              </tr>
            ) : (
              filteredPurchases.map((po) => {
                const isExpanded = expandedPoId === po.id;
                return (
                  <tr
                    key={po.id}
                    className="group hover:bg-cream/40 transition-colors"
                  >
                    <td colSpan={7} className="p-0">
                      <div className="flex items-center w-full py-4 px-4">
                        {/* Reference & expand button */}
                        <div className="w-[18%] pr-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(po.id)}
                            className="flex items-center gap-1.5 font-bold text-forest hover:text-meadow-dark transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-sage" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-sage" />
                            )}
                            <span className="font-mono text-xs">
                              {po.purchaseReference}
                            </span>
                          </button>
                        </div>

                        {/* Supplier */}
                        <div className="w-[22%] pr-2">
                          <span className="font-semibold text-forest block truncate">
                            {po.supplierName || "Regional Supplier"}
                          </span>
                          {po.notes && (
                            <span className="text-[11px] text-sage truncate block">
                              {po.notes}
                            </span>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="w-[15%] pr-2">
                          <span className="text-forest block">
                            {po.purchaseDate}
                          </span>
                          {po.receivedDate ? (
                            <span className="text-[11px] text-meadow-dark block">
                              Rec: {po.receivedDate}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-alt block">
                              Awaiting intake
                            </span>
                          )}
                        </div>

                        {/* Items count */}
                        <div className="w-[13%] pr-2">
                          <span className="font-medium text-forest">
                            {po.items.length}{" "}
                            {po.items.length === 1 ? "line item" : "line items"}
                          </span>
                        </div>

                        {/* Total Cost */}
                        <div className="w-[12%] pr-2">
                          <span className="font-black text-forest text-sm">
                            ${po.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="w-[10%] pr-2">
                          {po.status === "ORDERED" && (
                            <Badge variant="amber" size="sm">
                              Inbound
                            </Badge>
                          )}
                          {po.status === "RECEIVED" && (
                            <Badge variant="meadow" size="sm">
                              Received
                            </Badge>
                          )}
                          {po.status === "CANCELLED" && (
                            <Badge variant="sage" size="sm">
                              Cancelled
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="w-[10%] text-right">
                          {po.status === "ORDERED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReceivePo(po)}
                              className="text-xs border-amber text-amber-900 hover:bg-amber-50"
                              leftIcon={<Truck className="w-3.5 h-3.5 text-amber-600" />}
                            >
                              Receive
                            </Button>
                          ) : po.status === "RECEIVED" ? (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-meadow-dark">
                              <CheckCircle2 className="w-3.5 h-3.5 text-meadow" />
                              <span>Restocked</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-sage font-medium">
                              Void
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded Item Details */}
                      {isExpanded && (
                        <div className="bg-cream/40 border-t border-b border-border/80 px-6 py-4">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-sage mb-2">
                            Purchase Order Line Items & Batches
                          </h4>
                          <div className="rounded-2xl border border-border bg-white overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-cream text-sage uppercase font-bold text-[10px]">
                                <tr>
                                  <th className="py-2 px-3">Ingredient</th>
                                  <th className="py-2 px-3">Quantity</th>
                                  <th className="py-2 px-3">Unit Cost</th>
                                  <th className="py-2 px-3">Total</th>
                                  <th className="py-2 px-3">Batch Code</th>
                                  <th className="py-2 px-3">Expiration</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/60">
                                {po.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-cream/20">
                                    <td className="py-2 px-3 font-semibold text-forest">
                                      {item.ingredientName || "Ingredient SKU"}
                                    </td>
                                    <td className="py-2 px-3 text-forest">
                                      {item.quantity} {item.unitOfMeasure || "units"}
                                    </td>
                                    <td className="py-2 px-3 text-forest">
                                      ${item.unitCost.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 font-bold text-forest">
                                      ${item.totalCost.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 font-mono text-[11px] text-sage">
                                      {item.batchReference || "Auto-assigned"}
                                    </td>
                                    <td className="py-2 px-3 text-sage">
                                      {item.expirationDate || "Standard shelf life"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
