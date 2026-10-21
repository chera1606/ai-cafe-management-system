import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import { InventoryService } from "./inventory.service";

describe("InventoryService", () => {
  let service: InventoryService;
  let mockDb: any;
  let mockAuditService: { record: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{}]),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{}]),
        }),
      }),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue(undefined),
    };

    service = new InventoryService(mockDb as any, mockAuditService as any);
  });

  describe("Pantry Initial State & Queries", () => {
    it("should initialize pre-seeded pantry items with realistic balances", async () => {
      const result = await service.findAll();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBe(result.items.length);

      const yirga = result.items.find((i) =>
        i.name.includes("Yirgacheffe Grade 1 Green Coffee Beans"),
      );
      expect(yirga).toBeDefined();
      expect(yirga?.status).toBe("IN_STOCK");
      expect(yirga?.currentQuantity).toBe(42.5);
    });

    it("should filter items by department (Barista vs Kitchen)", async () => {
      const baristaResult = await service.findAll({ department: "BARISTA" });
      const kitchenResult = await service.findAll({ department: "KITCHEN" });

      expect(baristaResult.items.every((i) => i.department === "BARISTA")).toBe(true);
      expect(kitchenResult.items.every((i) => i.department === "KITCHEN")).toBe(true);
      expect(baristaResult.total + kitchenResult.total).toBeGreaterThan(0);
    });

    it("should filter items by search term", async () => {
      const searchResult = await service.findAll({ search: "honey" });
      expect(searchResult.items.length).toBeGreaterThan(0);
      expect(searchResult.items[0]?.name.toLowerCase()).toContain("honey");
    });

    it("should identify critical low-stock alerts", async () => {
      const alerts = await service.getLowStockAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(
        alerts.every((i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK"),
      ).toBe(true);
    });

    it("should compute accurate live valuation and metric counters", async () => {
      const metrics = await service.getMetrics();
      expect(metrics.totalItems).toBeGreaterThan(0);
      expect(metrics.lowStockCount).toBeGreaterThanOrEqual(1);
      expect(metrics.outOfStockCount).toBeGreaterThanOrEqual(1);
      expect(metrics.totalValuation).toBeGreaterThan(0);
    });

    it("should retrieve single item with movement logs and batch history", async () => {
      const { items } = await service.findAll();
      const firstItem = items[0]!;

      const detail = await service.findById(firstItem.id);
      expect(detail.id).toBe(firstItem.id);
      expect(detail.name).toBe(firstItem.name);
      expect(Array.isArray(detail.recentMovements)).toBe(true);
      expect(Array.isArray(detail.activeBatches)).toBe(true);
    });

    it("should throw NotFoundException when looking up non-existent item", async () => {
      await expect(
        service.findById("00000000-0000-0000-0000-000000000099"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Stock Movements & Lifecycle", () => {
    it("should increase stock quantity on PURCHASE movement", async () => {
      const { items } = await service.findAll();
      const item = items.find((i) => i.name.includes("Yirgacheffe Grade 1 Green Coffee Beans"))!;
      const startQty = item.currentQuantity;

      const movement = await service.recordMovement({
        inventoryItemId: item.id,
        movementType: "PURCHASE",
        quantity: 10.0,
        unitCost: 15.0,
        referenceType: "SUPPLIER_INVOICE",
        notes: "Intake delivery",
      });

      expect(movement.movementType).toBe("PURCHASE");
      expect(movement.quantity).toBe(10.0);

      const updated = await service.findById(item.id);
      expect(updated.currentQuantity).toBe(Number((startQty + 10.0).toFixed(3)));
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it("should decrease stock quantity on CONSUMPTION and WASTE movements", async () => {
      const { items } = await service.findAll();
      const item = items.find((i) => i.currentQuantity > 10)!;
      const startQty = item.currentQuantity;

      await service.recordMovement({
        inventoryItemId: item.id,
        movementType: "CONSUMPTION",
        quantity: 3.5,
        notes: "Daily espresso usage",
      });

      const afterConsumption = await service.findById(item.id);
      expect(afterConsumption.currentQuantity).toBe(Number((startQty - 3.5).toFixed(3)));

      await service.recordMovement({
        inventoryItemId: item.id,
        movementType: "WASTE",
        quantity: 0.5,
        notes: "Grinder purge waste",
      });

      const afterWaste = await service.findById(item.id);
      expect(afterWaste.currentQuantity).toBe(
        Number((startQty - 3.5 - 0.5).toFixed(3)),
      );
    });

    it("should prevent stock quantity from dropping below zero", async () => {
      const { items } = await service.findAll();
      const item = items.find((i) => i.currentQuantity > 0)!;

      await service.recordMovement({
        inventoryItemId: item.id,
        movementType: "CONSUMPTION",
        quantity: item.currentQuantity + 100,
        notes: "Overconsumption clamp test",
      });

      const updated = await service.findById(item.id);
      expect(updated.currentQuantity).toBe(0);
      expect(updated.status).toBe("OUT_OF_STOCK");
    });

    it("should throw BadRequestException for zero or negative movement quantities", async () => {
      const { items } = await service.findAll();
      const item = items[0]!;

      await expect(
        service.recordMovement({
          inventoryItemId: item.id,
          movementType: "PURCHASE",
          quantity: 0,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.recordMovement({
          inventoryItemId: item.id,
          movementType: "PURCHASE",
          quantity: -5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Item Creation & Physical Reconciliation", () => {
    it("should create new inventory item and record initial balance", async () => {
      const created = await service.createItem({
        name: "Artisanal Guji Natural Beans",
        department: "BARISTA",
        currentQuantity: 20.0,
        unitOfMeasure: "kg",
        reorderLevel: 5.0,
        unitCost: 18.0,
        supplier: "Guji Highland Estate",
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Artisanal Guji Natural Beans");
      expect(created.status).toBe("IN_STOCK");

      const detail = await service.findById(created.id);
      expect(detail.recentMovements.length).toBeGreaterThanOrEqual(1);
      expect(detail.recentMovements[0]?.referenceType).toBe("OPENING_BALANCE");
    });

    it("should perform physical stock reconciliation against actual count", async () => {
      const { items } = await service.findAll();
      const item = items.find((i) => i.currentQuantity > 10)!;

      const actualCount = 15.0;
      const movement = await service.reconcileItem(item.id, actualCount, "Weekly physical audit");

      expect(movement.referenceType).toBe("PHYSICAL_AUDIT_RECONCILIATION");
      const reconciled = await service.findById(item.id);
      expect(reconciled.currentQuantity).toBe(actualCount);
    });

    it("should reject reconciliation when actual count is negative or identical", async () => {
      const { items } = await service.findAll();
      const item = items[0]!;

      await expect(
        service.reconcileItem(item.id, -2),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.reconcileItem(item.id, item.currentQuantity),
      ).rejects.toThrow(BadRequestException);
    });

    it("should update reorder thresholds and department settings", async () => {
      const { items } = await service.findAll();
      const item = items[0]!;

      const updated = await service.updateItem(item.id, {
        reorderLevel: 30.0,
        unitCost: 25.0,
      });

      expect(updated.reorderLevel).toBe(30.0);
      expect(updated.unitCost).toBe(25.0);
    });
  });

  describe("Waste Management (FR-WASTE-001 - FR-WASTE-004)", () => {
    it("should record waste, calculate financial cost, and deduct physical inventory", async () => {
      const { items } = await service.findAll();
      const item = items.find((i) => i.currentQuantity > 5)!;
      const initialQty = item.currentQuantity;

      const waste = await service.recordWaste({
        inventoryItemId: item.id,
        quantity: 2.0,
        reason: "SPOILED",
        department: "BARISTA",
        notes: "Container seal damaged during storage",
      });

      expect(waste.id).toBeDefined();
      expect(waste.reason).toBe("SPOILED");
      expect(waste.estimatedCost).toBe(Number((2.0 * item.unitCost).toFixed(2)));

      const updated = await service.findById(item.id);
      expect(updated.currentQuantity).toBe(Number((initialQty - 2.0).toFixed(3)));
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it("should throw BadRequestException when wasting non-positive quantity", async () => {
      const { items } = await service.findAll();
      const item = items[0]!;

      await expect(
        service.recordWaste({
          inventoryItemId: item.id,
          quantity: 0,
          reason: "SPILLAGE",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should filter waste records by department and reason", async () => {
      const records = await service.getWasteRecords("BARISTA");
      expect(records.length).toBeGreaterThan(0);
      expect(records.every((r) => r.department === "BARISTA")).toBe(true);

      const spillage = await service.getWasteRecords(undefined, "SPILLAGE");
      expect(spillage.every((r) => r.reason === "SPILLAGE")).toBe(true);
    });

    it("should compute comprehensive waste analytics", async () => {
      const analytics = await service.getWasteAnalytics();
      expect(analytics.totalWasteCost).toBeGreaterThan(0);
      expect(analytics.totalIncidents).toBeGreaterThan(0);
      expect(analytics.byReason).toBeDefined();
      expect(analytics.byDepartment).toBeDefined();
      expect(analytics.byDepartment.BARISTA).toBeDefined();
    });
  });

  describe("Recipe Formulation & Consumption (FR-RECIPE-001, FR-RECIPE-002)", () => {
    it("should calculate recipe production cost based on ingredient unit costs", async () => {
      const cost = await service.getRecipeCost("11111111-0000-0000-0000-000000000001");
      expect(cost.name).toBe("Ceremonial Yirgacheffe Pour-Over");
      expect(cost.ingredients.length).toBe(1);
      expect(cost.totalProductionCost).toBeGreaterThan(0);
    });

    it("should throw NotFoundException for unformulated menu item recipe", async () => {
      await expect(
        service.getRecipeCost("99999999-9999-9999-9999-999999999999"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should automatically deplete inventory proportional to recipe portions sold", async () => {
      const { items } = await service.findAll();
      const yirgaBean = items.find((i) =>
        i.name.includes("Yirgacheffe Grade 1 Green Coffee Beans"),
      )!;
      const initialStock = yirgaBean.currentQuantity;

      // 5x Ceremonial Yirgacheffe Pour-Over (each uses 0.018 kg -> total 0.09 kg)
      const movements = await service.depleteStockByRecipe({
        orderId: "ORD-RECIPE-TEST-001",
        items: [
          {
            menuItemId: "11111111-0000-0000-0000-000000000001",
            quantity: 5,
          },
        ],
      });

      expect(movements.length).toBe(1);
      expect(movements[0]?.movementType).toBe("CONSUMPTION");
      expect(movements[0]?.quantity).toBe(0.09);

      const afterDepletion = await service.findById(yirgaBean.id);
      expect(afterDepletion.currentQuantity).toBe(
        Number((initialStock - 0.09).toFixed(3)),
      );
    });
  });
});
