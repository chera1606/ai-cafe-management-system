import type { Database } from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import { OrdersService } from "./orders.service";

describe("OrdersService", () => {
  let service: OrdersService;
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    transaction: ReturnType<typeof vi.fn>;
  };
  let mockAuditService: {
    record: ReturnType<typeof vi.fn>;
  };

  const mockMenuItem = {
    id: "m1",
    name: "Ceremonial Yirgacheffe",
    price: "6.50",
    availabilityStatus: "AVAILABLE",
  };

  const mockCreatedOrder = {
    id: "ord-1234-uuid",
    customerId: "cust-1",
    orderType: "DINE_IN",
    status: "PENDING",
    subtotal: "13.00",
    deliveryFee: "0.00",
    discountAmount: "0.00",
    totalAmount: "13.00",
    createdAt: new Date(),
    updatedAt: new Date(),
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
    customerName: "Abebe",
    customerPhone: "+251911223344",
    customerEmail: "abebe@example.com",
  };

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      transaction: vi.fn(),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue(undefined),
    };

    service = new OrdersService(
      mockDb as unknown as Database,
      mockAuditService as unknown as AuditService,
    );
  });

  describe("create", () => {
    it("should throw BadRequestException if delivery order lacks an address", async () => {
      await expect(
        service.create({
          orderType: "DELIVERY",
          items: [{ menuItemId: "m1", quantity: 1 }],
          deliveryInfo: { address: "" },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if a requested menu item is not found", async () => {
      // Mock user customer lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      // Mock menu items lookup returning empty list
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([]),
        }),
      });

      await expect(
        service.create(
          {
            orderType: "DINE_IN",
            items: [{ menuItemId: "non-existent-id", quantity: 1 }],
          },
          "user-1",
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if a requested menu item is not AVAILABLE", async () => {
      // Customer lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      // Menu item lookup returning OUT_OF_STOCK item
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi
            .fn()
            .mockResolvedValueOnce([
              { ...mockMenuItem, availabilityStatus: "OUT_OF_STOCK" },
            ]),
        }),
      });

      await expect(
        service.create(
          {
            orderType: "DINE_IN",
            items: [{ menuItemId: "m1", quantity: 1 }],
          },
          "user-1",
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully calculate server-side totals and create the order", async () => {
      // Customer lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi
              .fn()
              .mockResolvedValueOnce([{ id: "cust-1", name: "Abebe" }]),
          }),
        }),
      });

      // Menu item lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([mockMenuItem]),
        }),
      });

      // Transaction mock
      mockDb.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: "ord-1234-uuid" }]),
            }),
          }),
        };
        return callback(tx);
      });

      // findById mock (order header)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi.fn().mockResolvedValueOnce([mockCreatedOrder]),
            }),
          }),
        }),
      });

      // findById mock (order items)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockResolvedValueOnce([
              {
                id: "oi-1",
                menuItemId: "m1",
                name: "Ceremonial Yirgacheffe",
                quantity: "2",
                unitPrice: "6.50",
                subtotal: "13.00",
                specialInstruction: null,
              },
            ]),
          }),
        }),
      });

      // findById mock (deliveries)
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      const order = await service.create(
        {
          orderType: "DINE_IN",
          tableNumber: "Table 4",
          items: [{ menuItemId: "m1", quantity: 2 }],
        },
        "user-1",
      );

      expect(order).toBeDefined();
      expect(order.id).toBe("ord-1234-uuid");
      expect(order.totalAmount).toBe(13);
      expect(order.items.length).toBe(1);
      expect(order.items[0]?.subtotal).toBe(13);
    });
  });

  describe("updateStatus", () => {
    it("should throw BadRequestException if order is already COMPLETED", async () => {
      // Mock findById returning COMPLETED order
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi
                .fn()
                .mockResolvedValueOnce([
                  { ...mockCreatedOrder, status: "COMPLETED" },
                ]),
            }),
          }),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      await expect(
        service.updateStatus("ord-1234-uuid", { status: "PREPARING" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("cancel", () => {
    it("should prevent non-staff customer from cancelling when order is in PREPARING status", async () => {
      // Mock findById returning PREPARING order
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi
                .fn()
                .mockResolvedValueOnce([
                  { ...mockCreatedOrder, status: "PREPARING" },
                ]),
            }),
          }),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      await expect(
        service.cancel("ord-1234-uuid", "Changed mind", "user-1", false),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject cancelling an already cancelled order with ConflictException", async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockReturnValueOnce({
              limit: vi
                .fn()
                .mockResolvedValueOnce([
                  { ...mockCreatedOrder, status: "CANCELLED" },
                ]),
            }),
          }),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          leftJoin: vi.fn().mockReturnValueOnce({
            where: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      await expect(
        service.cancel("ord-1234-uuid", "Duplicate", "user-1", true),
      ).rejects.toThrow(ConflictException);
    });
  });
});
