import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProcurementController } from "./procurement.controller";

describe("ProcurementController", () => {
  let controller: ProcurementController;
  let mockProcurementService: {
    findAllSuppliers: ReturnType<typeof vi.fn>;
    findSupplierById: ReturnType<typeof vi.fn>;
    createSupplier: ReturnType<typeof vi.fn>;
    updateSupplier: ReturnType<typeof vi.fn>;
    findAllPurchases: ReturnType<typeof vi.fn>;
    findPurchaseById: ReturnType<typeof vi.fn>;
    createPurchaseOrder: ReturnType<typeof vi.fn>;
    receivePurchase: ReturnType<typeof vi.fn>;
    getProcurementAnalytics: ReturnType<typeof vi.fn>;
  };
  let mockJwtService: {
    decode: ReturnType<typeof vi.fn>;
  };

  const mockSupplier = {
    id: "55555555-1111-4000-8000-000000000001",
    name: "Yirgacheffe Coffee Farmers Cooperative",
    category: "Specialty Coffee",
    status: "ACTIVE",
    totalOrdersCount: 1,
    totalSpend: 725.0,
  };

  const mockPurchase = {
    id: "66666666-1111-4000-8000-000000000001",
    supplierId: mockSupplier.id,
    purchaseReference: "PO-YIRG-001",
    status: "ORDERED",
    totalCost: 725.0,
    items: [],
  };

  beforeEach(() => {
    mockProcurementService = {
      findAllSuppliers: vi.fn().mockResolvedValue([mockSupplier]),
      findSupplierById: vi.fn().mockResolvedValue({
        ...mockSupplier,
        purchases: [mockPurchase],
      }),
      createSupplier: vi.fn().mockResolvedValue(mockSupplier),
      updateSupplier: vi.fn().mockResolvedValue(mockSupplier),
      findAllPurchases: vi.fn().mockResolvedValue([mockPurchase]),
      findPurchaseById: vi.fn().mockResolvedValue(mockPurchase),
      createPurchaseOrder: vi.fn().mockResolvedValue(mockPurchase),
      receivePurchase: vi.fn().mockResolvedValue({
        ...mockPurchase,
        status: "RECEIVED",
      }),
      getProcurementAnalytics: vi.fn().mockResolvedValue({
        totalSpend: 725.0,
        totalOrders: 1,
        activeSuppliersCount: 1,
      }),
    };

    mockJwtService = {
      decode: vi.fn().mockReturnValue({ sub: "user-mgr-1" }),
    };

    controller = new ProcurementController(
      mockProcurementService as any,
      mockJwtService as any,
    );
  });

  it("should get all suppliers with filter query", async () => {
    const suppliers = await controller.getSuppliers("ACTIVE", "Yirga");
    expect(mockProcurementService.findAllSuppliers).toHaveBeenCalledWith(
      "ACTIVE",
      "Yirga",
    );
    expect(suppliers).toHaveLength(1);
  });

  it("should get supplier detail by ID", async () => {
    const supplier = await controller.getSupplierById(mockSupplier.id);
    expect(mockProcurementService.findSupplierById).toHaveBeenCalledWith(
      mockSupplier.id,
    );
    expect(supplier.id).toBe(mockSupplier.id);
  });

  it("should create a new supplier with extracted actor ID", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } } as any;
    await controller.createSupplier(
      {
        name: "Sidama Bean Union",
        category: "Coffee",
      },
      req,
    );

    expect(mockProcurementService.createSupplier).toHaveBeenCalledWith(
      expect.anything(),
      "user-mgr-1",
    );
  });

  it("should update an existing supplier", async () => {
    const req = { headers: {} } as any;
    await controller.updateSupplier(
      mockSupplier.id,
      { phone: "+251911002233" },
      req,
    );

    expect(mockProcurementService.updateSupplier).toHaveBeenCalledWith(
      mockSupplier.id,
      { phone: "+251911002233" },
      undefined,
    );
  });

  it("should list purchases and get purchase by ID", async () => {
    await controller.getPurchases(mockSupplier.id, "ORDERED");
    expect(mockProcurementService.findAllPurchases).toHaveBeenCalledWith(
      mockSupplier.id,
      "ORDERED",
    );

    const purchase = await controller.getPurchaseById(mockPurchase.id);
    expect(mockProcurementService.findPurchaseById).toHaveBeenCalledWith(
      mockPurchase.id,
    );
    expect(purchase.id).toBe(mockPurchase.id);
  });

  it("should create a purchase order", async () => {
    const req = { headers: {} } as any;
    await controller.createPurchaseOrder(
      {
        supplierId: mockSupplier.id,
        items: [
          {
            inventoryItemId: "22222222-1111-4000-8000-000000000001",
            quantity: 10,
            unitCost: 15,
          },
        ],
      },
      req,
    );

    expect(mockProcurementService.createPurchaseOrder).toHaveBeenCalled();
  });

  it("should receive purchase and return analytics", async () => {
    const req = { headers: {} } as any;
    const received = await controller.receivePurchase(
      mockPurchase.id,
      { notes: "Delivered on time" },
      req,
    );
    expect(mockProcurementService.receivePurchase).toHaveBeenCalledWith(
      mockPurchase.id,
      { notes: "Delivered on time" },
      undefined,
    );
    expect(received.status).toBe("RECEIVED");

    const analytics = await controller.getAnalytics();
    expect(analytics.totalSpend).toBe(725.0);
  });
});
