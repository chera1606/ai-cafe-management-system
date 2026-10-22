import { apiClient } from "./api-client";

export type SupplierStatus = "ACTIVE" | "INACTIVE";
export type PurchaseStatus = "ORDERED" | "RECEIVED" | "CANCELLED";

export interface SupplierEntity {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category: string;
  leadTimeDays: number;
  status: SupplierStatus;
  totalOrdersCount: number;
  totalSpend: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItemEntity {
  id: string;
  purchaseId: string;
  inventoryItemId: string;
  ingredientName?: string;
  quantity: number;
  unitOfMeasure?: string;
  unitCost: number;
  totalCost: number;
  batchReference?: string | null;
  expirationDate?: string | null;
}

export interface PurchaseEntity {
  id: string;
  supplierId: string;
  supplierName?: string;
  purchaseReference: string;
  purchaseDate: string;
  receivedDate?: string | null;
  status: PurchaseStatus;
  totalCost: number;
  notes?: string | null;
  items: PurchaseItemEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementAnalytics {
  totalSpend: number;
  totalOrders: number;
  activeSuppliersCount: number;
  pendingShipmentsCount: number;
  spendBySupplier: Array<{ supplierName: string; totalSpend: number; orderCount: number }>;
  spendByCategory: Record<string, number>;
  recentPurchases: PurchaseEntity[];
}

const FALLBACK_SUPPLIERS: SupplierEntity[] = [
  {
    id: "55555555-1111-4000-8000-000000000001",
    name: "Yirgacheffe Coffee Farmers Cooperative Union",
    phone: "+251 11 662 4589",
    email: "procurement@yirgacheffe-union.et",
    address: "Gedeo Zone, Dilla, Southern Ethiopia",
    category: "Specialty Coffee",
    leadTimeDays: 3,
    status: "ACTIVE",
    totalOrdersCount: 4,
    totalSpend: 2900.0,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "55555555-1111-4000-8000-000000000002",
    name: "Sidama Organic Specialty Union",
    phone: "+251 46 220 1834",
    email: "sales@sidamacoffee.com",
    address: "Hawassa Industrial Hub, Sidama",
    category: "Specialty Coffee",
    leadTimeDays: 4,
    status: "ACTIVE",
    totalOrdersCount: 2,
    totalSpend: 1280.0,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "55555555-1111-4000-8000-000000000003",
    name: "Sebeta Organic Dairy Farm",
    phone: "+251 11 338 2190",
    email: "orders@sebetadairy.et",
    address: "Sebeta Agro-Corridor, Oromia",
    category: "Dairy & Milk",
    leadTimeDays: 1,
    status: "ACTIVE",
    totalOrdersCount: 8,
    totalSpend: 704.0,
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "55555555-1111-4000-8000-000000000004",
    name: "Sululta Traditional Churnery",
    phone: "+251 11 884 1022",
    email: "contact@sulultabutter.et",
    address: "Sululta Highlands, Oromia",
    category: "Traditional Butter (Kibbeh)",
    leadTimeDays: 2,
    status: "ACTIVE",
    totalOrdersCount: 3,
    totalSpend: 462.0,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "55555555-1111-4000-8000-000000000005",
    name: "Meskell Spice Traders",
    phone: "+251 11 278 9450",
    email: "info@meskellspices.et",
    address: "Addis Merkato, Central Spice District",
    category: "Artisanal Spices",
    leadTimeDays: 2,
    status: "ACTIVE",
    totalOrdersCount: 2,
    totalSpend: 360.0,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "55555555-1111-4000-8000-000000000006",
    name: "Debre Zeit Ancient Agro Mill",
    phone: "+251 11 433 8011",
    email: "orders@debrezeitmill.et",
    address: "Bishoftu Grain Terminal",
    category: "Grains & Teff",
    leadTimeDays: 3,
    status: "ACTIVE",
    totalOrdersCount: 3,
    totalSpend: 630.0,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "55555555-1111-4000-8000-000000000007",
    name: "Bonga Biosphere Honey Association",
    phone: "+251 47 331 0945",
    email: "wildhoney@kaffa-bonga.et",
    address: "Kaffa Biosphere Reserve, Bonga",
    category: "Wild Mountain Honey",
    leadTimeDays: 5,
    status: "ACTIVE",
    totalOrdersCount: 2,
    totalSpend: 360.0,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FALLBACK_PURCHASES: PurchaseEntity[] = [
  {
    id: "66666666-1111-4000-8000-000000000001",
    supplierId: "55555555-1111-4000-8000-000000000001",
    supplierName: "Yirgacheffe Coffee Farmers Cooperative Union",
    purchaseReference: "PO-YIRG-2026-001",
    purchaseDate: "2026-10-15",
    receivedDate: "2026-10-18",
    status: "RECEIVED",
    totalCost: 725.0,
    notes: "Seasonal crop intake: Grade 1 washed lot direct from Dilla",
    items: [
      {
        id: "pi-1",
        purchaseId: "66666666-1111-4000-8000-000000000001",
        inventoryItemId: "22222222-1111-4000-8000-000000000001",
        ingredientName: "Yirgacheffe Grade 1 Green Coffee Beans",
        quantity: 50.0,
        unitOfMeasure: "kg",
        unitCost: 14.5,
        totalCost: 725.0,
        batchReference: "BATCH-YIRG-2026-A1",
        expirationDate: "2027-10-15",
      },
    ],
    createdAt: "2026-10-15T08:00:00Z",
    updatedAt: "2026-10-18T14:30:00Z",
  },
  {
    id: "66666666-1111-4000-8000-000000000002",
    supplierId: "55555555-1111-4000-8000-000000000003",
    supplierName: "Sebeta Organic Dairy Farm",
    purchaseReference: "PO-SEB-2026-042",
    purchaseDate: "2026-10-19",
    receivedDate: "2026-10-20",
    status: "RECEIVED",
    totalCost: 88.0,
    notes: "Weekly fresh barista whole milk delivery",
    items: [
      {
        id: "pi-2",
        purchaseId: "66666666-1111-4000-8000-000000000002",
        inventoryItemId: "22222222-1111-4000-8000-000000000004",
        ingredientName: "Organic Whole Milk (Barista Grade)",
        quantity: 40.0,
        unitOfMeasure: "l",
        unitCost: 2.2,
        totalCost: 88.0,
        batchReference: "BATCH-SEB-2026-W42",
        expirationDate: "2026-11-03",
      },
    ],
    createdAt: "2026-10-19T07:15:00Z",
    updatedAt: "2026-10-20T08:00:00Z",
  },
  {
    id: "66666666-1111-4000-8000-000000000003",
    supplierId: "55555555-1111-4000-8000-000000000006",
    supplierName: "Debre Zeit Ancient Agro Mill",
    purchaseReference: "PO-TEFF-2026-008",
    purchaseDate: "2026-10-21",
    receivedDate: null,
    status: "ORDERED",
    totalCost: 210.0,
    notes: "Restock order for Ancient Brown Teff Grain Flour",
    items: [
      {
        id: "pi-3",
        purchaseId: "66666666-1111-4000-8000-000000000003",
        inventoryItemId: "22222222-1111-4000-8000-000000000008",
        ingredientName: "Ancient Brown Teff Grain Flour",
        quantity: 60.0,
        unitOfMeasure: "kg",
        unitCost: 3.5,
        totalCost: 210.0,
        batchReference: "BATCH-TEFF-2026-O8",
        expirationDate: "2027-04-20",
      },
    ],
    createdAt: "2026-10-21T09:30:00Z",
    updatedAt: "2026-10-21T09:30:00Z",
  },
];

export async function fetchSuppliers(params?: {
  status?: SupplierStatus;
  search?: string;
}): Promise<SupplierEntity[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const endpoint = `/procurement/suppliers${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    return await apiClient<SupplierEntity[]>(endpoint);
  } catch {
    let filtered = [...FALLBACK_SUPPLIERS];
    if (params?.status) {
      filtered = filtered.filter((s) => s.status === params.status);
    }
    if (params?.search?.trim()) {
      const term = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term),
      );
    }
    return filtered;
  }
}

export async function fetchSupplierById(
  id: string,
): Promise<SupplierEntity & { purchases: PurchaseEntity[] }> {
  try {
    return await apiClient<SupplierEntity & { purchases: PurchaseEntity[] }>(
      `/procurement/suppliers/${id}`,
    );
  } catch {
    const s =
      FALLBACK_SUPPLIERS.find((item) => item.id === id) || FALLBACK_SUPPLIERS[0]!;
    const p = FALLBACK_PURCHASES.filter((item) => item.supplierId === id);
    return { ...s, purchases: p };
  }
}

export async function createSupplier(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  category?: string;
  leadTimeDays?: number;
}): Promise<SupplierEntity> {
  return apiClient<SupplierEntity>("/procurement/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(
  id: string,
  data: Partial<SupplierEntity>,
): Promise<SupplierEntity> {
  return apiClient<SupplierEntity>(`/procurement/suppliers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function fetchPurchases(params?: {
  supplierId?: string;
  status?: PurchaseStatus;
}): Promise<PurchaseEntity[]> {
  const query = new URLSearchParams();
  if (params?.supplierId) query.set("supplierId", params.supplierId);
  if (params?.status) query.set("status", params.status);

  const endpoint = `/procurement/purchases${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    return await apiClient<PurchaseEntity[]>(endpoint);
  } catch {
    let filtered = [...FALLBACK_PURCHASES];
    if (params?.supplierId) {
      filtered = filtered.filter((p) => p.supplierId === params.supplierId);
    }
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    return filtered;
  }
}

export async function fetchPurchaseById(id: string): Promise<PurchaseEntity> {
  try {
    return await apiClient<PurchaseEntity>(`/procurement/purchases/${id}`);
  } catch {
    return (
      FALLBACK_PURCHASES.find((p) => p.id === id) || FALLBACK_PURCHASES[0]!
    );
  }
}

export async function createPurchaseOrder(data: {
  supplierId: string;
  purchaseReference?: string;
  purchaseDate?: string;
  items: Array<{
    inventoryItemId: string;
    quantity: number;
    unitCost: number;
    batchReference?: string;
    expirationDate?: string;
  }>;
  notes?: string;
}): Promise<PurchaseEntity> {
  return apiClient<PurchaseEntity>("/procurement/purchases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function receivePurchaseOrder(
  id: string,
  data: { receivedDate?: string; notes?: string } = {},
): Promise<PurchaseEntity> {
  return apiClient<PurchaseEntity>(`/procurement/purchases/${id}/receive`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchProcurementAnalytics(): Promise<ProcurementAnalytics> {
  try {
    return await apiClient<ProcurementAnalytics>("/procurement/analytics");
  } catch {
    let totalSpend = 0;
    let pendingCount = 0;
    const spendByCategory: Record<string, number> = {};

    for (const p of FALLBACK_PURCHASES) {
      if (p.status === "RECEIVED") totalSpend += p.totalCost;
      if (p.status === "ORDERED") pendingCount += 1;
    }

    const spendBySupplier = FALLBACK_SUPPLIERS.map((s) => {
      spendByCategory[s.category] = Number(
        ((spendByCategory[s.category] || 0) + s.totalSpend).toFixed(2),
      );
      return {
        supplierName: s.name,
        totalSpend: s.totalSpend,
        orderCount: s.totalOrdersCount,
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      totalSpend: Number(totalSpend.toFixed(2)),
      totalOrders: FALLBACK_PURCHASES.length,
      activeSuppliersCount: FALLBACK_SUPPLIERS.length,
      pendingShipmentsCount: pendingCount,
      spendBySupplier,
      spendByCategory,
      recentPurchases: FALLBACK_PURCHASES,
    };
  }
}
