"use client";

import { ChartCard } from "@/components/ui/chart-card";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { formatETB, formatNumber } from "@/lib/formatters";
import { dashboardService } from "@/services/dashboard-service";
import {
  BarChart3,
  Calendar,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Package,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<"SALES" | "CHANNELS" | "WASTE" | "CREDIT">("SALES");

  const salesData = [
    { day: "Mon", gross: 18400, net: 15640, orders: 42 },
    { day: "Tue", gross: 21200, net: 18020, orders: 49 },
    { day: "Wed", gross: 19800, net: 16830, orders: 44 },
    { day: "Thu", gross: 24500, net: 20825, orders: 56 },
    { day: "Fri", gross: 32000, net: 27200, orders: 74 },
    { day: "Sat", gross: 38500, net: 32725, orders: 88 },
    { day: "Sun", gross: 34200, net: 29070, orders: 78 },
  ];

  const channelData = [
    { channel: "Telebirr Digital", amount: 84500, share: "45%" },
    { channel: "Cash at Register", amount: 48200, share: "26%" },
    { channel: "CBE Birr QR", amount: 32400, share: "17%" },
    { channel: "Corporate Credit Account", amount: 22800, share: "12%" },
  ];

  const wasteData = [
    { category: "Expiration / Spoilage", lossETB: 3400, items: "Dairy, Injera" },
    { category: "Preparation / Spills", lossETB: 1200, items: "Espresso, Milk" },
    { category: "Burnt / Failed Extraction", lossETB: 850, items: "Coffee Beans" },
  ];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Day,Gross Sales (ETB),Net Sales (ETB),Orders\n" +
      salesData.map((d) => `${d.day},${d.gross},${d.net},${d.orders}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sable-cafe-report-${activeReport.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report CSV exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-forest dark:text-white tracking-tight">
            Financial & Operational Intelligence
          </h1>
          <p className="text-xs text-sage dark:text-stone-400 mt-1">
            Authoritative revenue statements, VAT liability summaries, payment mixes, and waste reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangePicker />
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] text-xs font-bold text-forest dark:text-white hover:bg-stone-50"
          >
            <Download className="w-3.5 h-3.5 text-meadow" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Segment Buttons */}
      <div className="flex items-center p-1 rounded-2xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] shadow-xs w-fit">
        {(["SALES", "CHANNELS", "WASTE", "CREDIT"] as const).map((rep) => (
          <button
            key={rep}
            type="button"
            onClick={() => setActiveReport(rep)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              activeReport === rep
                ? "bg-forest dark:bg-meadow text-white dark:text-forest shadow-xs"
                : "text-sage hover:text-forest"
            }`}
          >
            {rep === "SALES"
              ? "Gross Revenue"
              : rep === "CHANNELS"
              ? "Payment Mix"
              : rep === "WASTE"
              ? "Food Waste"
              : "Credit Exposure"}
          </button>
        ))}
      </div>

      {/* Report Visualizations */}
      {activeReport === "SALES" && (
        <div className="space-y-6">
          <ChartCard
            title="Weekly Revenue Trajectory (ETB)"
            subtitle="Gross sales vs net sales after 15% VAT statutory remittance"
            periods={["Daily", "Weekly", "Monthly"]}
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#718079" fontSize={11} tickLine={false} />
                  <YAxis stroke="#718079" fontSize={11} tickLine={false} tickFormatter={(v) => `ETB ${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1b2820",
                      borderColor: "#283a2d",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`ETB ${new Intl.NumberFormat("en-US").format(val)}`, ""]}
                  />
                  <Bar dataKey="gross" name="Gross Sales" fill="#48a853" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="net" name="Net Revenue" fill="#ff8a3d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Tabular breakdown */}
          <div className="rounded-2xl border border-border dark:border-[#283a2d] bg-white dark:bg-[#1b2820] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#141f18] border-b border-border dark:border-[#283a2d] text-sage">
                <tr>
                  <th className="p-3 font-semibold">Reporting Day</th>
                  <th className="p-3 font-semibold text-right">Orders Handled</th>
                  <th className="p-3 font-semibold text-right">Estimated VAT (15%)</th>
                  <th className="p-3 font-semibold text-right">Net Revenue</th>
                  <th className="p-3 font-semibold text-right">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-[#283a2d]">
                {salesData.map((d) => (
                  <tr key={d.day} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-forest dark:text-white">{d.day}</td>
                    <td className="p-3 text-right tabular-nums">{d.orders} tickets</td>
                    <td className="p-3 text-right tabular-nums text-sage">{formatETB(d.gross - d.net)}</td>
                    <td className="p-3 text-right tabular-nums font-semibold">{formatETB(d.net)}</td>
                    <td className="p-3 text-right tabular-nums font-black text-meadow-dark">{formatETB(d.gross)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "CHANNELS" && (
        <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Payment Method Settlement Summary
          </h2>
          <div className="space-y-3">
            {channelData.map((c) => (
              <div key={c.channel} className="p-3.5 rounded-xl border border-border dark:border-[#283a2d] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-forest dark:text-white block">{c.channel}</span>
                  <span className="text-[11px] text-sage">Share of weekly receipts</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black tabular-nums text-forest dark:text-white block">
                    {formatETB(c.amount)}
                  </span>
                  <span className="text-meadow-dark font-bold text-[11px]">{c.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === "WASTE" && (
        <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Food Waste & Spoilage Cost Analysis (SRS 5.10)
          </h2>
          <div className="space-y-3">
            {wasteData.map((w) => (
              <div key={w.category} className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-rose-700 dark:text-rose-400 block">{w.category}</span>
                  <span className="text-[11px] text-sage">Impacted items: {w.items}</span>
                </div>
                <span className="text-sm font-black text-rose-600 tabular-nums">
                  {formatETB(w.lossETB)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === "CREDIT" && (
        <div className="bg-white dark:bg-[#1b2820] border border-border dark:border-[#283a2d] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold font-display text-forest dark:text-white">
            Corporate Credit Exposure & Risk Radar
          </h2>
          <p className="text-xs text-sage leading-relaxed">
            Total approved credit line facility across all commercial accounts: <strong>ETB 450,000.00</strong>. Outstanding receivables current ratio: <strong>21.4%</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
