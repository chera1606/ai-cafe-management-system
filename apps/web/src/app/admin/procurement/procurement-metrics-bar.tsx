"use client";

import { CheckCircle2, DollarSign, Layers, Package, Truck, Users } from "lucide-react";
import type { ProcurementAnalytics } from "@/lib/procurement-api";

interface ProcurementMetricsBarProps {
  analytics: ProcurementAnalytics;
  onFilterStatus?: (status: string) => void;
  activeStatusFilter?: string;
}

export function ProcurementMetricsBar({
  analytics,
  onFilterStatus,
  activeStatusFilter,
}: ProcurementMetricsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Direct Trade Spend */}
      <div className="p-5 rounded-3xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage">
            Total Sourced Spend
          </span>
          <div className="p-2 rounded-xl bg-cream-alt text-forest">
            <DollarSign className="w-4 h-4 text-forest" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight text-forest">
            ${analytics.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-meadow-dark font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-meadow" />
          <span>Settled Direct Trade Orders</span>
        </div>
      </div>

      {/* Inbound Shipments */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onFilterStatus?.("ORDERED")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFilterStatus?.("ORDERED");
        }}
        className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
          activeStatusFilter === "ORDERED"
            ? "bg-amber-50/70 border-amber ring-2 ring-amber/20 shadow-md"
            : "bg-white/80 border-border hover:border-amber/40 hover:bg-amber-50/20"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Inbound Shipments
          </span>
          <div className="p-2 rounded-xl bg-amber/15 text-amber-alt">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-amber-950">
            {analytics.pendingShipmentsCount}
          </span>
          <span className="text-xs text-amber-800 font-medium">pending intake</span>
        </div>
        <div className="mt-3 text-xs text-amber-800 font-medium">
          {analytics.pendingShipmentsCount > 0
            ? "Awaiting arrival & stock intake"
            : "All shipments processed"}
        </div>
      </div>

      {/* Certified Regional Suppliers */}
      <div className="p-5 rounded-3xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage">
            Regional Suppliers
          </span>
          <div className="p-2 rounded-xl bg-cream-alt text-forest">
            <Users className="w-4 h-4 text-forest" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-forest">
            {analytics.activeSuppliersCount}
          </span>
          <span className="text-xs text-sage font-medium">verified partners</span>
        </div>
        <div className="mt-3 text-xs text-meadow-dark font-medium">
          Ethiopian unions & local dairies
        </div>
      </div>

      {/* Total Purchase Orders */}
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
            Purchase Orders
          </span>
          <div className="p-2 rounded-xl bg-cream-alt text-forest">
            <Package className="w-4 h-4 text-forest" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-forest">
            {analytics.totalOrders}
          </span>
          <span className="text-xs text-sage font-medium">lifetime POs</span>
        </div>
        <div className="mt-3 text-xs text-sage font-medium">
          {activeStatusFilter ? "Click to clear filter" : "All order cycles recorded"}
        </div>
      </div>
    </div>
  );
}
