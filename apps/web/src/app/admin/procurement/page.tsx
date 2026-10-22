"use client";

import {
  AlertTriangle,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Coffee,
  DollarSign,
  FileText,
  Lock,
  Package,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { type InventoryItemEntity, fetchInventory } from "@/lib/inventory-api";
import {
  type ProcurementAnalytics,
  type PurchaseEntity,
  type SupplierEntity,
  fetchProcurementAnalytics,
  fetchPurchases,
  fetchSuppliers,
} from "@/lib/procurement-api";
import { AddSupplierModal } from "./add-supplier-modal";
import { CreatePoModal } from "./create-po-modal";
import { ProcurementAnalyticsPanel } from "./procurement-analytics-panel";
import { ProcurementHeader } from "./procurement-header";
import { ProcurementMetricsBar } from "./procurement-metrics-bar";
import { PurchaseOrdersTable } from "./purchase-orders-table";
import { ReceivePoModal } from "./receive-po-modal";
import { SupplierDirectory } from "./supplier-directory";

type ProcurementTab = "ORDERS" | "SUPPLIERS" | "ANALYTICS";

export default function AdminProcurementPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<ProcurementTab>("ORDERS");
  const [suppliers, setSuppliers] = useState<SupplierEntity[]>([]);
  const [purchases, setPurchases] = useState<PurchaseEntity[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemEntity[]>([]);
  const [analytics, setAnalytics] = useState<ProcurementAnalytics>({
    totalSpend: 0,
    totalOrders: 0,
    activeSuppliersCount: 0,
    pendingShipmentsCount: 0,
    spendBySupplier: [],
    spendByCategory: {},
    recentPurchases: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [receivePoTarget, setReceivePoTarget] = useState<PurchaseEntity | null>(null);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | undefined>();

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [supData, purData, statsData, invData] = await Promise.all([
        fetchSuppliers(),
        fetchPurchases(),
        fetchProcurementAnalytics(),
        fetchInventory().catch(() => ({ items: [], metrics: { totalItems: 0, lowStockCount: 0, outOfStockCount: 0, healthyCount: 0, totalValuation: 0, recentMovementsCount: 0 } })),
      ]);

      setSuppliers(supData);
      setPurchases(purData);
      setAnalytics(statsData);
      setInventoryItems(invData.items || []);
    } catch {
      // Fallback data handled gracefully in API client
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreatePo = (supplier?: SupplierEntity) => {
    if (supplier) {
      setPreselectedSupplierId(supplier.id);
    } else {
      setPreselectedSupplierId(undefined);
    }
    setIsCreatePoOpen(true);
  };

  const handleReceiveShipment = (po: PurchaseEntity) => {
    setReceivePoTarget(po);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-meadow border-t-transparent animate-spin" />
          <p className="text-xs text-sage font-medium">
            Verifying staff authorization...
          </p>
        </div>
      </div>
    );
  }

  const isAdminOrManager =
    isAuthenticated &&
    user?.roles?.some((role) =>
      ["admin", "administrator", "owner", "manager", "operations"].includes(
        role.toLowerCase(),
      ),
    );

  if (!isAdminOrManager) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream text-forest text-center">
        <div className="p-4 rounded-3xl bg-meadow-tint text-meadow-dark mb-4 shadow-sm border border-meadow/20">
          <ShieldAlert className="w-10 h-10 text-meadow" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-forest mb-2">
          Management Access Restricted
        </h1>
        <p className="text-sm text-sage max-w-md mb-6 leading-relaxed">
          The Procurement & Sourcing Hub is restricted to Admin and Manager
          staff members. Please sign in with an authorized operational account.
        </p>
        <div className="flex items-center gap-3">
          <LinkButton href="/" variant="outline" size="sm">
            Return Home
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
    <div className="min-h-screen flex flex-col bg-cream text-forest">
      {/* Header */}
      <ProcurementHeader
        onRefresh={() => loadData(true)}
        onOpenCreatePo={() => handleOpenCreatePo()}
        onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Overview */}
        <ProcurementMetricsBar
          analytics={analytics}
          onFilterStatus={(status) => {
            setStatusFilter(status);
            setActiveTab("ORDERS");
          }}
          activeStatusFilter={statusFilter}
        />

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("ORDERS")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ORDERS"
                ? "bg-forest text-white shadow-sm"
                : "text-sage hover:text-forest hover:bg-cream-alt"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Purchase Orders & Inbound
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "ORDERS"
                  ? "bg-white/20 text-white"
                  : "bg-cream-alt text-sage"
              }`}
            >
              {purchases.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SUPPLIERS")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "SUPPLIERS"
                ? "bg-forest text-white shadow-sm"
                : "text-sage hover:text-forest hover:bg-cream-alt"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Supplier Directory
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "SUPPLIERS"
                  ? "bg-white/20 text-white"
                  : "bg-cream-alt text-sage"
              }`}
            >
              {suppliers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ANALYTICS")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ANALYTICS"
                ? "bg-forest text-white shadow-sm"
                : "text-sage hover:text-forest hover:bg-cream-alt"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Sourcing & Spend Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "ORDERS" && (
          <PurchaseOrdersTable
            purchases={purchases}
            onReceivePo={handleReceiveShipment}
            onOpenCreatePo={() => handleOpenCreatePo()}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}

        {activeTab === "SUPPLIERS" && (
          <SupplierDirectory
            suppliers={suppliers}
            onSelectSupplierForPo={handleOpenCreatePo}
            onOpenAddSupplier={() => setIsAddSupplierOpen(true)}
          />
        )}

        {activeTab === "ANALYTICS" && (
          <ProcurementAnalyticsPanel analytics={analytics} />
        )}
      </main>

      {/* Modals */}
      <CreatePoModal
        isOpen={isCreatePoOpen}
        onClose={() => setIsCreatePoOpen(false)}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
        preselectedSupplierId={preselectedSupplierId}
        onSuccess={() => loadData(true)}
      />

      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSuccess={() => loadData(true)}
      />

      <ReceivePoModal
        isOpen={Boolean(receivePoTarget)}
        onClose={() => setReceivePoTarget(null)}
        purchase={receivePoTarget}
        onSuccess={() => loadData(true)}
      />
    </div>
  );
}
