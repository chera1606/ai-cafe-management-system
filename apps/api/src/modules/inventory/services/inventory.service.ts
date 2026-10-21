import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  type Database,
  departments,
  ingredients,
  inventoryBatches,
  inventoryItems,
  stockMovements,
  wasteRecords,
} from "@cafe/db";
import { AuditService } from "../../audit/audit.service";
import { DATABASE_TOKEN } from "../../database/database.constants";
import {
  CreateInventoryItemDto,
  DepleteOrderRecipeDto,
  InventoryDepartment,
  InventoryQueryDto,
  InventoryStatus,
  MovementType,
  RecordStockMovementDto,
  RecordWasteDto,
  UpdateInventoryItemDto,
  WasteReason,
} from "../dto";

export interface InventoryItemEntity {
  id: string;
  ingredientId: string;
  name: string;
  departmentId: string | null;
  department: InventoryDepartment;
  currentQuantity: number;
  unitOfMeasure: string;
  reorderLevel: number;
  unitCost: number;
  status: InventoryStatus;
  supplier?: string | null;
  lastRestockedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
  occurredAt: Date;
  createdBy: string;
  createdAt: Date;
}

export interface InventoryBatchEntity {
  id: string;
  inventoryItemId: string;
  batchReference: string;
  quantity: number;
  unitCost: number;
  receivedAt: Date;
  expirationDate: string | null;
  status: "ACTIVE" | "DEPLETED" | "EXPIRED";
}

