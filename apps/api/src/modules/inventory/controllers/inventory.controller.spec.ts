import { beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryController } from "./inventory.controller";

describe("InventoryController", () => {
  let controller: InventoryController;
  let mockInventoryService: {
    findAll: ReturnType<typeof vi.fn>;
    getLowStockAlerts: ReturnType<typeof vi.fn>;
    getMetrics: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    createItem: ReturnType<typeof vi.fn>;
    recordMovement: ReturnType<typeof vi.fn>;
    reconcileItem: ReturnType<typeof vi.fn>;
    updateItem: ReturnType<typeof vi.fn>;
    recordWaste: ReturnType<typeof vi.fn>;
    getWasteRecords: ReturnType<typeof vi.fn>;
    getWasteAnalytics: ReturnType<typeof vi.fn>;
    depleteStockByRecipe: ReturnType<typeof vi.fn>;
    getRecipeCost: ReturnType<typeof vi.fn>;
  };
  let mockJwtService: {
    decode: ReturnType<typeof vi.fn>;
  };

  const mockItem = {
    id: "22222222-1111-4000-8000-000000000001",
    name: "Yirgacheffe Grade 1 Green Coffee Beans",
    department: "BARISTA",
    currentQuantity: 42.5,
    unitOfMeasure: "kg",
    reorderLevel: 15.0,
    unitCost: 14.5,
    status: "IN_STOCK",
  };

  beforeEach(() => {
    mockInventoryService = {
      findAll: vi.fn().mockResolvedValue({
        items: [mockItem],
        total: 1,
        metrics: {
          totalItems: 1,
          lowStockCount: 0,
          outOfStockCount: 0,
          healthyCount: 1,
          totalValuation: 616.25,
          recentMovementsCount: 1,
        },
      }),
      getLowStockAlerts: vi.fn().mockResolvedValue([]),
      getMetrics: vi.fn().mockResolvedValue({
        totalItems: 1,
        lowStockCount: 0,
        outOfStockCount: 0,
        healthyCount: 1,
        totalValuation: 616.25,
        recentMovementsCount: 1,
      }),
      findById: vi.fn().mockResolvedValue({
        ...mockItem,
        recentMovements: [],
        activeBatches: [],
      }),
      createItem: vi.fn().mockResolvedValue(mockItem),
      recordMovement: vi.fn().mockResolvedValue({
        id: "mov-1",
        movementType: "PURCHASE",
        quantity: 10,
      }),
      reconcileItem: vi.fn().mockResolvedValue({
        id: "mov-rec",
        movementType: "ADJUSTMENT_IN",
        quantity: 5,
      }),
      updateItem: vi.fn().mockResolvedValue({
        ...mockItem,
        reorderLevel: 20,
      }),
      recordWaste: vi.fn().mockResolvedValue({
        id: "waste-1",
        reason: "SPOILED",
        quantity: 1.5,
      }),
      getWasteRecords: vi.fn().mockResolvedValue([]),
      getWasteAnalytics: vi.fn().mockResolvedValue({
        totalWasteCost: 15.0,
        totalIncidents: 1,
      }),
      depleteStockByRecipe: vi.fn().mockResolvedValue([]),
      getRecipeCost: vi.fn().mockResolvedValue({
        menuItemId: "m1",
        name: "Pour-Over",
        totalProductionCost: 0.26,
      }),
    };

    mockJwtService = {
      decode: vi.fn().mockReturnValue({ sub: "user-123" }),
    };

    controller = new InventoryController(
      mockInventoryService as any,
      mockJwtService as any,
    );
  });

  it("should get inventory list with query params", async () => {
    const result = await controller.getInventory({ department: "BARISTA" });
    expect(mockInventoryService.findAll).toHaveBeenCalledWith({
      department: "BARISTA",
    });
    expect(result.items.length).toBe(1);
  });

  it("should return low-stock alerts", async () => {
    await controller.getLowStockAlerts();
    expect(mockInventoryService.getLowStockAlerts).toHaveBeenCalled();
  });

  it("should return inventory metrics", async () => {
    const metrics = await controller.getMetrics();
    expect(metrics.totalValuation).toBe(616.25);
  });

  it("should retrieve single item detail by ID", async () => {
    const detail = await controller.getItemDetail(mockItem.id);
    expect(mockInventoryService.findById).toHaveBeenCalledWith(mockItem.id);
    expect(detail.id).toBe(mockItem.id);
  });

  it("should create item with extracted actor ID from bearer token", async () => {
    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as any;

    await controller.createItem(
      {
        name: "Test Bean",
        department: "BARISTA",
        currentQuantity: 10,
        unitOfMeasure: "kg",
        reorderLevel: 2,
      },
      req,
    );

    expect(mockInventoryService.createItem).toHaveBeenCalledWith(
      expect.anything(),
      "user-123",
    );
  });

  it("should record stock movement", async () => {
    const req = { headers: {} } as any;
    await controller.recordMovement(
      {
        inventoryItemId: mockItem.id,
        movementType: "PURCHASE",
        quantity: 5,
      },
      req,
    );

    expect(mockInventoryService.recordMovement).toHaveBeenCalled();
  });

  it("should reconcile item actual count", async () => {
    const req = { headers: {} } as any;
    await controller.reconcileItem(mockItem.id, 45.0, "Physical count", req);

    expect(mockInventoryService.reconcileItem).toHaveBeenCalledWith(
      mockItem.id,
      45.0,
      "Physical count",
      undefined,
    );
  });

  it("should update item settings", async () => {
    const req = { headers: {} } as any;
    await controller.updateItem(
      mockItem.id,
      { reorderLevel: 20 },
      req,
    );

    expect(mockInventoryService.updateItem).toHaveBeenCalledWith(
      mockItem.id,
      { reorderLevel: 20 },
      undefined,
    );
  });

  it("should record waste incident", async () => {
    const req = { headers: {} } as any;
    await controller.recordWaste(
      {
        inventoryItemId: mockItem.id,
        quantity: 1.5,
        reason: "SPOILED",
      },
      req,
    );

    expect(mockInventoryService.recordWaste).toHaveBeenCalled();
  });

  it("should retrieve waste records and analytics", async () => {
    await controller.getWasteRecords("BARISTA", "EXPIRED");
    expect(mockInventoryService.getWasteRecords).toHaveBeenCalledWith(
      "BARISTA",
      "EXPIRED",
    );

    const analytics = await controller.getWasteAnalytics();
    expect(analytics.totalWasteCost).toBe(15.0);
  });

  it("should deplete recipe and get recipe cost", async () => {
    const req = { headers: {} } as any;
    await controller.depleteRecipe(
      {
        items: [{ menuItemId: "11111111-2222-3333-4444-555555555555", quantity: 2 }],
      },
      req,
    );
    expect(mockInventoryService.depleteStockByRecipe).toHaveBeenCalled();

    const cost = await controller.getRecipeCost("11111111-2222-3333-4444-555555555555");
    expect(cost.totalProductionCost).toBe(0.26);
  });
});
