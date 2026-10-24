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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
        {/* Department Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 border border-slate-200 self-start md:self-auto">
          {(["ALL", "BARISTA", "KITCHEN"] as InventoryDepartment[]).map((dept) => (
            <button
              type="button"
              key={dept}
              onClick={() => onSelectDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDepartment === dept
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
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
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient, SKU, supplier..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-5">Ingredient</th>
              <th className="py-3 px-4">Station</th>
              <th className="py-3 px-4">Stock Level</th>
              <th className="py-3 px-4">Reorder Min</th>
              <th className="py-3 px-4">Valuation</th>
              <th className="py-3 px-4">Health Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <span className="font-semibold text-sm text-slate-800">
                      No matching ingredients found
                    </span>
                    <span className="text-xs text-slate-500">
                      Try adjusting filters or search queries.
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
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectItem(item)}
                  >
                    {/* Ingredient Name & Supplier */}
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {item.supplier || "Direct Roastery"}
                        </span>
                      </div>
                    </td>

                    {/* Station */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          item.department === "BARISTA"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.department === "BARISTA" ? "Barista" : "Kitchen"}
                      </span>
                    </td>

                    {/* Stock Level with Progress Indicator */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-sm font-black tabular-nums ${
                            isOutOfStock
                              ? "text-rose-600"
                              : isLowStock
                                ? "text-amber-600"
                                : "text-slate-900"
                          }`}
                        >
                          {item.currentQuantity}
                        </span>
                        <span className="text-slate-400 text-[11px] font-bold">
                          {item.unitOfMeasure}
                        </span>
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOutOfStock
                              ? "bg-rose-500 w-0"
                              : isLowStock
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 tabular-nums">
                      <span className="font-bold text-slate-800">
                        {item.reorderLevel}
                      </span>{" "}
                      {item.unitOfMeasure}
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 tabular-nums">
                        ${totalValue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        ${item.unitCost.toFixed(2)} / {item.unitOfMeasure}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Optimal
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenAdjust(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          Adjust
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenReconcile(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          Reconcile
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
