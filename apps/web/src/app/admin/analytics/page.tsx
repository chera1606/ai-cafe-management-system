"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Filter,
  Layers,
  PieChart,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "ytd">("7d");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Simulate CSV export
      const csvContent =
        "data:text/csv;charset=utf-8,Date,Orders,GrossSales,AvgTicket,TopCategory\n2026-10-22,184,4820.50,26.19,Pour-Over Coffee\n2026-10-21,172,4490.00,26.10,Espresso\n2026-10-20,165,4210.00,25.51,Bakery\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sable_cafe_sales_report_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 600);
  };

  const hourlyData = [
    { hour: "7 AM", volume: 18, sales: "$142", pct: 28 },
    { hour: "8 AM", volume: 46, sales: "$380", pct: 72 },
    { hour: "9 AM", volume: 64, sales: "$520", pct: 100, isPeak: true },
    { hour: "10 AM", volume: 52, sales: "$415", pct: 81 },
    { hour: "11 AM", volume: 38, sales: "$310", pct: 59 },
    { hour: "12 PM", volume: 58, sales: "$680", pct: 90, isPeak: true },
    { hour: "1 PM", volume: 54, sales: "$620", pct: 84 },
    { hour: "2 PM", volume: 32, sales: "$290", pct: 50 },
    { hour: "3 PM", volume: 40, sales: "$340", pct: 62 },
    { hour: "4 PM", volume: 48, sales: "$390", pct: 75 },
    { hour: "5 PM", volume: 36, sales: "$280", pct: 56 },
    { hour: "6 PM", volume: 24, sales: "$190", pct: 37 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-serif">
              Sales & Financial Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Revenue trends, customer volume patterns, order ticket sizes, and category margins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7D" },
              { id: "30d", label: "Last 30D" },
              { id: "ytd", label: "YTD" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === p.id
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Gross Sales Volume
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            ${period === "today" ? "4,820.50" : period === "7d" ? "32,490.00" : "138,400.00"}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4%</span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Completed Orders
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {period === "today" ? "184" : period === "7d" ? "1,268" : "5,420"}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.1%</span>
            <span className="text-slate-400 font-normal">order count</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Average Order Ticket
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            $25.62
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+$1.40</span>
            <span className="text-slate-400 font-normal">upselling impact</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Estimated Profit Margin
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            68.4%
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+2.3%</span>
            <span className="text-slate-400 font-normal">net margin</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Hourly Rush & Sales Velocity
              </h2>
              <p className="text-xs text-slate-500">
                Operating customer flow and throughput across day parts
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Peak: 9 AM & 12 PM
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-600 text-[11px]">
                  {d.hour}
                </span>
                <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.isPeak ? "bg-amber-500" : "bg-emerald-600"
                    }`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <div className="w-24 text-right tabular-nums text-slate-800 font-semibold text-[11px]">
                  {d.volume} orders ({d.sales})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel & Category Breakdown */}
        <div className="space-y-6">
          {/* Channel Share */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-200">
              Sales by Channel
            </h2>
            <div className="space-y-3 pt-3">
              {[
                { name: "Table Dine-In (Table Ordering)", pct: 54, color: "bg-indigo-600", val: "$17,544.60" },
                { name: "Counter Cashier (POS Terminal)", pct: 28, color: "bg-emerald-600", val: "$9,097.20" },
                { name: "Mobile AI & Takeaway", pct: 18, color: "bg-amber-500", val: "$5,848.20" },
              ].map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{c.name}</span>
                    <span className="text-slate-900 font-bold">{c.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right tabular-nums">
                    {c.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Category Velocity */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-200">
              Top Catalog Categories
            </h2>
            <div className="space-y-3 pt-3">
              {[
                { cat: "Ethiopian Single-Origin Roasts", count: "482 sold", margin: "78% margin" },
                { cat: "Handcrafted Espresso & Lattes", count: "394 sold", margin: "72% margin" },
                { cat: "Artisan Cardamom Bakery", count: "246 sold", margin: "64% margin" },
                { cat: "Culinary Plates & Doro Wot", count: "146 sold", margin: "58% margin" },
              ].map((item) => (
                <div key={item.cat} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.cat}</span>
                    <span className="text-[10px] text-slate-500">{item.count}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {item.margin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
