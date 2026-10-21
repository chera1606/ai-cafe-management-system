import { apiClient } from "./api-client";

export type InventoryDepartment = "BARISTA" | "KITCHEN" | "ALL";
export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export type MovementType =
  | "PURCHASE"
  | "CONSUMPTION"
  | "WASTE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "TRANSFER";

export interface InventoryItemEntity {
  id: string;
  ingredientId: string;
  name: string;
  departmentId: string | null;
  department: "BARISTA" | "KITCHEN";
  currentQuantity: number;
  unitOfMeasure: string;
  reorderLevel: number;
  unitCost: number;
  status: InventoryStatus;
  supplier?: string | null;
  lastRestockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementEntity {
  id: string;
  inventoryItemId: string;
  ingredientName?: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number | null;
  totalCost?: number | null;
  referenceType?: string | null;
  referenceId?: string | null;
  batchReference?: string | null;
  expirationDate?: string | null;
  notes?: string | null;
  occurredAt: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryBatchEntity {
  id: string;
  inventoryItemId: string;
  batchReference: string;
  quantity: number;
  unitCost: number;
  receivedAt: string;
  expirationDate: string | null;
  status: "ACTIVE" | "DEPLETED" | "EXPIRED";
}

export interface InventoryMetrics {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyCount: number;
  totalValuation: number;
  recentMovementsCount: number;
}

export interface InventoryItemDetail extends InventoryItemEntity {
  recentMovements: StockMovementEntity[];
  activeBatches: InventoryBatchEntity[];
}

export interface InventoryListResponse {
  items: InventoryItemEntity[];
  total: number;
  metrics: InventoryMetrics;
}

// Fallback data for offline preview mode
const FALLBACK_PANTRY_ITEMS: InventoryItemEntity[] = [
  {
    id: "22222222-1111-4000-8000-000000000001",
    ingredientId: "22222222-1111-4000-8000-000000000001",
    name: "Yirgacheffe Grade 1 Green Coffee Beans",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 42.5,
    unitOfMeasure: "kg",
    reorderLevel: 15.0,
    unitCost: 14.5,
    status: "IN_STOCK",
    supplier: "Yirgacheffe Coffee Farmers Cooperative",
    lastRestockedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000002",
    ingredientId: "22222222-1111-4000-8000-000000000002",
    name: "Sidama High-Roast Washed Beans",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 8.0,
    unitOfMeasure: "kg",
    reorderLevel: 12.0,
    unitCost: 16.0,
    status: "LOW_STOCK",
    supplier: "Sidama Organic Specialty Union",
    lastRestockedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000003",
    ingredientId: "22222222-1111-4000-8000-000000000003",
    name: "Harar Longberry Sun-Dried Beans",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 14.0,
    unitOfMeasure: "kg",
    reorderLevel: 8.0,
    unitCost: 17.5,
    status: "IN_STOCK",
    supplier: "Eastern Highlands Bean Estate",
    lastRestockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000004",
    ingredientId: "22222222-1111-4000-8000-000000000004",
    name: "Organic Whole Milk (Barista Grade)",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 32.0,
    unitOfMeasure: "l",
    reorderLevel: 12.0,
    unitCost: 2.2,
    status: "IN_STOCK",
    supplier: "Sebeta Organic Dairy Farm",
    lastRestockedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000005",
    ingredientId: "22222222-1111-4000-8000-000000000005",
    name: "Barista Oat Microfoam Milk",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 4.5,
    unitOfMeasure: "l",
    reorderLevel: 10.0,
    unitCost: 3.8,
    status: "LOW_STOCK",
    supplier: "Highland Oat Millers",
    lastRestockedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000006",
    ingredientId: "22222222-1111-4000-8000-000000000006",
    name: "Wild Mountain Acacia Honey",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 2.8,
    unitOfMeasure: "kg",
    reorderLevel: 5.0,
    unitCost: 18.0,
    status: "LOW_STOCK",
    supplier: "Bonga Biosphere Honey Association",
    lastRestockedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000007",
    ingredientId: "22222222-1111-4000-8000-000000000007",
    name: "Black Cardamom Pods (Korerima)",
    departmentId: null,
    department: "BARISTA",
    currentQuantity: 3.0,
    unitOfMeasure: "kg",
    reorderLevel: 1.0,
    unitCost: 28.0,
    status: "IN_STOCK",
    supplier: "Kaffa Forest Spice Collectors",
    lastRestockedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000008",
    ingredientId: "22222222-1111-4000-8000-000000000008",
    name: "Ancient Brown Teff Grain Flour",
    departmentId: null,
    department: "KITCHEN",
    currentQuantity: 55.0,
    unitOfMeasure: "kg",
    reorderLevel: 20.0,
    unitCost: 3.5,
    status: "IN_STOCK",
    supplier: "Debre Zeit Agro Mill",
    lastRestockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000009",
    ingredientId: "22222222-1111-4000-8000-000000000009",
    name: "Clarified Spiced Butter (Niter Kibbeh)",
    departmentId: null,
    department: "KITCHEN",
    currentQuantity: 3.5,
    unitOfMeasure: "kg",
    reorderLevel: 6.0,
    unitCost: 22.0,
    status: "LOW_STOCK",
    supplier: "Sululta Traditional Churnery",
    lastRestockedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000010",
    ingredientId: "22222222-1111-4000-8000-000000000010",
    name: "Artisanal Berbere Sun-Dried Spice Blend",
    departmentId: null,
    department: "KITCHEN",
    currentQuantity: 18.0,
    unitOfMeasure: "kg",
    reorderLevel: 5.0,
    unitCost: 12.0,
    status: "IN_STOCK",
    supplier: "Meskell Spice Traders",
    lastRestockedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000011",
    ingredientId: "22222222-1111-4000-8000-000000000011",
    name: "Organic Prime Beef Tenderloin",
    departmentId: null,
    department: "KITCHEN",
    currentQuantity: 0.0,
    unitOfMeasure: "kg",
    reorderLevel: 8.0,
    unitCost: 24.0,
    status: "OUT_OF_STOCK",
    supplier: "Adama Highland Ranches",
    lastRestockedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-1111-4000-8000-000000000012",
    ingredientId: "22222222-1111-4000-8000-000000000012",
    name: "Slow-Stew Fava Beans",
    departmentId: null,
    department: "KITCHEN",
    currentQuantity: 28.0,
    unitOfMeasure: "kg",
    reorderLevel: 10.0,
    unitCost: 4.5,
    status: "IN_STOCK",
    supplier: "Gonder Pulse Growers",
    lastRestockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function computeFallbackMetrics(items: InventoryItemEntity[]): InventoryMetrics {
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let healthyCount = 0;
  let totalValuation = 0;

  for (const item of items) {
    if (item.currentQuantity <= 0) {
      outOfStockCount++;
    } else if (item.currentQuantity <= item.reorderLevel) {
      lowStockCount++;
    } else {
      healthyCount++;
    }
    totalValuation += item.currentQuantity * (item.unitCost || 0);
  }

  return {
    totalItems: items.length,
    lowStockCount,
    outOfStockCount,
    healthyCount,
    totalValuation: Number(totalValuation.toFixed(2)),
    recentMovementsCount: 24,
  };
}

export async function fetchInventory(params?: {
  department?: string;
  status?: string;
  search?: string;
}): Promise<InventoryListResponse> {
  const query = new URLSearchParams();
  if (params?.department && params.department !== "ALL") {
    query.set("department", params.department);
  }
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.search?.trim()) {
    query.set("search", params.search.trim());
  }

  const endpoint = `/inventory${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    return await apiClient<InventoryListResponse>(endpoint, { skipAuth: false });
  } catch {
    // Graceful offline fallback
    let filtered = [...FALLBACK_PANTRY_ITEMS];
    if (params?.department && params.department !== "ALL") {
      filtered = filtered.filter((i) => i.department === params.department);
    }
    if (params?.status) {
      filtered = filtered.filter((i) => i.status === params.status);
    }
    if (params?.search?.trim()) {
      const term = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.supplier?.toLowerCase().includes(term),
      );
    }

    return {
      items: filtered,
      total: filtered.length,
      metrics: computeFallbackMetrics(FALLBACK_PANTRY_ITEMS),
    };
  }
}

export async function fetchLowStockAlerts(): Promise<InventoryItemEntity[]> {
  try {
    return await apiClient<InventoryItemEntity[]>("/inventory/alerts/low-stock");
  } catch {
    return FALLBACK_PANTRY_ITEMS.filter(
      (i) => i.currentQuantity <= i.reorderLevel,
    );
  }
}

export async function fetchInventoryMetrics(): Promise<InventoryMetrics> {
  try {
    return await apiClient<InventoryMetrics>("/inventory/metrics");
  } catch {
    return computeFallbackMetrics(FALLBACK_PANTRY_ITEMS);
  }
}

export async function fetchInventoryItemDetail(
  id: string,
): Promise<InventoryItemDetail> {
  try {
    return await apiClient<InventoryItemDetail>(`/inventory/${id}`);
  } catch {
    const item =
      FALLBACK_PANTRY_ITEMS.find((i) => i.id === id) || FALLBACK_PANTRY_ITEMS[0]!;
    return {
      ...item,
      recentMovements: [
        {
          id: "mov-demo-1",
          inventoryItemId: item.id,
          movementType: "PURCHASE",
          quantity: 15.0,
          unitCost: item.unitCost,
          totalCost: Number((15.0 * item.unitCost).toFixed(2)),
          referenceType: "SUPPLIER_INVOICE",
          notes: "Scheduled weekly replenishment delivery",
          occurredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          createdBy: "00000000-0000-0000-0000-000000000000",
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ],
      activeBatches: [
        {
          id: "batch-demo-1",
          inventoryItemId: item.id,
          batchReference: "BATCH-ETH-2026-A1",
          quantity: item.currentQuantity,
          unitCost: item.unitCost,
          receivedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          expirationDate: "2026-12-31",
          status: "ACTIVE",
        },
      ],
    };
  }
}

export async function recordStockMovement(data: {
  inventoryItemId: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  batchReference?: string;
  expirationDate?: string;
  notes?: string;
}): Promise<StockMovementEntity> {
  return apiClient<StockMovementEntity>("/inventory/movements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reconcileInventoryStock(
  id: string,
  actualCount: number,
  notes?: string,
): Promise<StockMovementEntity> {
  return apiClient<StockMovementEntity>(`/inventory/${id}/reconcile`, {
    method: "POST",
    body: JSON.stringify({ actualCount, notes }),
  });
}

export async function updateInventoryItem(
  id: string,
  data: {
    reorderLevel?: number;
    department?: "BARISTA" | "KITCHEN";
    unitCost?: number;
    supplier?: string;
  },
): Promise<InventoryItemEntity> {
  return apiClient<InventoryItemEntity>(`/inventory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export type WasteReason =
  | "EXPIRED"
  | "SPOILED"
  | "DAMAGED"
  | "SPILLAGE"
  | "PREPARATION_ERROR"
  | "OVERPRODUCTION"
  | "OTHER";

export interface WasteRecordEntity {
  id: string;
  inventoryItemId: string;
  ingredientName: string;
  department: "BARISTA" | "KITCHEN";
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  estimatedCost: number;
  reason: WasteReason;
  recordedBy: string;
  notes?: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface WasteAnalytics {
  totalWasteCost: number;
  totalWasteQuantity: number;
  totalIncidents: number;
  byReason: Record<string, { count: number; cost: number }>;
  byDepartment: Record<string, { count: number; cost: number }>;
  recentRecords: WasteRecordEntity[];
}

export interface RecipeCostBreakdown {
  menuItemId: string;
  name: string;
  ingredients: Array<{
    inventoryItemId: string;
    ingredientName: string;
    quantity: number;
    unitOfMeasure: string;
    unitCost: number;
    subtotalCost: number;
  }>;
  totalProductionCost: number;
}

const FALLBACK_WASTE_RECORDS: WasteRecordEntity[] = [
  {
    id: "waste-demo-1",
    inventoryItemId: "22222222-1111-4000-8000-000000000005",
    ingredientName: "Barista Oat Microfoam Milk",
    department: "BARISTA",
    quantity: 1.5,
    unitOfMeasure: "l",
    unitCost: 3.8,
    estimatedCost: 5.7,
    reason: "EXPIRED",
    recordedBy: "Staff Lead",
    notes: "Opened carton exceeded 7-day holding period",
    recordedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "waste-demo-2",
    inventoryItemId: "22222222-1111-4000-8000-000000000007",
    ingredientName: "Black Cardamom Pods (Korerima)",
    department: "BARISTA",
    quantity: 0.15,
    unitOfMeasure: "kg",
    unitCost: 28.0,
    estimatedCost: 4.2,
    reason: "SPILLAGE",
    recordedBy: "Morning Barista",
    notes: "Grinder hopper jar accidentally tipped during peak service",
    recordedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "waste-demo-3",
    inventoryItemId: "22222222-1111-4000-8000-000000000009",
    ingredientName: "Clarified Spiced Butter (Niter Kibbeh)",
    department: "KITCHEN",
    quantity: 0.35,
    unitOfMeasure: "kg",
    unitCost: 22.0,
    estimatedCost: 7.7,
    reason: "PREPARATION_ERROR",
    recordedBy: "Line Cook",
    notes: "Overheated skillet burned butter portion during prep",
    recordedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export async function recordWaste(data: {
  inventoryItemId: string;
  quantity: number;
  reason: WasteReason;
  department?: "BARISTA" | "KITCHEN";
  notes?: string;
}): Promise<WasteRecordEntity> {
  return apiClient<WasteRecordEntity>("/inventory/waste", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchWasteRecords(params?: {
  department?: string;
  reason?: string;
}): Promise<WasteRecordEntity[]> {
  const query = new URLSearchParams();
  if (params?.department && params.department !== "ALL") {
    query.set("department", params.department);
  }
  if (params?.reason) {
    query.set("reason", params.reason);
  }

  const endpoint = `/inventory/waste/records${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    return await apiClient<WasteRecordEntity[]>(endpoint);
  } catch {
    let filtered = [...FALLBACK_WASTE_RECORDS];
    if (params?.department && params.department !== "ALL") {
      filtered = filtered.filter((r) => r.department === params.department);
    }
    if (params?.reason) {
      filtered = filtered.filter((r) => r.reason === params.reason);
    }
    return filtered;
  }
}

export async function fetchWasteAnalytics(): Promise<WasteAnalytics> {
  try {
    return await apiClient<WasteAnalytics>("/inventory/waste/analytics");
  } catch {
    let totalWasteCost = 0;
    let totalWasteQuantity = 0;
    const byReason: Record<string, { count: number; cost: number }> = {};
    const byDepartment: Record<string, { count: number; cost: number }> = {
      BARISTA: { count: 0, cost: 0 },
      KITCHEN: { count: 0, cost: 0 },
    };

    for (const r of FALLBACK_WASTE_RECORDS) {
      totalWasteCost += r.estimatedCost;
      totalWasteQuantity += r.quantity;

      const reasonEntry = byReason[r.reason] ?? { count: 0, cost: 0 };
      reasonEntry.count += 1;
      reasonEntry.cost = Number((reasonEntry.cost + r.estimatedCost).toFixed(2));
      byReason[r.reason] = reasonEntry;

      const deptEntry = byDepartment[r.department] ?? { count: 0, cost: 0 };
      deptEntry.count += 1;
      deptEntry.cost = Number((deptEntry.cost + r.estimatedCost).toFixed(2));
      byDepartment[r.department] = deptEntry;
    }

    return {
      totalWasteCost: Number(totalWasteCost.toFixed(2)),
      totalWasteQuantity: Number(totalWasteQuantity.toFixed(3)),
      totalIncidents: FALLBACK_WASTE_RECORDS.length,
      byReason,
      byDepartment,
      recentRecords: FALLBACK_WASTE_RECORDS,
    };
  }
}

export async function fetchRecipeCost(
  menuItemId: string,
): Promise<RecipeCostBreakdown> {
  return apiClient<RecipeCostBreakdown>(`/inventory/recipes/${menuItemId}/cost`);
}

export async function depleteStockByRecipe(data: {
  orderId?: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}): Promise<StockMovementEntity[]> {
  return apiClient<StockMovementEntity[]>("/inventory/recipes/consume", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
