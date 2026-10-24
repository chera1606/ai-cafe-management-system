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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Direct Trade Spend */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Sourced Spend
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            ${analytics.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Settled POs</span>
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
        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left bg-white ${
          activeStatusFilter === "ORDERED"
            ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-50/20"
            : "border-slate-200 hover:border-amber-300 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Inbound Shipments
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {analytics.pendingShipmentsCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">orders active</span>
        </div>
        <div className="mt-2 text-xs font-semibold text-amber-600">
          En route to roastery
        </div>
      </div>

      {/* Active Suppliers */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs text-left">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Verified Suppliers
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {analytics.activeSuppliersCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">partners</span>
        </div>
        <div className="mt-2 text-xs font-semibold text-slate-500">
          Direct Trade Certified
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
        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left bg-white ${
          !activeStatusFilter
            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
            : "border-slate-200 hover:border-slate-300 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Purchase Orders
          </span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {analytics.totalOrders}
          </span>
          <span className="text-xs text-slate-500 font-medium">orders</span>
        </div>
        <div className="mt-2 text-xs font-semibold text-slate-500">
          All procurement records
        </div>
      </div>
    </div>
  );
}
