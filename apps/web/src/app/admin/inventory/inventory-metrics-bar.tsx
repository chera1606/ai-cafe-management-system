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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Items */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFilterStatus?.("");
        }}
        className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
          !activeStatusFilter
            ? "bg-white border-meadow ring-2 ring-meadow/20 shadow-md"
            : "bg-white/80 border-border hover:border-border-strong hover:bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage">
            Total Ingredients
          </span>
          <div className="p-2 rounded-xl bg-cream-alt text-forest">
            <Boxes className="w-4 h-4 text-forest" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-forest">
            {metrics.totalItems}
          </span>
          <span className="text-xs text-sage font-medium">SKUs active</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-meadow-dark font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-meadow" />
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
        className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
          activeStatusFilter === "LOW_STOCK"
            ? "bg-amber-50/70 border-amber ring-2 ring-amber/20 shadow-md"
            : "bg-white/80 border-border hover:border-amber/40 hover:bg-amber-50/20"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Low Stock Alerts
          </span>
          <div className="p-2 rounded-xl bg-amber/15 text-amber-alt">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-amber-950">
            {metrics.lowStockCount}
          </span>
          <span className="text-xs text-amber-800 font-medium">below threshold</span>
        </div>
        <div className="mt-3 text-xs text-amber-800 font-medium">
          {metrics.lowStockCount > 0
            ? "Replenishment recommended"
            : "All items above threshold"}
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
        className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
          activeStatusFilter === "OUT_OF_STOCK"
            ? "bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20 shadow-md"
            : "bg-white/80 border-border hover:border-rose-300 hover:bg-rose-50/30"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
            Out of Stock
          </span>
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-rose-950">
            {metrics.outOfStockCount}
          </span>
          <span className="text-xs text-rose-700 font-medium">depleted</span>
        </div>
        <div className="mt-3 text-xs text-rose-700 font-medium">
          {metrics.outOfStockCount > 0
            ? "Service availability impacted"
            : "No items depleted"}
        </div>
      </div>

      {/* Inventory Valuation */}
      <div className="p-5 rounded-3xl border border-border bg-white/80 text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage">
            Inventory Valuation
          </span>
          <div className="p-2 rounded-xl bg-meadow-tint text-meadow-dark">
            <DollarSign className="w-4 h-4 text-meadow" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight text-forest">
            ${metrics.totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-3 text-xs text-sage font-medium">
          Based on current unit cost FIFO
        </div>
      </div>
    </div>
  );
}
