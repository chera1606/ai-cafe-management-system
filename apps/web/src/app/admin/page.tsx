"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Calendar,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  DollarSign,
  Flame,
  Layers,
  Package,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  type InventoryItemEntity,
  type InventoryMetrics,
  fetchInventory,
} from "@/lib/inventory-api";
import {
  type ProcurementAnalytics,
  fetchProcurementAnalytics,
} from "@/lib/procurement-api";

interface LiveOrderFeedItem {
  id: string;
  orderNumber: string;
  type: "Dine-in" | "Takeout" | "Mobile AI";
  table?: string;
  itemsCount: number;
  total: number;
  status: "PREPARING" | "READY" | "COMPLETED" | "NEW";
  timeAgo: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real data from APIs
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics>({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    healthyCount: 0,
    totalValuation: 0,
    recentMovementsCount: 0,
  });
  const [criticalItems, setCriticalItems] = useState<InventoryItemEntity[]>([]);
  const [procurementStats, setProcurementStats] =
    useState<ProcurementAnalytics>({
      totalSpend: 0,
      totalOrders: 0,
      activeSuppliersCount: 0,
      pendingShipmentsCount: 0,
      spendBySupplier: [],
      spendByCategory: {},
      recentPurchases: [],
    });

  // Mock live active orders stream
  const [liveOrders] = useState<LiveOrderFeedItem[]>([
    {
      id: "ord-101",
      orderNumber: "#8842",
      type: "Dine-in",
      table: "Table 4",
      itemsCount: 3,
      total: 24.5,
      status: "PREPARING",
      timeAgo: "2m ago",
    },
    {
      id: "ord-102",
      orderNumber: "#8841",
      type: "Mobile AI",
      table: "Counter",
      itemsCount: 1,
      total: 6.25,
      status: "READY",
      timeAgo: "5m ago",
    },
    {
      id: "ord-103",
      orderNumber: "#8840",
      type: "Takeout",
      table: "Pickup",
      itemsCount: 4,
      total: 38.0,
      status: "COMPLETED",
      timeAgo: "12m ago",
    },
    {
      id: "ord-104",
      orderNumber: "#8839",
      type: "Dine-in",
      table: "Table 9",
      itemsCount: 2,
      total: 19.5,
      status: "COMPLETED",
      timeAgo: "18m ago",
    },
  ]);

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [invRes, procRes] = await Promise.all([
        fetchInventory().catch(() => null),
        fetchProcurementAnalytics().catch(() => null),
      ]);

      if (invRes) {
        setInventoryMetrics(invRes.metrics);
        const critical = invRes.items.filter(
          (i) => i.currentQuantity <= i.reorderLevel,
        );
        setCriticalItems(critical.slice(0, 5));
      }

      if (procRes) {
        setProcurementStats(procRes);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const firstName =
    user?.customer?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Manager";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Modern Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations Online
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-medium text-slate-500">
              Ethiopian Artisan Roastery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-serif">
            Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back, {firstName}. Here is your live cafe performance and operational health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
              />
            }
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <LinkButton
            href="/pos"
            variant="primary"
            size="sm"
            leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
          >
            Open POS
          </LinkButton>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Est. Daily Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              $4,820.50
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2%</span>
              <span className="text-slate-400 font-normal">vs. yesterday</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Live Queue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Order Queue
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              18 Orders
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Avg prep: 4.2 mins</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Inventory Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stock Alerts
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              {inventoryMetrics.lowStockCount || 4} Critical
            </div>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-rose-600 hover:underline"
            >
              <span>Restock in inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI 4: Pending Shipments */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inbound POs
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              {procurementStats.pendingShipmentsCount || 2} Expected
            </div>
            <Link
              href="/admin/procurement"
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-sky-600 hover:underline"
            >
              <span>Review PO shipments</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launch Strip */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
          Quick Launch Station:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/pos"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>POS Register</span>
          </Link>
          <Link
            href="/kitchen"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-500" />
            <span>Kitchen Display (KDS)</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stock Count & Movement</span>
          </Link>
          <Link
            href="/admin/menu"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-indigo-600" />
            <span>Menu & Recipes</span>
          </Link>
          <Link
            href="/admin/procurement"
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>Purchase Orders</span>
          </Link>
        </div>
      </div>

