import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  type Database,
  inventoryItems,
  purchaseItems,
  purchases,
  suppliers,
} from "@cafe/db";
import { AuditService } from "../../audit/audit.service";
import { DATABASE_TOKEN } from "../../database/database.constants";
import { InventoryService } from "../../inventory/services/inventory.service";
import {
  CreatePurchaseOrderDto,
  CreateSupplierDto,
  PurchaseStatus,
  ReceivePurchaseDto,
  SupplierStatus,
  UpdateSupplierDto,
} from "../dto";

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
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name);

  // In-memory fallback dev stores
  private readonly devSuppliersStore = new Map<string, SupplierEntity>();
  private readonly devPurchasesStore = new Map<string, PurchaseEntity>();

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly auditService: AuditService,
    private readonly inventoryService: InventoryService,
  ) {
    this.seedDevSuppliersIfEmpty();
  }

  /**
   * Pre-seeds Ethiopian regional suppliers and historical purchases (FR-PROC-001, FR-PROC-002).
   */
  private seedDevSuppliersIfEmpty(): void {
    if (this.devSuppliersStore.size > 0) return;

    const seedSuppliers: Array<{
      id: string;
      name: string;
      phone: string;
      email: string;
      address: string;
      category: string;
      leadTimeDays: number;
    }> = [
      {
        id: "55555555-1111-4000-8000-000000000001",
        name: "Yirgacheffe Coffee Farmers Cooperative Union",
        phone: "+251 11 662 4589",
        email: "procurement@yirgacheffe-union.et",
        address: "Gedeo Zone, Dilla, Southern Ethiopia",
        category: "Specialty Coffee",
        leadTimeDays: 3,
      },
      {
        id: "55555555-1111-4000-8000-000000000002",
        name: "Sidama Organic Specialty Union",
        phone: "+251 46 220 1834",
        email: "sales@sidamacoffee.com",
        address: "Hawassa Industrial Hub, Sidama",
        category: "Specialty Coffee",
        leadTimeDays: 4,
      },
      {
        id: "55555555-1111-4000-8000-000000000003",
        name: "Sebeta Organic Dairy Farm",
        phone: "+251 11 338 2190",
        email: "orders@sebetadairy.et",
        address: "Sebeta Agro-Corridor, Oromia",
        category: "Dairy & Milk",
        leadTimeDays: 1,
      },
      {
        id: "55555555-1111-4000-8000-000000000004",
        name: "Sululta Traditional Churnery",
        phone: "+251 11 884 1022",
        email: "contact@sulultabutter.et",
        address: "Sululta Highlands, Oromia",
        category: "Traditional Butter (Kibbeh)",
        leadTimeDays: 2,
      },
      {
        id: "55555555-1111-4000-8000-000000000005",
        name: "Meskell Spice Traders",
        phone: "+251 11 278 9450",
        email: "info@meskellspices.et",
        address: "Addis Merkato, Central Spice District",
        category: "Artisanal Spices",
        leadTimeDays: 2,
      },
      {
        id: "55555555-1111-4000-8000-000000000006",
        name: "Debre Zeit Ancient Agro Mill",
        phone: "+251 11 433 8011",
        email: "orders@debrezeitmill.et",
        address: "Bishoftu Grain Terminal",
        category: "Grains & Teff",
        leadTimeDays: 3,
      },
      {
        id: "55555555-1111-4000-8000-000000000007",
        name: "Bonga Biosphere Honey Association",
        phone: "+251 47 331 0945",
        email: "wildhoney@kaffa-bonga.et",
        address: "Kaffa Biosphere Reserve, Bonga",
        category: "Wild Mountain Honey",
        leadTimeDays: 5,
      },
    ];

    const now = new Date();

    for (const s of seedSuppliers) {
      this.devSuppliersStore.set(s.id, {
        id: s.id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        category: s.category,
        leadTimeDays: s.leadTimeDays,
        status: "ACTIVE",
        totalOrdersCount: 0,
        totalSpend: 0,
        createdAt: new Date(Date.now() - 30 * 86400000),
        updatedAt: now,
      });
    }

    // Seed historical purchases (FR-PROC-002)
    const seedPurchases: Array<{
      id: string;
      supplierId: string;
      reference: string;
      date: string;
      receivedDate: string | null;
      status: PurchaseStatus;
      notes: string;
      items: Array<{
        itemId: string;
        name: string;
        qty: number;
        unit: string;
        unitCost: number;
        batch: string;
        exp: string;
      }>;
    }> = [
      {
        id: "66666666-1111-4000-8000-000000000001",
        supplierId: "55555555-1111-4000-8000-000000000001",
        reference: "PO-YIRG-2026-001",
        date: "2026-10-15",
        receivedDate: "2026-10-18",
        status: "RECEIVED",
        notes: "Seasonal crop intake: Grade 1 washed lot direct from Dilla",
        items: [
          {
            itemId: "22222222-1111-4000-8000-000000000001",
            name: "Yirgacheffe Grade 1 Green Coffee Beans",
            qty: 50.0,
            unit: "kg",
            unitCost: 14.5,
            batch: "BATCH-YIRG-2026-A1",
            exp: "2027-10-15",
          },
        ],
      },
      {
        id: "66666666-1111-4000-8000-000000000002",
        supplierId: "55555555-1111-4000-8000-000000000003",
        reference: "PO-SEB-2026-042",
        date: "2026-10-19",
        receivedDate: "2026-10-20",
        status: "RECEIVED",
        notes: "Weekly fresh barista whole milk delivery",
        items: [
          {
            itemId: "22222222-1111-4000-8000-000000000004",
            name: "Organic Whole Milk (Barista Grade)",
            qty: 40.0,
            unit: "l",
            unitCost: 2.2,
            batch: "BATCH-SEB-2026-W42",
            exp: "2026-11-03",
          },
        ],
      },
      {
        id: "66666666-1111-4000-8000-000000000003",
        supplierId: "55555555-1111-4000-8000-000000000006",
        reference: "PO-TEFF-2026-008",
        date: "2026-10-21",
        receivedDate: null,
        status: "ORDERED",
        notes: "Restock order for Ancient Brown Teff Grain Flour",
        items: [
          {
            itemId: "22222222-1111-4000-8000-000000000008",
            name: "Ancient Brown Teff Grain Flour",
            qty: 60.0,
            unit: "kg",
            unitCost: 3.5,
            batch: "BATCH-TEFF-2026-O8",
            exp: "2027-04-20",
          },
        ],
      },
    ];

    for (const p of seedPurchases) {
      let total = 0;
      const mappedItems: PurchaseItemEntity[] = p.items.map((it) => {
        const itemTotal = Number((it.qty * it.unitCost).toFixed(2));
        total += itemTotal;
        return {
          id: crypto.randomUUID(),
          purchaseId: p.id,
          inventoryItemId: it.itemId,
          ingredientName: it.name,
          quantity: it.qty,
          unitOfMeasure: it.unit,
          unitCost: it.unitCost,
          totalCost: itemTotal,
          batchReference: it.batch,
          expirationDate: it.exp,
        };
      });

      const supplier = this.devSuppliersStore.get(p.supplierId);
      if (supplier && p.status === "RECEIVED") {
        supplier.totalOrdersCount += 1;
        supplier.totalSpend = Number((supplier.totalSpend + total).toFixed(2));
      }

      this.devPurchasesStore.set(p.id, {
        id: p.id,
        supplierId: p.supplierId,
        supplierName: supplier?.name ?? "Direct Agro Supplier",
        purchaseReference: p.reference,
        purchaseDate: p.date,
        receivedDate: p.receivedDate,
        status: p.status,
        totalCost: Number(total.toFixed(2)),
        notes: p.notes,
        items: mappedItems,
        createdAt: new Date(p.date),
        updatedAt: p.receivedDate ? new Date(p.receivedDate) : new Date(p.date),
      });
    }

    this.logger.log(`Initialized procurement module with ${seedSuppliers.length} verified suppliers.`);
  }

  /**
   * Retrieves active suppliers matching filter and search queries (FR-PROC-001).
   */
  async findAllSuppliers(
    status?: SupplierStatus,
    search?: string,
  ): Promise<SupplierEntity[]> {
    let list = Array.from(this.devSuppliersStore.values());

    if (status) {
      list = list.filter((s) => s.status === status);
    }
    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term) ||
          s.address?.toLowerCase().includes(term),
      );
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Retrieves single supplier detail with itemized purchase history (FR-PROC-001, FR-PROC-002).
   */
  async findSupplierById(
    id: string,
  ): Promise<SupplierEntity & { purchases: PurchaseEntity[] }> {
    const supplier = this.devSuppliersStore.get(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }

    const supplierPurchases = Array.from(this.devPurchasesStore.values())
      .filter((p) => p.supplierId === id)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    return {
      ...supplier,
      purchases: supplierPurchases,
    };
  }

  /**
   * Registers a new supplier (FR-PROC-001).
   */
  async createSupplier(
    dto: CreateSupplierDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<SupplierEntity> {
    const id = crypto.randomUUID();
    const now = new Date();

    const newSupplier: SupplierEntity = {
      id,
      name: dto.name,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      address: dto.address ?? null,
      category: dto.category ?? "General Supplies",
      leadTimeDays: dto.leadTimeDays ?? 3,
      status: dto.status ?? "ACTIVE",
      totalOrdersCount: 0,
      totalSpend: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.db.insert(suppliers).values({
        id: newSupplier.id,
        name: newSupplier.name,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: newSupplier.address,
        status: newSupplier.status,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // Fallback
    }

    this.devSuppliersStore.set(id, newSupplier);

    try {
      await this.auditService.record({
        action: "SUPPLIER_CREATED",
        entityType: "SUPPLIER",
        entityId: id,
        actorUserId: actorId,
        newState: { ...newSupplier },
      });
    } catch {
      // Non-fatal
    }

    return newSupplier;
  }

  /**
   * Updates an existing supplier record (FR-PROC-001).
   */
  async updateSupplier(
    id: string,
    dto: UpdateSupplierDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<SupplierEntity> {
    const supplier = this.devSuppliersStore.get(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier ${id} not found.`);
    }

    const previous = { ...supplier };

    if (dto.name !== undefined) supplier.name = dto.name;
    if (dto.phone !== undefined) supplier.phone = dto.phone;
    if (dto.email !== undefined) supplier.email = dto.email;
    if (dto.address !== undefined) supplier.address = dto.address;
    if (dto.category !== undefined) supplier.category = dto.category;
    if (dto.leadTimeDays !== undefined) supplier.leadTimeDays = dto.leadTimeDays;
    if (dto.status !== undefined) supplier.status = dto.status;
    supplier.updatedAt = new Date();

    try {
      await this.db
        .update(suppliers)
        .set({
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          status: supplier.status,
          updatedAt: supplier.updatedAt,
        })
        .where(eq(suppliers.id, id));
    } catch {
      // Fallback
    }

    try {
      await this.auditService.record({
        action: "SUPPLIER_UPDATED",
        entityType: "SUPPLIER",
        entityId: id,
        actorUserId: actorId,
        previousState: previous,
        newState: { ...supplier },
      });
    } catch {
      // Non-fatal
    }

    return supplier;
  }

  /**
   * Creates a purchase order (FR-PROC-002).
   */
  async createPurchaseOrder(
    dto: CreatePurchaseOrderDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<PurchaseEntity> {
    const supplier = this.devSuppliersStore.get(dto.supplierId);
    if (!supplier) {
      throw new NotFoundException(`Supplier ${dto.supplierId} not found.`);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException("Purchase order must contain at least one item.");
    }

    const purchaseId = crypto.randomUUID();
    const now = new Date();
    const purchaseDate = dto.purchaseDate || now.toISOString().slice(0, 10);
    const reference =
      dto.purchaseReference ||
      `PO-${supplier.name.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    let totalCost = 0;
    const items: PurchaseItemEntity[] = dto.items.map((it) => {
      const lineCost = Number((it.quantity * it.unitCost).toFixed(2));
      totalCost += lineCost;

      return {
        id: crypto.randomUUID(),
        purchaseId,
        inventoryItemId: it.inventoryItemId,
        quantity: it.quantity,
        unitCost: it.unitCost,
        totalCost: lineCost,
        batchReference: it.batchReference ?? null,
        expirationDate: it.expirationDate ?? null,
      };
    });

    const newPurchase: PurchaseEntity = {
      id: purchaseId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      purchaseReference: reference,
      purchaseDate,
      receivedDate: null,
      status: "ORDERED",
      totalCost: Number(totalCost.toFixed(2)),
      notes: dto.notes ?? null,
      items,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.db.insert(purchases).values({
        id: newPurchase.id,
        supplierId: newPurchase.supplierId,
        purchaseReference: newPurchase.purchaseReference,
        purchaseDate: newPurchase.purchaseDate,
        receivedDate: null,
        status: newPurchase.status,
        totalCost: String(newPurchase.totalCost),
        createdAt: now,
        updatedAt: now,
      });

      for (const it of items) {
        await this.db.insert(purchaseItems).values({
          id: it.id,
          purchaseId: it.purchaseId,
          inventoryItemId: it.inventoryItemId,
          quantity: String(it.quantity),
          unitCost: String(it.unitCost),
          totalCost: String(it.totalCost),
        });
      }
    } catch {
      // Fallback
    }

    this.devPurchasesStore.set(purchaseId, newPurchase);

    try {
      await this.auditService.record({
        action: "PURCHASE_ORDER_CREATED",
        entityType: "PURCHASE_ORDER",
        entityId: purchaseId,
        actorUserId: actorId,
        newState: { ...newPurchase },
      });
    } catch {
      // Non-fatal
    }

    return newPurchase;
  }

  /**
   * Receives incoming shipment and triggers automatic physical restock in InventoryService (FR-PROC-002, FR-INV-003, FR-INV-004).
   */
  async receivePurchase(
    id: string,
    dto: ReceivePurchaseDto = {},
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<PurchaseEntity> {
    const purchase = this.devPurchasesStore.get(id);
    if (!purchase) {
      throw new NotFoundException(`Purchase order ${id} not found.`);
    }

    if (purchase.status === "RECEIVED") {
      throw new ConflictException(
        `Purchase order ${purchase.purchaseReference} is already received and checked into inventory.`,
      );
    }

    if (purchase.status === "CANCELLED") {
      throw new BadRequestException("Cannot receive a cancelled purchase order.");
    }

    const now = new Date();
    const receivedDate = dto.receivedDate || now.toISOString().slice(0, 10);

    purchase.status = "RECEIVED";
    purchase.receivedDate = receivedDate;
    if (dto.notes) {
      purchase.notes = purchase.notes ? `${purchase.notes} | ${dto.notes}` : dto.notes;
    }
    purchase.updatedAt = now;

    // Update supplier spend totals
    const supplier = this.devSuppliersStore.get(purchase.supplierId);
    if (supplier) {
      supplier.totalOrdersCount += 1;
      supplier.totalSpend = Number((supplier.totalSpend + purchase.totalCost).toFixed(2));
      supplier.updatedAt = now;
    }

    // Automatically replenish inventory items (FR-PROC-002 -> FR-INV-003)
    for (const it of purchase.items) {
      try {
        await this.inventoryService.recordMovement(
          {
            inventoryItemId: it.inventoryItemId,
            movementType: "PURCHASE",
            quantity: it.quantity,
            unitCost: it.unitCost,
            referenceType: "PURCHASE_ORDER",
            batchReference: it.batchReference || `BATCH-${purchase.purchaseReference}`,
            expirationDate: it.expirationDate ?? undefined,
            notes: `Auto-restocked via received PO ${purchase.purchaseReference}`,
          },
          actorId,
        );
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to auto-restock item ${it.inventoryItemId} from PO ${purchase.purchaseReference}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    try {
      await this.db
        .update(purchases)
        .set({
          status: "RECEIVED",
          receivedDate,
          updatedAt: now,
        })
        .where(eq(purchases.id, id));
    } catch {
      // Fallback
    }

    try {
      await this.auditService.record({
        action: "PURCHASE_ORDER_RECEIVED",
        entityType: "PURCHASE_ORDER",
        entityId: id,
        actorUserId: actorId,
        newState: { ...purchase },
      });
    } catch {
      // Non-fatal
    }

    return purchase;
  }

  /**
   * Retrieves all purchase orders (FR-PROC-002).
   */
  async findAllPurchases(
    supplierId?: string,
    status?: PurchaseStatus,
  ): Promise<PurchaseEntity[]> {
    let list = Array.from(this.devPurchasesStore.values());

    if (supplierId) {
      list = list.filter((p) => p.supplierId === supplierId);
    }
    if (status) {
      list = list.filter((p) => p.status === status);
    }

    return list.sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );
  }

  /**
   * Retrieves single purchase order detail by ID.
   */
  async findPurchaseById(id: string): Promise<PurchaseEntity> {
    const purchase = this.devPurchasesStore.get(id);
    if (!purchase) {
      throw new NotFoundException(`Purchase order ${id} not found.`);
    }
    return purchase;
  }

  /**
   * Generates supplier performance and procurement spend analytics (FR-PROC-003).
   */
  async getProcurementAnalytics(): Promise<ProcurementAnalytics> {
    const suppliersList = Array.from(this.devSuppliersStore.values());
    const purchasesList = Array.from(this.devPurchasesStore.values());

    let totalSpend = 0;
    let pendingShipmentsCount = 0;
    const spendByCategory: Record<string, number> = {};

    for (const p of purchasesList) {
      if (p.status === "RECEIVED") {
        totalSpend += p.totalCost;
      } else if (p.status === "ORDERED") {
        pendingShipmentsCount += 1;
      }
    }

    const spendBySupplier = suppliersList.map((s) => {
      const category = s.category || "General";
      spendByCategory[category] = Number(
        ((spendByCategory[category] || 0) + s.totalSpend).toFixed(2),
      );

      return {
        supplierName: s.name,
        totalSpend: s.totalSpend,
        orderCount: s.totalOrdersCount,
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      totalSpend: Number(totalSpend.toFixed(2)),
      totalOrders: purchasesList.length,
      activeSuppliersCount: suppliersList.filter((s) => s.status === "ACTIVE").length,
      pendingShipmentsCount,
      spendBySupplier,
      spendByCategory,
      recentPurchases: purchasesList.slice(0, 10),
    };
  }
}