export interface WasteRecordEntity {
  id: string;
  inventoryItemId: string;
  ingredientName: string;
  department: InventoryDepartment;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  estimatedCost: number;
  reason: WasteReason;
  recordedBy: string;
  notes?: string | null;
  recordedAt: Date;
  createdAt: Date;
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

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  // In-memory stores for offline dev/test fallback
  private readonly devItemsStore = new Map<string, InventoryItemEntity>();
  private readonly devMovementsStore = new Map<string, StockMovementEntity>();
  private readonly devBatchesStore = new Map<string, InventoryBatchEntity>();
  private readonly devWasteStore = new Map<string, WasteRecordEntity>();
  private readonly devRecipesStore = new Map<
    string,
    {
      name: string;
      ingredients: Array<{
        inventoryItemId: string;
        quantity: number;
        unitOfMeasure: string;
      }>;
    }
  >();

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly auditService: AuditService,
  ) {
    this.seedDevPantryIfEmpty();
  }

  /**
   * Pre-seeds authentic Ethiopian cafe pantry ingredients for local development.
   */
  private seedDevPantryIfEmpty(): void {
    if (this.devItemsStore.size > 0) return;

    const pantrySeeds: Array<{
      id: string;
      name: string;
      department: InventoryDepartment;
      currentQuantity: number;
      unitOfMeasure: string;
      reorderLevel: number;
      unitCost: number;
      supplier: string;
    }> = [
      {
        id: "22222222-1111-4000-8000-000000000001",
        name: "Yirgacheffe Grade 1 Green Coffee Beans",
        department: "BARISTA",
        currentQuantity: 42.5,
        unitOfMeasure: "kg",
        reorderLevel: 15.0,
        unitCost: 14.5,
        supplier: "Yirgacheffe Coffee Farmers Cooperative",
      },
      {
        id: "22222222-1111-4000-8000-000000000002",
        name: "Sidama High-Roast Washed Beans",
        department: "BARISTA",
        currentQuantity: 8.0,
        unitOfMeasure: "kg",
        reorderLevel: 12.0,
        unitCost: 16.0,
        supplier: "Sidama Organic Specialty Union",
      },
      {
        id: "22222222-1111-4000-8000-000000000003",
        name: "Harar Longberry Sun-Dried Beans",
        department: "BARISTA",
        currentQuantity: 14.0,
        unitOfMeasure: "kg",
        reorderLevel: 8.0,
        unitCost: 17.5,
        supplier: "Eastern Highlands Bean Estate",
      },
      {
        id: "22222222-1111-4000-8000-000000000004",
        name: "Organic Whole Milk (Barista Grade)",
        department: "BARISTA",
        currentQuantity: 32.0,
        unitOfMeasure: "l",
        reorderLevel: 12.0,
        unitCost: 2.2,
        supplier: "Sebeta Organic Dairy Farm",
      },
      {
        id: "22222222-1111-4000-8000-000000000005",
        name: "Barista Oat Microfoam Milk",
        department: "BARISTA",
        currentQuantity: 4.5,
        unitOfMeasure: "l",
        reorderLevel: 10.0,
        unitCost: 3.8,
        supplier: "Highland Oat Millers",
      },
      {
        id: "22222222-1111-4000-8000-000000000006",
        name: "Wild Mountain Acacia Honey",
        department: "BARISTA",
        currentQuantity: 2.8,
        unitOfMeasure: "kg",
        reorderLevel: 5.0,
        unitCost: 18.0,
        supplier: "Bonga Biosphere Honey Association",
      },
      {
        id: "22222222-1111-4000-8000-000000000007",
        name: "Black Cardamom Pods (Korerima)",
        department: "BARISTA",
        currentQuantity: 3.0,
        unitOfMeasure: "kg",
        reorderLevel: 1.0,
        unitCost: 28.0,
        supplier: "Kaffa Forest Spice Collectors",
      },
      {
        id: "22222222-1111-4000-8000-000000000008",
        name: "Ancient Brown Teff Grain Flour",
        department: "KITCHEN",
        currentQuantity: 55.0,
        unitOfMeasure: "kg",
        reorderLevel: 20.0,
        unitCost: 3.5,
        supplier: "Debre Zeit Agro Mill",
      },
      {
        id: "22222222-1111-4000-8000-000000000009",
        name: "Clarified Spiced Butter (Niter Kibbeh)",
        department: "KITCHEN",
        currentQuantity: 3.5,
        unitOfMeasure: "kg",
        reorderLevel: 6.0,
        unitCost: 22.0,
        supplier: "Sululta Traditional Churnery",
      },
      {
        id: "22222222-1111-4000-8000-000000000010",
        name: "Artisanal Berbere Sun-Dried Spice Blend",
        department: "KITCHEN",
        currentQuantity: 18.0,
        unitOfMeasure: "kg",
        reorderLevel: 5.0,
        unitCost: 12.0,
        supplier: "Meskell Spice Traders",
      },
      {
        id: "22222222-1111-4000-8000-000000000011",
        name: "Organic Prime Beef Tenderloin",
        department: "KITCHEN",
        currentQuantity: 0.0,
        unitOfMeasure: "kg",
        reorderLevel: 8.0,
        unitCost: 24.0,
        supplier: "Adama Highland Ranches",
      },
      {
        id: "22222222-1111-4000-8000-000000000012",
        name: "Slow-Stew Fava Beans",
        department: "KITCHEN",
        currentQuantity: 28.0,
        unitOfMeasure: "kg",
        reorderLevel: 10.0,
        unitCost: 4.5,
        supplier: "Gonder Pulse Growers",
      },
      {
        id: "22222222-1111-4000-8000-000000000013",
        name: "French Butter Pastry Sheets (82% Fat)",
        department: "KITCHEN",
        currentQuantity: 7.0,
        unitOfMeasure: "kg",
        reorderLevel: 5.0,
        unitCost: 11.5,
        supplier: "Normandy Import Logistics",
      },
      {
        id: "22222222-1111-4000-8000-000000000014",
        name: "Bergamot Citrus Blossom Essence",
        department: "BARISTA",
        currentQuantity: 1.6,
        unitOfMeasure: "l",
        reorderLevel: 1.0,
        unitCost: 32.0,
        supplier: "Artisan Bottega Extracts",
      },
    ];

    const now = new Date();

    for (const seed of pantrySeeds) {
      const status: InventoryStatus =
        seed.currentQuantity <= 0
          ? "OUT_OF_STOCK"
          : seed.currentQuantity <= seed.reorderLevel
            ? "LOW_STOCK"
            : "IN_STOCK";

      const item: InventoryItemEntity = {
        id: seed.id,
        ingredientId: seed.id,
        name: seed.name,
        departmentId: null,
        department: seed.department,
        currentQuantity: seed.currentQuantity,
        unitOfMeasure: seed.unitOfMeasure,
        reorderLevel: seed.reorderLevel,
        unitCost: seed.unitCost,
        status,
        supplier: seed.supplier,
        lastRestockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      };

      this.devItemsStore.set(item.id, item);

      // Add initial stock movement record
      const movementId = crypto.randomUUID();
      this.devMovementsStore.set(movementId, {
        id: movementId,
        inventoryItemId: item.id,
        ingredientName: item.name,
        movementType: "PURCHASE",
        quantity: item.currentQuantity,
        unitCost: item.unitCost,
        totalCost: Number((item.currentQuantity * item.unitCost).toFixed(2)),
        referenceType: "INITIAL_SEED",
        referenceId: null,
        batchReference: `BATCH-SEED-${seed.department.slice(0, 3)}-001`,
        expirationDate: "2026-12-31",
        notes: "Initial pantry intake setup",
        occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: "00000000-0000-0000-0000-000000000000",
        createdAt: now,
      });

      // Add batch record
      const batchId = crypto.randomUUID();
      this.devBatchesStore.set(batchId, {
        id: batchId,
        inventoryItemId: item.id,
        batchReference: `BATCH-SEED-${seed.department.slice(0, 3)}-001`,
        quantity: item.currentQuantity,
        unitCost: item.unitCost,
        receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expirationDate: "2026-12-31",
        status: "ACTIVE",
      });
    }

    // Seed initial realistic waste records (FR-WASTE-001 - FR-WASTE-004)
    const seedWaste: Array<{
      itemId: string;
      quantity: number;
      reason: WasteReason;
      department: InventoryDepartment;
      notes: string;
      daysAgo: number;
    }> = [
      {
        itemId: "22222222-1111-4000-8000-000000000005",
        quantity: 1.5,
        reason: "EXPIRED",
        department: "BARISTA",
        notes: "Unused opened carton past 7-day barista service window",
        daysAgo: 2,
      },
      {
        itemId: "22222222-1111-4000-8000-000000000007",
        quantity: 0.15,
        reason: "SPILLAGE",
        department: "BARISTA",
        notes: "Grinder hopper spill during morning rush prep",
        daysAgo: 1,
      },
      {
        itemId: "22222222-1111-4000-8000-000000000009",
        quantity: 0.35,
        reason: "PREPARATION_ERROR",
        department: "KITCHEN",
        notes: "Excessive pan charring during skillet heat calibration",
        daysAgo: 3,
      },
    ];

    for (const w of seedWaste) {
      const item = this.devItemsStore.get(w.itemId);
      if (item) {
        const wasteId = crypto.randomUUID();
        const estCost = Number((w.quantity * item.unitCost).toFixed(2));
        const recDate = new Date(Date.now() - w.daysAgo * 86400000);
        this.devWasteStore.set(wasteId, {
          id: wasteId,
          inventoryItemId: item.id,
          ingredientName: item.name,
          department: w.department,
          quantity: w.quantity,
          unitOfMeasure: item.unitOfMeasure,
          unitCost: item.unitCost,
          estimatedCost: estCost,
          reason: w.reason,
          recordedBy: "00000000-0000-0000-0000-000000000000",
          notes: w.notes,
          recordedAt: recDate,
          createdAt: recDate,
        });
      }
    }

    // Seed Recipe Formulations (FR-RECIPE-001, FR-RECIPE-002)
    this.devRecipesStore.set("11111111-0000-0000-0000-000000000001", {
      name: "Ceremonial Yirgacheffe Pour-Over",
      ingredients: [
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000001",
          quantity: 0.018,
          unitOfMeasure: "kg",
        },
      ],
    });

    this.devRecipesStore.set("11111111-0000-0000-0000-000000000002", {
      name: "Claypot Jebena Buna Ritual",
      ingredients: [
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000003",
          quantity: 0.035,
          unitOfMeasure: "kg",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000007",
          quantity: 0.003,
          unitOfMeasure: "kg",
        },
      ],
    });

    this.devRecipesStore.set("11111111-0000-0000-0000-000000000003", {
      name: "Pistachio Highland Honey Latte",
      ingredients: [
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000002",
          quantity: 0.018,
          unitOfMeasure: "kg",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000004",
          quantity: 0.22,
          unitOfMeasure: "l",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000006",
          quantity: 0.015,
          unitOfMeasure: "kg",
        },
      ],
    });

    this.devRecipesStore.set("11111111-0000-0000-0000-000000000004", {
      name: "Iced Cardamom Spanish Latte",
      ingredients: [
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000002",
          quantity: 0.018,
          unitOfMeasure: "kg",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000004",
          quantity: 0.2,
          unitOfMeasure: "l",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000007",
          quantity: 0.003,
          unitOfMeasure: "kg",
        },
      ],
    });

    this.devRecipesStore.set("11111111-0000-0000-0000-000000000009", {
      name: "Crispy Chechebsa with Spiced Kibbeh",
      ingredients: [
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000008",
          quantity: 0.15,
          unitOfMeasure: "kg",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000009",
          quantity: 0.025,
          unitOfMeasure: "kg",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000010",
          quantity: 0.005,
          unitOfMeasure: "kg",
        },
      ],
    });

    this.devRecipesStore.set("11111111-0000-0000-0000-000000000010", {
      name: "Slow-Stewed Fava Bean Foul",
      ingredients: [
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000012",
          quantity: 0.2,
          unitOfMeasure: "kg",
        },
        {
          inventoryItemId: "22222222-1111-4000-8000-000000000009",
          quantity: 0.015,
          unitOfMeasure: "kg",
        },
      ],
    });

    this.logger.log(`Initialized dev pantry with ${pantrySeeds.length} specialty items.`);
  }

  /**
   * Evaluates the item's current stock status dynamically.
   */
  private computeStatus(quantity: number, reorderLevel: number): InventoryStatus {
    if (quantity <= 0) return "OUT_OF_STOCK";
    if (quantity <= reorderLevel) return "LOW_STOCK";
    return "IN_STOCK";
  }

  /**
   * Retrieves list of inventory items matching filter criteria (FR-INV-001, FR-INV-002, FR-INV-005).
   */
  async findAll(query: InventoryQueryDto = {}): Promise<{
    items: InventoryItemEntity[];
    total: number;
    metrics: InventoryMetrics;
  }> {
    // Attempt DB query if active
    try {
      const dbRows = await this.db
        .select({
          id: inventoryItems.id,
          ingredientId: inventoryItems.ingredientId,
          ingredientName: ingredients.name,
          departmentId: inventoryItems.departmentId,
          departmentName: departments.name,
          currentQuantity: inventoryItems.currentQuantity,
          unitOfMeasure: inventoryItems.unitOfMeasure,
          reorderLevel: inventoryItems.reorderLevel,
          status: inventoryItems.status,
          createdAt: inventoryItems.createdAt,
          updatedAt: inventoryItems.updatedAt,
        })
        .from(inventoryItems)
        .leftJoin(ingredients, eq(inventoryItems.ingredientId, ingredients.id))
        .leftJoin(departments, eq(inventoryItems.departmentId, departments.id));

      if (dbRows && dbRows.length > 0) {
        let mapped = dbRows.map((row) => {
          const qty = Number(row.currentQuantity) || 0;
          const reorder = Number(row.reorderLevel) || 0;
          const status = this.computeStatus(qty, reorder);
          const dept = (row.departmentName?.toUpperCase() === "KITCHEN"
            ? "KITCHEN"
            : "BARISTA") as InventoryDepartment;

          return {
            id: row.id,
            ingredientId: row.ingredientId,
            name: row.ingredientName || "Unknown Ingredient",
            departmentId: row.departmentId,
            department: dept,
            currentQuantity: qty,
            unitOfMeasure: row.unitOfMeasure,
            reorderLevel: reorder,
            unitCost: 15.0,
            status,
            supplier: null,
            lastRestockedAt: row.updatedAt,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          } satisfies InventoryItemEntity;
        });

        // Apply filters
        if (query.department && query.department !== "ALL") {
          mapped = mapped.filter((item) => item.department === query.department);
        }
        if (query.status) {
          mapped = mapped.filter((item) => item.status === query.status);
        }
        if (query.search?.trim()) {
          const term = query.search.trim().toLowerCase();
          mapped = mapped.filter((item) =>
            item.name.toLowerCase().includes(term),
          );
        }

        const metrics = this.computeMetrics(mapped);
        const offset = query.offset ?? 0;
        const limit = query.limit ?? 50;
        const paged = mapped.slice(offset, offset + limit);

        return { items: paged, total: mapped.length, metrics };
      }
    } catch {
      // Fallback to dev items store
    }

    let allItems = Array.from(this.devItemsStore.values());

    // Update statuses dynamically
    allItems = allItems.map((item) => ({
      ...item,
      status: this.computeStatus(item.currentQuantity, item.reorderLevel),
    }));

    const metrics = this.computeMetrics(allItems);

    if (query.department && query.department !== "ALL") {
      allItems = allItems.filter((i) => i.department === query.department);
    }
    if (query.status) {
      allItems = allItems.filter((i) => i.status === query.status);
    }
    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      allItems = allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.supplier?.toLowerCase().includes(term),
      );
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? 50;
    const paged = allItems.slice(offset, offset + limit);

    return {
      items: paged,
      total: allItems.length,
      metrics,
    };
  }

  /**
   * Retrieves items that have breached low-stock thresholds (FR-INV-006).
   */
  async getLowStockAlerts(): Promise<InventoryItemEntity[]> {
    const { items } = await this.findAll();
    return items
      .filter((i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK")
      .sort((a, b) => {
        const ratioA = a.reorderLevel > 0 ? a.currentQuantity / a.reorderLevel : 0;
        const ratioB = b.reorderLevel > 0 ? b.currentQuantity / b.reorderLevel : 0;
        return ratioA - ratioB;
      });
  }

  /**
   * Returns live operational metrics and valuation (FR-INV-009).
   */
  async getMetrics(): Promise<InventoryMetrics> {
    const { metrics } = await this.findAll();
    return metrics;
  }

  /**
   * Retrieves single inventory item with full movement history and active batches (FR-INV-004, FR-INV-007).
   */
  async findById(id: string): Promise<InventoryItemDetail> {
    const item = this.devItemsStore.get(id);
    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found.`);
    }

    const recentMovements = Array.from(this.devMovementsStore.values())
      .filter((m) => m.inventoryItemId === id)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const activeBatches = Array.from(this.devBatchesStore.values())
      .filter((b) => b.inventoryItemId === id && b.status === "ACTIVE")
      .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

    return {
      ...item,
      status: this.computeStatus(item.currentQuantity, item.reorderLevel),
      recentMovements,
      activeBatches,
    };
  }

  /**
   * Registers a new inventory item and optionally seeds starting balance (FR-INV-001).
   */
  async createItem(
    dto: CreateInventoryItemDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<InventoryItemEntity> {
    const id = crypto.randomUUID();
    const now = new Date();
    const status = this.computeStatus(dto.currentQuantity, dto.reorderLevel);

    const newItem: InventoryItemEntity = {
      id,
      ingredientId: id,
      name: dto.name,
      departmentId: null,
      department: dto.department,
      currentQuantity: dto.currentQuantity,
      unitOfMeasure: dto.unitOfMeasure,
      reorderLevel: dto.reorderLevel,
      unitCost: dto.unitCost ?? 10.0,
      status,
      supplier: dto.supplier ?? null,
      lastRestockedAt: dto.currentQuantity > 0 ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.db.insert(inventoryItems).values({
        id: newItem.id,
        ingredientId: newItem.ingredientId,
        departmentId: null,
        currentQuantity: String(newItem.currentQuantity),
        unitOfMeasure: newItem.unitOfMeasure,
        reorderLevel: String(newItem.reorderLevel),
        status: newItem.status,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // Fallback
    }

    this.devItemsStore.set(id, newItem);

    // If starting with inventory, record initial purchase movement
    if (dto.currentQuantity > 0) {
      await this.recordMovement(
        {
          inventoryItemId: id,
          movementType: "PURCHASE",
          quantity: dto.currentQuantity,
          unitCost: dto.unitCost ?? 10.0,
          referenceType: "OPENING_BALANCE",
          notes: "Initial balance registration",
        },
        actorId,
      );
    }

    try {
      await this.auditService.record({
        action: "INVENTORY_ITEM_CREATED",
        entityType: "INVENTORY_ITEM",
        entityId: id,
        actorUserId: actorId,
        newState: { ...newItem },
      });
    } catch {
      // Non-fatal
    }

    return newItem;
  }

  /**
   * Records a stock movement and updates current stock quantity (FR-INV-003, FR-INV-004, FR-INV-008).
   */
  async recordMovement(
    dto: RecordStockMovementDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<StockMovementEntity> {
    const item = this.devItemsStore.get(dto.inventoryItemId);
    if (!item) {
      throw new NotFoundException(
        `Inventory item ${dto.inventoryItemId} not found.`,
      );
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException("Movement quantity must be greater than zero.");
    }

    const previousQuantity = item.currentQuantity;
    let newQuantity = previousQuantity;

    // Movement direction
    switch (dto.movementType) {
      case "PURCHASE":
      case "ADJUSTMENT_IN":
        newQuantity = Number((previousQuantity + dto.quantity).toFixed(3));
        item.lastRestockedAt = new Date();
        break;

      case "CONSUMPTION":
      case "WASTE":
      case "ADJUSTMENT_OUT":
        newQuantity = Math.max(0, Number((previousQuantity - dto.quantity).toFixed(3)));
        break;

      case "TRANSFER":
        // Transfer within storage/dept
        newQuantity = Number(previousQuantity.toFixed(3));
        break;
    }

    // Update item stock & status
    item.currentQuantity = newQuantity;
    item.status = this.computeStatus(newQuantity, item.reorderLevel);
    item.updatedAt = new Date();
    if (dto.unitCost && dto.unitCost > 0) {
      item.unitCost = dto.unitCost;
    }

    // Persist movement
    const movementId = crypto.randomUUID();
    const now = new Date();
    const unitCost = dto.unitCost ?? item.unitCost;
    const totalCost = Number((dto.quantity * unitCost).toFixed(2));

    const movement: StockMovementEntity = {
      id: movementId,
      inventoryItemId: item.id,
      ingredientName: item.name,
      movementType: dto.movementType,
      quantity: dto.quantity,
      unitCost,
      totalCost,
      referenceType: dto.referenceType || (dto.movementType === "PURCHASE" ? "SUPPLIER_INVOICE" : "MANUAL_ADJUSTMENT"),
      batchReference: dto.batchReference ?? null,
      expirationDate: dto.expirationDate ?? null,
      notes: dto.notes ?? null,
      occurredAt: now,
      createdBy: actorId,
      createdAt: now,
    };

    try {
      await this.db.insert(stockMovements).values({
        id: movement.id,
        inventoryItemId: movement.inventoryItemId,
        movementType: movement.movementType,
        quantity: String(movement.quantity),
        unitCost: movement.unitCost ? String(movement.unitCost) : null,
        referenceType: movement.referenceType,
        occurredAt: movement.occurredAt,
        createdBy: actorId,
        createdAt: now,
      });

      // If waste, also record to waste_records table (FR-WASTE-001)
      if (dto.movementType === "WASTE") {
        await this.db.insert(wasteRecords).values({
          id: crypto.randomUUID(),
          inventoryItemId: item.id,
          quantity: String(dto.quantity),
          estimatedCost: String(totalCost),
          reason: dto.notes || "Recorded via stock adjustment",
          departmentId: item.departmentId,
          recordedBy: actorId,
          recordedAt: now,
          createdAt: now,
        });
      }
    } catch {
      // Fallback
    }

    this.devMovementsStore.set(movementId, movement);

    // Batch creation if applicable (FR-INV-004, FR-INV-007)
    if (dto.batchReference || dto.expirationDate) {
      const batchId = crypto.randomUUID();
      const batch: InventoryBatchEntity = {
        id: batchId,
        inventoryItemId: item.id,
        batchReference: dto.batchReference || `BATCH-${Date.now().toString(36).toUpperCase()}`,
        quantity: dto.quantity,
        unitCost,
        receivedAt: now,
        expirationDate: dto.expirationDate ?? null,
        status: "ACTIVE",
      };
      this.devBatchesStore.set(batchId, batch);
    }

    try {
      await this.auditService.record({
        action: `INVENTORY_MOVEMENT_${dto.movementType}`,
        entityType: "STOCK_MOVEMENT",
        entityId: movementId,
        actorUserId: actorId,
        previousState: { currentQuantity: previousQuantity },
        newState: {
          currentQuantity: newQuantity,
          movementQuantity: dto.quantity,
          movementType: dto.movementType,
        },
      });
    } catch {
      // Non-fatal
    }

    return movement;
  }

  /**
   * Updates configuration properties like reorder threshold and department (FR-INV-005, FR-INV-006).
   */
  async updateItem(
    id: string,
    dto: UpdateInventoryItemDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<InventoryItemEntity> {
    const item = this.devItemsStore.get(id);
    if (!item) {
      throw new NotFoundException(`Inventory item ${id} not found.`);
    }

    const previous = { ...item };

    if (dto.reorderLevel !== undefined) {
      item.reorderLevel = dto.reorderLevel;
    }
    if (dto.department !== undefined) {
      item.department = dto.department;
    }
    if (dto.unitCost !== undefined) {
      item.unitCost = dto.unitCost;
    }
    if (dto.supplier !== undefined) {
      item.supplier = dto.supplier;
    }

    item.status = dto.status || this.computeStatus(item.currentQuantity, item.reorderLevel);
    item.updatedAt = new Date();

    try {
      await this.db
        .update(inventoryItems)
        .set({
          reorderLevel: String(item.reorderLevel),
          status: item.status,
          updatedAt: item.updatedAt,
        })
        .where(eq(inventoryItems.id, id));
    } catch {
      // Fallback
    }

    try {
      await this.auditService.record({
        action: "INVENTORY_ITEM_UPDATED",
        entityType: "INVENTORY_ITEM",
        entityId: id,
        actorUserId: actorId,
        previousState: previous,
        newState: { ...item },
      });
    } catch {
      // Non-fatal
    }

    return item;
  }

  /**
   * Performs physical stock reconciliation against actual count (FR-INV-008).
   */
  async reconcileItem(
    id: string,
    actualCount: number,
    notes?: string,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<StockMovementEntity> {
    const item = this.devItemsStore.get(id);
    if (!item) {
      throw new NotFoundException(`Inventory item ${id} not found.`);
    }

    if (actualCount < 0) {
      throw new BadRequestException("Actual physical count cannot be negative.");
    }

    const variance = Number((actualCount - item.currentQuantity).toFixed(3));
    if (variance === 0) {
      throw new BadRequestException("Actual count matches system quantity exactly. No adjustment required.");
    }

    const movementType: MovementType = variance > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT";
    const quantity = Math.abs(variance);

    return this.recordMovement(
      {
        inventoryItemId: id,
        movementType,
        quantity,
        referenceType: "PHYSICAL_AUDIT_RECONCILIATION",
        notes: notes || `Reconciled from ${item.currentQuantity} ${item.unitOfMeasure} to actual count ${actualCount} ${item.unitOfMeasure}`,
      },
      actorId,
    );
  }

  /**
   * Records inventory waste with categorized reason and estimated cost (FR-WASTE-001, FR-WASTE-002, FR-WASTE-003).
   */
  async recordWaste(
    dto: RecordWasteDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<WasteRecordEntity> {
    const item = this.devItemsStore.get(dto.inventoryItemId);
    if (!item) {
      throw new NotFoundException(`Inventory item ${dto.inventoryItemId} not found.`);
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException("Wasted quantity must be greater than zero.");
    }

    const estimatedCost = Number((dto.quantity * item.unitCost).toFixed(2));
    const wasteId = crypto.randomUUID();
    const now = new Date();
    const department = dto.department || item.department;

    const wasteRecord: WasteRecordEntity = {
      id: wasteId,
      inventoryItemId: item.id,
      ingredientName: item.name,
      department,
      quantity: dto.quantity,
      unitOfMeasure: item.unitOfMeasure,
      unitCost: item.unitCost,
      estimatedCost,
      reason: dto.reason,
      recordedBy: actorId,
      notes: dto.notes ?? null,
      recordedAt: now,
      createdAt: now,
    };

    try {
      await this.db.insert(wasteRecords).values({
        id: wasteRecord.id,
        inventoryItemId: wasteRecord.inventoryItemId,
        quantity: String(wasteRecord.quantity),
        estimatedCost: String(wasteRecord.estimatedCost),
        reason: wasteRecord.reason,
        departmentId: item.departmentId,
        recordedBy: actorId,
        recordedAt: now,
        createdAt: now,
      });
    } catch {
      // Dev store fallback
    }

    this.devWasteStore.set(wasteId, wasteRecord);

    // Deduct physical inventory stock
    await this.recordMovement(
      {
        inventoryItemId: item.id,
        movementType: "WASTE",
        quantity: dto.quantity,
        unitCost: item.unitCost,
        referenceType: `WASTE_${dto.reason}`,
        notes: dto.notes || `Waste recorded: ${dto.reason}`,
      },
      actorId,
    );

    try {
      await this.auditService.record({
        action: "INVENTORY_WASTE_RECORDED",
        entityType: "WASTE_RECORD",
        entityId: wasteId,
        actorUserId: actorId,
        newState: { ...wasteRecord },
      });
    } catch {
      // Non-fatal
    }

    return wasteRecord;
  }

  /**
   * Retrieves list of recorded waste events with department/reason filters (FR-WASTE-001, FR-WASTE-004).
   */
  async getWasteRecords(
    department?: string,
    reason?: string,
  ): Promise<WasteRecordEntity[]> {
    let records = Array.from(this.devWasteStore.values());

    if (department && department !== "ALL") {
      records = records.filter((r) => r.department === department);
    }
    if (reason) {
      records = records.filter((r) => r.reason === reason);
    }

    return records.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }

  /**
   * Generates waste financial analytics and breakdown by department and reason (FR-WASTE-003, FR-WASTE-004).
   */
  async getWasteAnalytics(): Promise<WasteAnalytics> {
    const records = Array.from(this.devWasteStore.values());
    let totalWasteCost = 0;
    let totalWasteQuantity = 0;

    const byReason: Record<string, { count: number; cost: number }> = {};
    const byDepartment: Record<string, { count: number; cost: number }> = {
      BARISTA: { count: 0, cost: 0 },
      KITCHEN: { count: 0, cost: 0 },
    };

    for (const r of records) {
      totalWasteCost += r.estimatedCost;
      totalWasteQuantity += r.quantity;

      // Reason breakdown
      const reasonEntry = byReason[r.reason] ?? { count: 0, cost: 0 };
      reasonEntry.count += 1;
      reasonEntry.cost = Number((reasonEntry.cost + r.estimatedCost).toFixed(2));
      byReason[r.reason] = reasonEntry;

      // Department breakdown
      const deptEntry = byDepartment[r.department] ?? { count: 0, cost: 0 };
      deptEntry.count += 1;
      deptEntry.cost = Number((deptEntry.cost + r.estimatedCost).toFixed(2));
      byDepartment[r.department] = deptEntry;
    }

    return {
      totalWasteCost: Number(totalWasteCost.toFixed(2)),
      totalWasteQuantity: Number(totalWasteQuantity.toFixed(3)),
      totalIncidents: records.length,
      byReason,
      byDepartment,
      recentRecords: records.slice(0, 10),
    };
  }

  /**
   * Automatically depresses inventory stock based on recipe ingredient ratios (FR-RECIPE-002).
   */
  async depleteStockByRecipe(
    dto: DepleteOrderRecipeDto,
    actorId = "00000000-0000-0000-0000-000000000000",
  ): Promise<StockMovementEntity[]> {
    const movements: StockMovementEntity[] = [];

    for (const orderItem of dto.items) {
      const recipe = this.devRecipesStore.get(orderItem.menuItemId);
      if (!recipe) continue;

      for (const ingredient of recipe.ingredients) {
        const item = this.devItemsStore.get(ingredient.inventoryItemId);
        if (!item) continue;

        const totalPortionQty = Number(
          (ingredient.quantity * orderItem.quantity).toFixed(3),
        );

        if (totalPortionQty > 0) {
          const movement = await this.recordMovement(
            {
              inventoryItemId: item.id,
              movementType: "CONSUMPTION",
              quantity: totalPortionQty,
              unitCost: item.unitCost,
              referenceType: "RECIPE_SALES_DEPLETION",
              notes: `Order ${dto.orderId || "Walk-in"}: ${orderItem.quantity}x ${recipe.name}`,
            },
            actorId,
          );
          movements.push(movement);
        }
      }
    }

    return movements;
  }

  /**
   * Calculates recipe formulation cost and profit margin for a menu item (FR-RECIPE-001).
   */
  async getRecipeCost(menuItemId: string): Promise<RecipeCostBreakdown> {
    const recipe = this.devRecipesStore.get(menuItemId);
    if (!recipe) {
      throw new NotFoundException(`No recipe formulation found for menu item ${menuItemId}.`);
    }

    let totalCost = 0;
    const ingredientsBreakdown = recipe.ingredients.map((ing) => {
      const item = this.devItemsStore.get(ing.inventoryItemId);
      const unitCost = item?.unitCost ?? 0;
      const subtotalCost = Number((ing.quantity * unitCost).toFixed(2));
      totalCost += subtotalCost;

      return {
        inventoryItemId: ing.inventoryItemId,
        ingredientName: item?.name ?? "Unknown Ingredient",
        quantity: ing.quantity,
        unitOfMeasure: ing.unitOfMeasure,
        unitCost,
        subtotalCost,
      };
    });

    return {
      menuItemId,
      name: recipe.name,
      ingredients: ingredientsBreakdown,
      totalProductionCost: Number(totalCost.toFixed(2)),
    };
  }

  /**
   * Calculates dashboard summary metrics.
   */
  private computeMetrics(items: InventoryItemEntity[]): InventoryMetrics {
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyCount = 0;
    let totalValuation = 0;

    for (const item of items) {
      if (item.status === "OUT_OF_STOCK") {
        outOfStockCount++;
      } else if (item.status === "LOW_STOCK") {
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
      recentMovementsCount: this.devMovementsStore.size,
    };
  }
}
