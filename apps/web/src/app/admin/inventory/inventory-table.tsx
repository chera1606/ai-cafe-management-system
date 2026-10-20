"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
  Package,
  Scale,
  Search,
  SlidersHorizontal,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InventoryDepartment, InventoryItemEntity } from "@/lib/inventory-api";

interface InventoryTableProps {
  items: InventoryItemEntity[];
  activeDepartment: InventoryDepartment;
  onSelectDepartment: (dept: InventoryDepartment) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onSelectItem: (item: InventoryItemEntity) => void;
  onOpenAdjust: (itemId: string) => void;
  onOpenReconcile: (item: InventoryItemEntity) => void;
}

export function InventoryTable({
  items,
  activeDepartment,
  onSelectDepartment,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSelectItem,
  onOpenAdjust,
  onOpenReconcile,
}: InventoryTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cream/40">
        {/* Department Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-cream-alt border border-border/80 self-start md:self-auto">
          {(["ALL", "BARISTA", "KITCHEN"] as InventoryDepartment[]).map((dept) => (
            <button
              type="button"
              key={dept}
              onClick={() => onSelectDepartment(dept)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeDepartment === dept
                  ? "bg-white text-forest shadow-sm"
                  : "text-sage hover:text-forest"
              }`}
            >
              {dept === "ALL"
                ? "All Stations"
                : dept === "BARISTA"
                  ? "Barista Station"
                  : "Kitchen Pantry"}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient or supplier..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-border bg-white text-forest text-xs font-medium placeholder:text-sage focus:outline-none focus:ring-2 focus:ring-meadow"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-border bg-white text-forest text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-meadow"
          >
            <option value="">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-cream-alt/40 text-[11px] font-bold uppercase tracking-wider text-sage">
              <th className="py-3.5 px-6">Ingredient</th>
              <th className="py-3.5 px-4">Station</th>
              <th className="py-3.5 px-4">Stock Level</th>
              <th className="py-3.5 px-4">Reorder Level</th>
              <th className="py-3.5 px-4">Valuation</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs font-medium">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sage">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-sage/60" />
                    <span className="font-semibold text-sm text-forest">
                      No matching ingredients found
                    </span>
                    <span className="text-xs">
                      Try clearing search filters or add a new inventory item.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isOutOfStock = item.status === "OUT_OF_STOCK";
                const isLowStock = item.status === "LOW_STOCK";
                const totalValue = item.currentQuantity * item.unitCost;
                const ratio =
                  item.reorderLevel > 0
                    ? Math.min(100, (item.currentQuantity / (item.reorderLevel * 2)) * 100)
                    : 100;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-cream/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectItem(item)}
                  >
                    {/* Ingredient Name & Supplier */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-forest text-sm group-hover:text-meadow-dark transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-sage flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {item.supplier || "Standard Supply"}
                        </span>
                      </div>
                    </td>

                    {/* Station */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider ${
                          item.department === "BARISTA"
                            ? "bg-amber/15 text-amber-alt border border-amber/30"
                            : "bg-meadow-tint text-meadow-dark border border-meadow/20"
                        }`}
                      >
                        {item.department === "BARISTA" ? "Barista" : "Kitchen"}
                      </span>
                    </td>

                    {/* Stock Level with Progress Indicator */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-sm font-black ${
                            isOutOfStock
                              ? "text-rose-700"
                              : isLowStock
                                ? "text-amber-900"
                                : "text-forest"
                          }`}
                        >
                          {item.currentQuantity}
                        </span>
                        <span className="text-sage text-[11px] font-bold">
                          {item.unitOfMeasure}
                        </span>
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-cream-alt overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${
                            isOutOfStock
                              ? "bg-rose-500 w-0"
                              : isLowStock
                                ? "bg-amber-500"
                                : "bg-meadow"
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-4 px-4 whitespace-nowrap text-sage">
                      <span className="font-semibold text-forest">
                        {item.reorderLevel}
                      </span>{" "}
                      {item.unitOfMeasure}
                    </td>

                    {/* Valuation */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-forest">
                        ${totalValue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-sage">
                        ${item.unitCost.toFixed(2)} / {item.unitOfMeasure}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isOutOfStock && (
                        <Badge
                          variant="amber"
                          size="sm"
                          className="bg-rose-100 text-rose-800 border-rose-300"
                          icon={<XCircle className="w-3 h-3" />}
                        >
                          Depleted
                        </Badge>
                      )}
                      {isLowStock && (
                        <Badge
                          variant="amber"
                          size="sm"
                          icon={<AlertTriangle className="w-3 h-3" />}
                        >
                          Low Stock
                        </Badge>
                      )}
                      {!isOutOfStock && !isLowStock && (
                        <Badge
                          variant="meadow"
                          size="sm"
                          icon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Optimal
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          title="Physical audit count reconciliation"
                          onClick={() => onOpenReconcile(item)}
                          className="p-2 rounded-xl text-sage hover:text-forest hover:bg-cream transition-colors"
                        >
                          <Scale className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          title="Record restock or usage movement"
                          onClick={() => onOpenAdjust(item.id)}
                          className="p-2 rounded-xl text-sage hover:text-forest hover:bg-cream transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          title="View detail & logs"
                          onClick={() => onSelectItem(item)}
                          className="p-2 rounded-xl text-sage hover:text-forest hover:bg-cream transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
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
