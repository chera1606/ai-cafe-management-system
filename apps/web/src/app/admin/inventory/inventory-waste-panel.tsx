"use client";

import {
  AlertOctagon,
  Building2,
  Calendar,
  ChefHat,
  Coffee,
  DollarSign,
  Filter,
  PlusCircle,
  Tag,
  Trash2,
  TrendingDown,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  WasteAnalytics,
  WasteReason,
  WasteRecordEntity,
} from "@/lib/inventory-api";

interface InventoryWastePanelProps {
  analytics: WasteAnalytics;
  records: WasteRecordEntity[];
  onOpenWasteModal: () => void;
  activeDepartmentFilter: string;
  onFilterDepartment: (dept: string) => void;
  activeReasonFilter: string;
  onFilterReason: (reason: string) => void;
}

export function InventoryWastePanel({
  analytics,
  records,
  onOpenWasteModal,
  activeDepartmentFilter,
  onFilterDepartment,
  activeReasonFilter,
  onFilterReason,
}: InventoryWastePanelProps) {
  const filteredRecords = records.filter((r) => {
    if (activeDepartmentFilter && activeDepartmentFilter !== "ALL") {
      if (r.department !== activeDepartmentFilter) return false;
    }
    if (activeReasonFilter) {
      if (r.reason !== activeReasonFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Waste Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Impact */}
        <div className="p-5 rounded-3xl border border-rose-200 bg-rose-50/50 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Total Waste Loss
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-rose-950">
              ${analytics.totalWasteCost.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 text-xs text-rose-800 font-medium">
            Financial cost of spoiled/discarded stock
          </div>
        </div>

        {/* Total Incidents */}
        <div className="p-5 rounded-3xl border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sage">
              Recorded Incidents
            </span>
            <div className="p-2 rounded-xl bg-cream-alt text-forest">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-forest">
              {analytics.totalIncidents}
            </span>
            <span className="text-xs text-sage font-medium">events</span>
          </div>
          <div className="mt-3 text-xs text-sage font-medium">
            Audited physical waste events
          </div>
        </div>

        {/* Barista Department Waste */}
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            onFilterDepartment(
              activeDepartmentFilter === "BARISTA" ? "ALL" : "BARISTA",
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              onFilterDepartment(
                activeDepartmentFilter === "BARISTA" ? "ALL" : "BARISTA",
              );
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
            activeDepartmentFilter === "BARISTA"
              ? "bg-amber-50 border-amber ring-2 ring-amber/20 shadow-md"
              : "bg-white border-border hover:border-amber/40 hover:bg-amber-50/20"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" />
              Barista Loss
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-amber-950">
              ${(analytics.byDepartment.BARISTA?.cost || 0).toFixed(2)}
            </span>
            <span className="text-xs text-amber-800 font-semibold">
              ({analytics.byDepartment.BARISTA?.count || 0} items)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-amber-800 font-medium">
            Milk expiries & espresso grinder spills
          </div>
        </div>

        {/* Kitchen Department Waste */}
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            onFilterDepartment(
              activeDepartmentFilter === "KITCHEN" ? "ALL" : "KITCHEN",
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              onFilterDepartment(
                activeDepartmentFilter === "KITCHEN" ? "ALL" : "KITCHEN",
              );
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer text-left ${
            activeDepartmentFilter === "KITCHEN"
              ? "bg-meadow-tint/40 border-meadow ring-2 ring-meadow/20 shadow-md"
              : "bg-white border-border hover:border-meadow/40 hover:bg-meadow-tint/10"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-meadow-dark flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              Kitchen Loss
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-forest">
              ${(analytics.byDepartment.KITCHEN?.cost || 0).toFixed(2)}
            </span>
            <span className="text-xs text-sage font-semibold">
              ({analytics.byDepartment.KITCHEN?.count || 0} items)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-sage font-medium">
            Skillet prep calibration & trimming
          </div>
        </div>
      </div>

      {/* Categorized Reason Breakdown Bar */}
      <div className="p-5 rounded-3xl bg-white border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-forest" />
            Waste Breakdown by Root Cause (FR-WASTE-002)
          </span>
          <span className="text-xs text-sage font-medium">
            Tap a cause to filter audit table
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(analytics.byReason).map(([reason, data]) => {
            const isSelected = activeReasonFilter === reason;
            return (
              <button
                type="button"
                key={reason}
                onClick={() => onFilterReason(isSelected ? "" : reason)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-cream-alt text-forest border-border hover:border-border-strong"
                }`}
              >
                <span>{reason.replace(/_/g, " ")}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                    isSelected ? "bg-white/20 text-white" : "bg-white text-rose-700"
                  }`}
                >
                  ${data.cost.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Waste Audit Trail Table */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-cream/40">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold tracking-tight text-forest font-serif">
              Waste Audit Log
            </h3>
            <span className="text-xs text-sage">
              Showing {filteredRecords.length} records
            </span>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={onOpenWasteModal}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Log Waste Incident
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-alt/40 text-[11px] font-bold uppercase tracking-wider text-sage">
                <th className="py-3.5 px-6">Incident Date</th>
                <th className="py-3.5 px-4">Ingredient</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Wasted Quantity</th>
                <th className="py-3.5 px-4">Financial Loss</th>
                <th className="py-3.5 px-4">Reason Category</th>
                <th className="py-3.5 px-6">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sage">
                    No waste incidents match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3.5 px-6 whitespace-nowrap text-sage">
                      <div className="flex items-center gap-1.5 font-medium text-forest">
                        <Calendar className="w-3.5 h-3.5 text-sage" />
                        <span>{new Date(r.recordedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-sage">
                        {new Date(r.recordedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-forest">
                      {r.ingredientName}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                          r.department === "BARISTA"
                            ? "bg-amber/15 text-amber-alt border border-amber/30"
                            : "bg-meadow-tint text-meadow-dark border border-meadow/20"
                        }`}
                      >
                        {r.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-forest whitespace-nowrap">
                      {r.quantity} {r.unitOfMeasure}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-black text-rose-700">
                      ${r.estimatedCost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
                        {r.reason.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-sage max-w-xs truncate">
                      {r.notes || "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
