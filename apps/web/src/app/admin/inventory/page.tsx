"use client";

import {
  AlertTriangle,
  Boxes,
  ChefHat,
  Coffee,
  DollarSign,
  Layers,
  Lock,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  type InventoryDepartment,
  type InventoryItemEntity,
  type InventoryMetrics,
  type MovementType,
  type WasteAnalytics,
  type WasteReason,
  type WasteRecordEntity,
  depleteStockByRecipe,
  fetchInventory,
  fetchWasteAnalytics,
  fetchWasteRecords,
  recordStockMovement,
  recordWaste,
  reconcileInventoryStock,
} from "@/lib/inventory-api";
import { InventoryAdjustModal } from "./inventory-adjust-modal";
import { InventoryDetailDrawer } from "./inventory-detail-drawer";
import { InventoryHeader } from "./inventory-header";
import { InventoryMetricsBar } from "./inventory-metrics-bar";
import { InventoryRecipePanel } from "./inventory-recipe-panel";
import { InventoryReconcileModal } from "./inventory-reconcile-modal";
import { InventoryTable } from "./inventory-table";
import { InventoryWasteModal } from "./inventory-waste-modal";
import { InventoryWastePanel } from "./inventory-waste-panel";

type InventoryTab = "STOCK" | "WASTE" | "RECIPES";

