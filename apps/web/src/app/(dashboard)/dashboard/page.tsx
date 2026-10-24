"use client";

import { ChartCard } from "@/components/ui/chart-card";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatETB, formatElapsedMinutes, formatNumber } from "@/lib/formatters";
import { dashboardService, type DashboardMetrics } from "@/services/dashboard-service";
import { type Order } from "@/services/mock-data";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  CreditCard,
  Flame,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, ords] = await Promise.all([
          dashboardService.getDashboardMetrics(),
          dashboardService.getOrders(),
        ]);
        setMetrics(m);
        // Take 6 most recent active/pending orders
        setLiveOrders(
          ords.filter((o) => ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.orderStatus)).slice(0, 6)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Executive Overview
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Real-time financial velocity, live operational feeds, and inventory signals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/kitchen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-xs font-bold text-forest dark:text-stone-200 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber" />
            <span>Kitchen KDS</span>
          </Link>
          <Link
            href="/pos"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest dark:bg-meadow text-white dark:text-forest text-xs font-bold hover:bg-forest-2 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-meadow dark:text-forest" />
            <span>New POS Order</span>
          </Link>
        </div>
      </div>

      {/* 1. KPI Row (6 Cards with animated count-up and sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Today's Sales"
          value={metrics.todaySales}
          formatAs="currency"
          delta={metrics.todaySalesDelta}
          sparklineData={metrics.salesSparkline}
          icon={<TrendingUp className="w-4 h-4 text-meadow" />}
        />
        <KpiCard
          title="Orders Today"
          value={metrics.todayOrdersCount}
          delta={metrics.todayOrdersDelta}
          icon={<ShoppingBag className="w-4 h-4 text-blue-500" />}
        />
        <KpiCard
          title="Avg Order Value"
          value={metrics.averageOrderValue}
          formatAs="currency"
          delta={metrics.aovDelta}
          icon={<Coffee className="w-4 h-4 text-amber" />}
        />
        <KpiCard
          title="Active in Kitchen"
          value={metrics.activeKitchenOrders}
          subtitle="Tickets in prep / waiting"
          icon={<Flame className="w-4 h-4 text-amber-alt" />}
        />
        <KpiCard
          title="Customer Credit"
          value={metrics.outstandingCreditTotal}
          formatAs="currency"
          subtitle="Awaiting reconciliation"
          icon={<CreditCard className="w-4 h-4 text-rose-500" />}
        />
        <KpiCard
          title="Low Stock Items"
          value={metrics.lowStockItemsCount}
          subtitle="Below safety threshold"
          icon={<Package className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* 2. Charts & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend (Area Chart) - 8 Cols */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Hourly Sales Velocity (Today)"
            subtitle="Gross revenue (ETB) and order volume cadence across operating hours"
            periods={["Hourly", "Daily", "Weekly"]}
            activePeriod="Hourly"
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.hourlySalesVelocity}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48a853" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#48a853" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="hour"
                    stroke="#718079"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#718079"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `ETB ${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1b2820",
                      borderColor: "#283a2d",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`ETB ${new Intl.NumberFormat("en-US").format(val)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#48a853"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Fulfillment Breakdown Donut - 4 Cols */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Orders by Fulfilment"
            subtitle="Channel share across active volume"
            periods={[]}
          >
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.ordersByFulfillment}
                    dataKey="count"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    <Cell fill="#48a853" />
                    <Cell fill="#ff8a3d" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1b2820",
                      borderColor: "#283a2d",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-2 text-xs">
              {metrics.ordersByFulfillment.map((f, i) => (
                <div key={f.channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: i === 0 ? "#48a853" : i === 1 ? "#ff8a3d" : "#3b82f6",
                      }}
                    />
                    <span className="text-forest dark:text-stone-300 font-medium">{f.channel}</span>
                  </div>
                  <span className="font-bold text-forest dark:text-white tabular-nums">
                    {f.count} ({f.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* 3. Live Order Stream & Operational Radars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Orders Feed (SLA Elapsed Timers) - 8 Cols */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/80 dark:border-[#283a2d]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-display text-forest dark:text-white">
                  Live Orders Stream
                </h3>
                <span className="w-2 h-2 rounded-full bg-meadow animate-ping" />
              </div>
              <p className="text-xs text-sage dark:text-stone-400 mt-0.5">
                Active tickets with SLA elapsed timers and quick expediter updates
              </p>
            </div>

            <Link
              href="/orders"
              className="text-xs font-bold text-meadow-dark dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/50 dark:divide-[#283a2d]">
            {liveOrders.map((ord) => {
              const elapsed = formatElapsedMinutes(ord.createdAt);
              // SLA Escalation: > 10m amber, > 20m red
              const isOverdue = elapsed.minutes > 20;
              const isWarning = elapsed.minutes > 10 && !isOverdue;

              return (
                <div
                  key={ord.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-[#141f18] transition-colors rounded-xl px-2 -mx-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-forest dark:text-stone-200 flex flex-col items-center justify-center shrink-0 border border-border dark:border-[#283a2d]">
                      <span className="text-[10px] font-bold">
                        {ord.tableNumber || (ord.fulfillmentType === "PICKUP" ? "P/U" : "DEL")}
                      </span>
                      <span className="text-[8px] text-sage">
                        {ord.fulfillmentType.toLowerCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-forest dark:text-white">
                          {ord.orderNumber}
                        </span>
                        <StatusBadge status={ord.orderStatus} size="sm" />
                      </div>
                      <p className="text-xs text-forest dark:text-stone-300 font-medium mt-0.5">
                        {ord.lineItems.map((li) => `${li.quantity}x ${li.name}`).join(", ")}
                      </p>
                      <span className="text-[11px] text-sage dark:text-stone-400">
                        Patron: {ord.customerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {/* Live SLA Timer */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        isOverdue
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          : isWarning
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsed.formatted}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xs text-forest dark:text-white tabular-nums">
                        {formatETB(ord.total)}
                      </div>
                      <span className="text-[10px] text-sage">{ord.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Selling Items & Payment Mix - 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Selling Items */}
          <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold font-display text-forest dark:text-white mb-3">
              Top Selling Items
            </h3>
            <div className="space-y-3">
              {metrics.topSellingItems.map((item, idx) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-forest dark:text-stone-200 truncate">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="font-bold tabular-nums text-forest dark:text-white">
                      {formatETB(item.revenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-sage">
                    <span>{item.quantity} orders</span>
                    <span className="flex items-center gap-1 text-amber font-semibold">
                      <Star className="w-3 h-3 fill-amber" />
                      {item.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Card (Placeholder per SRS 15.2 / 7.2) */}
          <div className="bg-gradient-to-br from-[#1b2820] to-[#263228] text-white rounded-2xl p-5 border border-meadow/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Operational Signals</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Predictive models evaluate historical sales velocity against weather, Ethiopian holidays, and supply stock.
            </p>
            <div className="mt-3.5 space-y-2">
              <div className="p-2.5 rounded-xl bg-white/10 text-xs text-stone-200 border border-white/10">
                <span className="font-bold text-amber-300 block">Sample Forecast:</span>
                Pour-over bean consumption peaks +35% on Friday mornings. Suggested advance grinding order.
              </div>
            </div>
            <p className="text-[10px] text-stone-400 mt-2.5 italic">
              Note: AI recommendations are advisory and never modify authoritative ledgers (SRS 7.2).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
