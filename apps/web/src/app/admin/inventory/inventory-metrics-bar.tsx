"use client";

import { AlertTriangle, Boxes, CheckCircle2, DollarSign, XCircle } from "lucide-react";
import type { InventoryMetrics } from "@/lib/inventory-api";

interface InventoryMetricsBarProps {
  metrics: InventoryMetrics;
  onFilterStatus?: (status: string) => void;
  activeStatusFilter?: string;
}

export function InventoryMetricsBar({
  metrics,
  onFilterStatus,
  activeStatusFilter,
}: InventoryMetricsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Items */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFilterStatus?.("");
        }}
        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left bg-white ${
          !activeStatusFilter
            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
            : "border-slate-200 hover:border-slate-300 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Ingredients
          </span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {metrics.totalItems}
          </span>
          <span className="text-xs text-slate-500 font-medium">SKUs tracked</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{metrics.healthyCount} optimal levels</span>
        </div>
      </div>

      {/* Low Stock Warnings */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("LOW_STOCK")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFilterStatus?.("LOW_STOCK");
        }}
        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left bg-white ${
          activeStatusFilter === "LOW_STOCK"
            ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-50/20"
            : "border-slate-200 hover:border-amber-300 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Low Stock Alerts
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {metrics.lowStockCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">below threshold</span>
        </div>
        <div className="mt-2 text-xs font-semibold text-amber-600">
          {metrics.lowStockCount > 0
            ? "Reorder recommended"
            : "All SKUs above reorder point"}
        </div>
      </div>

      {/* Out of Stock */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("OUT_OF_STOCK")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFilterStatus?.("OUT_OF_STOCK");
        }}
        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left bg-white ${
          activeStatusFilter === "OUT_OF_STOCK"
            ? "border-rose-500 ring-2 ring-rose-500/20 shadow-sm bg-rose-50/20"
            : "border-slate-200 hover:border-rose-300 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Stockouts
          </span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {metrics.outOfStockCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">unavailable</span>
        </div>
        <div className="mt-2 text-xs font-semibold text-rose-600">
          {metrics.outOfStockCount > 0
            ? "Items disabled on menu"
            : "Zero active stockouts"}
        </div>
      </div>

      {/* Total Valuation */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Inventory Valuation
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            ${metrics.totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-medium">
          {metrics.recentMovementsCount} movements logged
        </div>
      </div>
    </div>
  );
}