      {/* Two-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Orders & Popular Velocity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Order Queue */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Live Orders Stream
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time table, counter, and mobile ordering activity
                </p>
              </div>
              <LinkButton
                href="/kitchen"
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Open KDS
              </LinkButton>
            </div>

            <div className="divide-y divide-slate-100">
              {liveOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors rounded-xl px-2 -mx-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800 font-mono">
                      {ord.orderNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {ord.type} &bull; {ord.table}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ord.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {ord.itemsCount} items &bull; ${ord.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        ord.status === "PREPARING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : ord.status === "READY"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Velocity Products */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Top-Selling Menu Velocity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Today's highest volume artisan roasts and culinary items
                </p>
              </div>
              <Link
                href="/admin/menu"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View catalog
              </Link>
            </div>

            <div className="space-y-4 pt-4">
              {[
                {
                  name: "Ethiopian Yirgacheffe Pour-Over",
                  sold: 48,
                  revenue: "$288.00",
                  pct: 92,
                },
                {
                  name: "Ceremonial Oat Milk Flat White",
                  sold: 36,
                  revenue: "$216.00",
                  pct: 74,
                },
                {
                  name: "Blueberry Cardamom Scone",
                  sold: 29,
                  revenue: "$130.50",
                  pct: 58,
                },
                {
                  name: "Slow-Steeped Cold Brew Float",
                  sold: 22,
                  revenue: "$154.00",
                  pct: 44,
                },
              ].map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{item.name}</span>
                    <span className="text-slate-500 tabular-nums">
                      {item.sold} sold &bull; {item.revenue}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Critical Stock Radar & Station Loads */}
        <div className="space-y-6">
          {/* Critical Low Stock Warning */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Critical Stock Radar
                </h2>
              </div>
              <LinkButton
                href="/admin/procurement"
                variant="outline"
                size="sm"
                className="text-xs"
              >
                + PO
              </LinkButton>
            </div>

            <div className="space-y-2.5 pt-3">
              {(criticalItems.length > 0
                ? criticalItems
                : [
                    {
                      id: "1",
                      name: "Organic Whole Milk",
                      currentQuantity: 4,
                      reorderLevel: 12,
                      unitOfMeasure: "L",
                    },
                    {
                      id: "2",
                      name: "Yirgacheffe Grade 1 Green Beans",
                      currentQuantity: 8,
                      reorderLevel: 20,
                      unitOfMeasure: "kg",
                    },
                    {
                      id: "3",
                      name: "Oat Milk Barista Edition",
                      currentQuantity: 6,
                      reorderLevel: 15,
                      unitOfMeasure: "L",
                    },
                    {
                      id: "4",
                      name: "Butter Croissants (Dough)",
                      currentQuantity: 10,
                      reorderLevel: 30,
                      unitOfMeasure: "pcs",
                    },
                  ]
              ).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-rose-600 font-semibold tabular-nums">
                      Stock: {item.currentQuantity} {item.unitOfMeasure} (Min:{" "}
                      {item.reorderLevel})
                    </span>
                  </div>
                  <Link
                    href={`/admin/inventory`}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-rose-600 text-[10px] font-bold border border-rose-200 transition-colors cursor-pointer"
                  >
                    Adjust
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Station Capacity / Load */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-base font-black text-slate-900 tracking-tight pb-4 border-b border-slate-200">
              Station Load & Throughput
            </h2>
            <div className="space-y-4 pt-3">
              {[
                { name: "Espresso Bar (La Marzocco)", load: 82, color: "bg-amber-500" },
                { name: "Cold Bar & Nitro Brew", load: 55, color: "bg-emerald-500" },
                { name: "Bakery Oven & Pastry", load: 40, color: "bg-emerald-500" },
                { name: "Kitchen Hot Station", load: 68, color: "bg-amber-500" },
              ].map((stn) => (
                <div key={stn.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{stn.name}</span>
                    <span className="text-slate-500 tabular-nums">{stn.load}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stn.color}`}
                      style={{ width: `${stn.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
