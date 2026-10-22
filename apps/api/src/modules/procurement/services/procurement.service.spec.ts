import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import type { InventoryService } from "../../inventory/services/inventory.service";
import { ProcurementService } from "./procurement.service";

describe("ProcurementService", () => {
  let service: ProcurementService;
  let mockDb: any;
  let mockAuditService: { record: ReturnType<typeof vi.fn> };
  let mockInventoryService: { recordMovement: ReturnType<typeof vi.fn> };

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

    mockInventoryService = {
      recordMovement: vi.fn().mockResolvedValue({
        id: "mov-test-1",
        movementType: "PURCHASE",
      }),
    };

    service = new ProcurementService(
      mockDb as any,
      mockAuditService as any,
      mockInventoryService as any,
    );
  });

  describe("Supplier Directory (FR-PROC-001)", () => {
    it("should initialize pre-seeded verified regional suppliers", async () => {
      const suppliers = await service.findAllSuppliers();
      expect(suppliers.length).toBeGreaterThan(0);

      const yirga = suppliers.find((s) =>
        s.name.includes("Yirgacheffe Coffee Farmers Cooperative"),
      );
      expect(yirga).toBeDefined();
      expect(yirga?.status).toBe("ACTIVE");
      expect(yirga?.category).toBe("Specialty Coffee");
    });

    it("should filter suppliers by keyword or category", async () => {
      const dairySuppliers = await service.findAllSuppliers(undefined, "dairy");
      expect(dairySuppliers.length).toBeGreaterThan(0);
      expect(
        dairySuppliers.every(
          (s) =>
            s.name.toLowerCase().includes("dairy") ||
            s.category.toLowerCase().includes("dairy"),
        ),
      ).toBe(true);
    });

    it("should retrieve single supplier detail with purchase order history", async () => {
      const suppliers = await service.findAllSuppliers();
      const first = suppliers[0]!;

      const detail = await service.findSupplierById(first.id);
      expect(detail.id).toBe(first.id);
      expect(detail.name).toBe(first.name);
      expect(Array.isArray(detail.purchases)).toBe(true);
    });

    it("should throw NotFoundException when looking up non-existent supplier", async () => {
      await expect(
        service.findSupplierById("00000000-0000-0000-0000-000000000099"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should register a new supplier and record audit log", async () => {
      const created = await service.createSupplier({
        name: "Harar Heritage Bean Curators",
        phone: "+251 25 666 1234",
        email: "harar@coffee-heritage.et",
        category: "Specialty Coffee",
        leadTimeDays: 4,
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Harar Heritage Bean Curators");
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it("should update an existing supplier record", async () => {
      const suppliers = await service.findAllSuppliers();
      const first = suppliers[0]!;

      const updated = await service.updateSupplier(first.id, {
        phone: "+251 11 999 8888",
        leadTimeDays: 2,
      });

      expect(updated.phone).toBe("+251 11 999 8888");
      expect(updated.leadTimeDays).toBe(2);
    });
  });

  describe("Purchase Orders & Inventory Restock (FR-PROC-002, FR-INV-003)", () => {
    it("should create a purchase order with multiple items and calculated total cost", async () => {
      const suppliers = await service.findAllSuppliers();
      const supplier = suppliers[0]!;

      const po = await service.createPurchaseOrder({
        supplierId: supplier.id,
        purchaseReference: "PO-TEST-2026-999",
        items: [
          {
            inventoryItemId: "22222222-1111-4000-8000-000000000001",
            quantity: 30.0,
            unitCost: 14.5,
            batchReference: "BATCH-TEST-A",
            expirationDate: "2027-10-22",
          },
          {
            inventoryItemId: "22222222-1111-4000-8000-000000000002",
            quantity: 10.0,
            unitCost: 16.0,
            batchReference: "BATCH-TEST-B",
            expirationDate: "2027-10-22",
          },
        ],
        notes: "Test replenishment order",
      });

      expect(po.id).toBeDefined();
      expect(po.status).toBe("ORDERED");
      expect(po.totalCost).toBe(Number((30 * 14.5 + 10 * 16.0).toFixed(2)));
      expect(po.items).toHaveLength(2);
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it("should reject creating purchase order with empty items", async () => {
      const suppliers = await service.findAllSuppliers();
      const supplier = suppliers[0]!;

      await expect(
        service.createPurchaseOrder({
          supplierId: supplier.id,
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should receive incoming purchase shipment and automatically increment inventory stock", async () => {
      const purchases = await service.findAllPurchases();
      const orderedPo = purchases.find((p) => p.status === "ORDERED")!;

      const received = await service.receivePurchase(orderedPo.id, {
        notes: "Inspection passed at loading dock",
      });

      expect(received.status).toBe("RECEIVED");
      expect(received.receivedDate).toBeDefined();
      expect(mockInventoryService.recordMovement).toHaveBeenCalledTimes(
        orderedPo.items.length,
      );
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it("should reject receiving an already received purchase order", async () => {
      const purchases = await service.findAllPurchases();
      const alreadyReceived = purchases.find((p) => p.status === "RECEIVED")!;

      await expect(
        service.receivePurchase(alreadyReceived.id),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("Procurement Analytics & Supplier Performance (FR-PROC-003)", () => {
    it("should calculate total spend, order count, and supplier performance rankings", async () => {
      const analytics = await service.getProcurementAnalytics();

      expect(analytics.totalSpend).toBeGreaterThan(0);
      expect(analytics.totalOrders).toBeGreaterThan(0);
      expect(analytics.activeSuppliersCount).toBeGreaterThan(0);
      expect(Array.isArray(analytics.spendBySupplier)).toBe(true);
      expect(analytics.spendBySupplier[0]?.totalSpend).toBeGreaterThanOrEqual(0);
      expect(analytics.spendByCategory).toBeDefined();
    });
  });
});