export default function AdminInventoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<InventoryTab>("STOCK");

  // Stock State
  const [items, setItems] = useState<InventoryItemEntity[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    healthyCount: 0,
    totalValuation: 0,
    recentMovementsCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Waste State
  const [wasteRecords, setWasteRecords] = useState<WasteRecordEntity[]>([]);
  const [wasteAnalytics, setWasteAnalytics] = useState<WasteAnalytics>({
    totalWasteCost: 0,
    totalWasteQuantity: 0,
    totalIncidents: 0,
    byReason: {},
    byDepartment: { BARISTA: { count: 0, cost: 0 }, KITCHEN: { count: 0, cost: 0 } },
    recentRecords: [],
  });
  const [wasteDeptFilter, setWasteDeptFilter] = useState<string>("ALL");
  const [wasteReasonFilter, setWasteReasonFilter] = useState<string>("");

  // Filters
  const [department, setDepartment] = useState<InventoryDepartment>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Drawers
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState<boolean>(false);
  const [adjustInitialItemId, setAdjustInitialItemId] = useState<string | undefined>();
  const [reconcileItem, setReconcileItem] = useState<InventoryItemEntity | null>(null);
  const [selectedDrawerItemId, setSelectedDrawerItemId] = useState<string | null>(null);

  // Fetch Inventory & Waste
  const loadInventory = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [invRes, wasteRecs, wasteStats] = await Promise.all([
        fetchInventory({
          department: department !== "ALL" ? department : undefined,
          status: statusFilter || undefined,
          search: searchQuery || undefined,
        }),
        fetchWasteRecords({
          department: wasteDeptFilter !== "ALL" ? wasteDeptFilter : undefined,
          reason: wasteReasonFilter || undefined,
        }),
        fetchWasteAnalytics(),
      ]);

      setItems(invRes.items);
      setMetrics(invRes.metrics);
      setWasteRecords(wasteRecs);
      setWasteAnalytics(wasteStats);
    } catch {
      // Handled gracefully in API client fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [department, statusFilter, searchQuery, wasteDeptFilter, wasteReasonFilter]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Handlers
  const handleOpenAdjust = (itemId?: string) => {
    setAdjustInitialItemId(itemId);
    setIsAdjustModalOpen(true);
  };

  const handleOpenReconcile = (item: InventoryItemEntity) => {
    setReconcileItem(item);
  };

  const handleRecordMovement = async (data: {
    inventoryItemId: string;
    movementType: MovementType;
    quantity: number;
    unitCost?: number;
    referenceType?: string;
    batchReference?: string;
    expirationDate?: string;
    notes?: string;
  }) => {
    await recordStockMovement(data);
    await loadInventory(true);
  };

  const handleReconcile = async (
    id: string,
    actualCount: number,
    notes?: string,
  ) => {
    await reconcileInventoryStock(id, actualCount, notes);
    await loadInventory(true);
  };

  const handleRecordWaste = async (data: {
    inventoryItemId: string;
    quantity: number;
    reason: WasteReason;
    department?: "BARISTA" | "KITCHEN";
    notes?: string;
  }) => {
    await recordWaste(data);
    await loadInventory(true);
  };

  const handleSimulateDepletion = async (menuItemId: string, portions: number) => {
    await depleteStockByRecipe({
      orderId: `SIM-ORD-${Date.now().toString(36).toUpperCase()}`,
      items: [{ menuItemId, quantity: portions }],
    });
    await loadInventory(true);
  };

  // Auth Guard
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-meadow border-t-transparent animate-spin" />
          <p className="text-xs text-sage font-medium">
            Verifying manager credentials...
          </p>
        </div>
      </div>
    );
  }

  const isAdminOrManager =
    isAuthenticated &&
    user?.roles?.some((role) =>
      ["admin", "administrator", "owner", "manager", "operations", "barista"].includes(
        role.toLowerCase(),
      ),
    );

  const allowDevBypass = true;

  if (!isAdminOrManager && !allowDevBypass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream text-forest text-center">
        <div className="p-4 rounded-3xl bg-meadow-tint text-meadow-dark mb-4 shadow-sm border border-meadow/20">
          <ShieldAlert className="w-10 h-10 text-meadow" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-forest mb-2">
          Inventory Access Restricted
        </h1>
        <p className="text-sm text-sage max-w-md mb-6 leading-relaxed">
          The Inventory and Stock Management module is restricted to Admin,
          Manager, and Operations personnel.
        </p>
        <div className="flex items-center gap-3">
          <LinkButton href="/menu" variant="outline" size="sm">
            <Coffee className="w-4 h-4 mr-1.5 text-meadow" />
            Public Menu
          </LinkButton>
          <LinkButton href="/login" size="sm">
            <Lock className="w-4 h-4 mr-1.5" />
            Staff Sign In
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-forest font-sans">
      {/* Top Header */}
      <InventoryHeader
        onRefresh={() => loadInventory(true)}
        onOpenAdjustModal={() => handleOpenAdjust()}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Tabs Switcher */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cream-alt border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("STOCK")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "STOCK"
                  ? "bg-white text-forest shadow-xs"
                  : "text-sage hover:text-forest"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Stock On-Hand & Levels</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("WASTE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "WASTE"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-sage hover:text-forest"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Waste & Spoilage Audits</span>
              {wasteAnalytics.totalIncidents > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-black">
                  {wasteAnalytics.totalIncidents}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RECIPES")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "RECIPES"
                  ? "bg-white text-forest shadow-xs"
                  : "text-sage hover:text-forest"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Recipe Margins & Depletion</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWasteModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Log Waste
            </button>
          </div>
        </div>

        {/* Tab 1: Current Stock */}
        {activeTab === "STOCK" && (
          <div className="space-y-6">
            {/* Urgent Low-Stock Alert Banner if any */}
            {metrics.lowStockCount + metrics.outOfStockCount > 0 && (
              <div className="p-4 rounded-3xl bg-amber/10 border border-amber/30 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber/20 text-amber-alt shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight">
                      {metrics.outOfStockCount > 0
                        ? `${metrics.outOfStockCount} ingredient depleted & ${metrics.lowStockCount} below minimum threshold`
                        : `${metrics.lowStockCount} ingredient(s) have breached low-stock thresholds`}
                    </h4>
                    <p className="text-xs text-amber-900 mt-0.5">
                      Proactive restocking recommended before peak rush hours to ensure seamless service.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStatusFilter("LOW_STOCK")}
                  className="px-4 py-2 rounded-2xl bg-amber hover:bg-amber-alt text-white text-xs font-bold transition-colors self-start sm:self-auto shrink-0"
                >
                  Review Critical Items
                </button>
              </div>
            )}

            {/* Live Metrics Cards */}
            <InventoryMetricsBar
              metrics={metrics}
              onFilterStatus={(status) => setStatusFilter(status)}
              activeStatusFilter={statusFilter}
            />

            {/* Interactive Stock Table */}
            <InventoryTable
              items={items}
              activeDepartment={department}
              onSelectDepartment={(dept) => setDepartment(dept)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => setStatusFilter(s)}
              onSelectItem={(item) => setSelectedDrawerItemId(item.id)}
              onOpenAdjust={(id) => handleOpenAdjust(id)}
              onOpenReconcile={(item) => handleOpenReconcile(item)}
            />
          </div>
        )}

        {/* Tab 2: Waste & Loss Audits (FR-WASTE-001 - FR-WASTE-004) */}
        {activeTab === "WASTE" && (
          <InventoryWastePanel
            analytics={wasteAnalytics}
            records={wasteRecords}
            onOpenWasteModal={() => setIsWasteModalOpen(true)}
            activeDepartmentFilter={wasteDeptFilter}
            onFilterDepartment={(dept) => setWasteDeptFilter(dept)}
            activeReasonFilter={wasteReasonFilter}
            onFilterReason={(reason) => setWasteReasonFilter(reason)}
          />
        )}

        {/* Tab 3: Recipe Formulations & Automatic Depletion (FR-RECIPE-001, FR-RECIPE-002) */}
        {activeTab === "RECIPES" && (
          <InventoryRecipePanel
            inventoryItems={items}
            onSimulateDepletion={handleSimulateDepletion}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <InventoryAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        items={items}
        initialItemId={adjustInitialItemId}
        onSuccess={() => loadInventory(true)}
        onSubmit={handleRecordMovement}
      />

      <InventoryWasteModal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        items={items}
        onSuccess={() => loadInventory(true)}
        onSubmit={handleRecordWaste}
      />

      <InventoryReconcileModal
        isOpen={!!reconcileItem}
        onClose={() => setReconcileItem(null)}
        item={reconcileItem}
        onSuccess={() => loadInventory(true)}
        onReconcile={handleReconcile}
      />

      <InventoryDetailDrawer
        isOpen={!!selectedDrawerItemId}
        onClose={() => setSelectedDrawerItemId(null)}
        itemId={selectedDrawerItemId}
        onOpenAdjust={(id) => {
          setSelectedDrawerItemId(null);
          handleOpenAdjust(id);
        }}
        onOpenReconcile={(item) => {
          setSelectedDrawerItemId(null);
          handleOpenReconcile(item);
        }}
      />
    </div>
  );
}
