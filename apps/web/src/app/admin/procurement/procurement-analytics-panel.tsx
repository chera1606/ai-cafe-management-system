"use client";

import {
  Award,
  BarChart3,
  CheckCircle2,
  Coffee,
  DollarSign,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import type { ProcurementAnalytics } from "@/lib/procurement-api";

interface ProcurementAnalyticsPanelProps {
  analytics: ProcurementAnalytics;
}

export function ProcurementAnalyticsPanel({
  analytics,
}: ProcurementAnalyticsPanelProps) {
  const topSupplier = analytics.spendBySupplier[0];
  const primaryVendorShare =
    analytics.totalSpend > 0 && topSupplier
      ? Math.round((topSupplier.totalSpend / analytics.totalSpend) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Sourcing Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border border-border bg-white shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-meadow-tint text-meadow-dark shrink-0">
            <ShieldCheck className="w-6 h-6 text-meadow" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage block">
              Direct Trade Traceability
            </span>
            <span className="text-xl font-black text-forest block mt-0.5">
              100% Ethiopian Sourced
            </span>
            <p className="text-xs text-sage mt-1">
              Direct cooperative relationships across Yirgacheffe, Sidama, and Oromia.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-white shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber/15 text-amber-alt shrink-0">
            <TrendingUp className="w-6 h-6 text-amber" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage block">
              Primary Supplier Concentration
            </span>
            <span className="text-xl font-black text-forest block mt-0.5">
              {primaryVendorShare}% Sourced
            </span>
            <p className="text-xs text-sage mt-1">
              {topSupplier?.supplierName || "Top cooperative"} leads volume.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-border bg-white shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-cream-alt text-forest shrink-0">
            <Award className="w-6 h-6 text-forest" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage block">
              Cooperative Partners
            </span>
            <span className="text-xl font-black text-forest block mt-0.5">
              {analytics.activeSuppliersCount} Certified Unions
            </span>
            <p className="text-xs text-sage mt-1">
              Specialty bean unions, organic dairies, and heritage grain mills.
            </p>
          </div>
        </div>
      </div>

      {/* Spend Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Supplier */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-black text-forest">
                Spend by Sourcing Partner
              </h3>
              <p className="text-xs text-sage">
                Cumulative direct trade capital allocated by union
              </p>
            </div>
            <div className="p-2 rounded-xl bg-cream-alt text-forest">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4">
            {analytics.spendBySupplier.map((supplier) => {
              const percentage =
                analytics.totalSpend > 0
                  ? Math.min(
                      100,
                      Math.round((supplier.totalSpend / analytics.totalSpend) * 100),
                    )
                  : 0;

              return (
                <div key={supplier.supplierName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-forest truncate max-w-[220px]">
                      {supplier.supplierName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-forest">
                        ${supplier.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-sage">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cream-alt overflow-hidden">
                    <div
                      className="h-full rounded-full bg-meadow transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-sage text-right">
                    {supplier.orderCount} purchase orders completed
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spend by Category */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-black text-forest">
                Spend by Commodity Category
              </h3>
              <p className="text-xs text-sage">
                Ingredient and raw agricultural material distribution
              </p>
            </div>
            <div className="p-2 rounded-xl bg-cream-alt text-forest">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(analytics.spendByCategory).map(([category, amount]) => {
              const percentage =
                analytics.totalSpend > 0
                  ? Math.min(
                      100,
                      Math.round((amount / analytics.totalSpend) * 100),
                    )
                  : 0;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-forest">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-forest">
                        ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-sage">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-cream-alt overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border/80 flex items-center justify-between text-xs text-sage">
            <span>Direct Sourcing Program</span>
            <span className="font-bold text-meadow-dark flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-meadow" />
              Traceable Origin Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
