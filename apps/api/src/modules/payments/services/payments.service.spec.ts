import type { Database } from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import type { OrdersService } from "../../orders/services/orders.service";
import { PaymentsService } from "./payments.service";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockOrdersService: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let mockAuditService: {
    record: ReturnType<typeof vi.fn>;
  };

  const mockOrder = {
    id: "11111111-2222-3333-4444-555555555555",
    orderNumber: "ORD-TEST-001",
    orderType: "DINE_IN",
    status: "PENDING",
    subtotal: 20.0,
    deliveryFee: 0.0,
    discountAmount: 0.0,
    totalAmount: 23.0,
    customerId: "cust-1",
    customerName: "Alex Rivera",
    customerPhone: "+1555123456",
    tableNumber: "Table 4",
    items: [
      {
        id: "item-1",
        menuItemId: "m1",
        name: "Yirgacheffe Pour-Over",
        quantity: 2,
        unitPrice: 10.0,
        subtotal: 20.0,
        specialInstruction: "Extra hot",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    };

    mockOrdersService = {
      findById: vi.fn().mockResolvedValue(mockOrder),
      updateStatus: vi.fn().mockResolvedValue({ ...mockOrder, status: "CONFIRMED" }),
    };

    mockAuditService = {
      record: vi.fn().mockResolvedValue(undefined),
    };

    service = new PaymentsService(
      mockDb as unknown as Database,
      mockOrdersService as unknown as OrdersService,
      mockAuditService as unknown as AuditService,
    );
  });

  describe("initiatePayment", () => {
    it("should initiate a cash payment for an order in PENDING status", async () => {
      const payment = await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CASH",
        notes: "Tendered $25.00 cash",
      });

      expect(payment).toBeDefined();
      expect(payment.orderId).toBe(mockOrder.id);
      expect(payment.paymentMethod).toBe("CASH");
      expect(payment.status).toBe("PENDING");
      expect(payment.amount).toBe(23.0);
      expect(payment.providerReference).toBeDefined();
      expect(mockAuditService.record).toHaveBeenCalled();
    });

    it("should initiate a customer credit payment as PAID and trigger order auto-confirmation", async () => {
      const payment = await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CREDIT",
      });

      expect(payment.status).toBe("PAID");
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        mockOrder.id,
        expect.objectContaining({ status: "CONFIRMED" }),
        undefined,
      );
    });

    it("should reject initiating payment if order is already fully paid", async () => {
      // First payment
      await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CREDIT",
      });

      // Second attempt to pay
      await expect(
        service.initiatePayment({
          orderId: mockOrder.id,
          paymentMethod: "CASH",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("verifyPayment", () => {
    it("should verify payment as PAID and update order status to CONFIRMED", async () => {
      const initiated = await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "TELEBIRR",
        amount: 23.0,
      });

      const verified = await service.verifyPayment(initiated.id, {
        status: "PAID",
        providerReference: "TXN-TB-VERIFIED-12345",
      });

      expect(verified.status).toBe("PAID");
      expect(verified.providerReference).toBe("TXN-TB-VERIFIED-12345");
      expect(verified.confirmedAt).toBeInstanceOf(Date);
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        mockOrder.id,
        expect.objectContaining({ status: "CONFIRMED" }),
        undefined,
      );
    });

    it("should throw ConflictException if payment is already PAID", async () => {
      const payment = await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CREDIT", // Auto-confirms as PAID
      });

      await expect(
        service.verifyPayment(payment.id, { status: "PAID" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("getReceipt", () => {
    it("should return an itemized digital receipt with VAT calculation and cafe branding", async () => {
      await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CREDIT",
      });

      const receipt = await service.getReceipt(mockOrder.id);

      expect(receipt).toBeDefined();
      expect(receipt.receiptNumber).toMatch(/^REC-/);
      expect(receipt.orderNumber).toBe(mockOrder.orderNumber);
      expect(receipt.totalAmount).toBe(23.0);
      expect(receipt.amountPaid).toBe(23.0);
      expect(receipt.balanceDue).toBe(0.0);
      expect(receipt.paymentStatus).toBe("PAID");
      expect(receipt.cafe.name).toBe("Artisan Cafe & Roastery");
      expect(receipt.items).toHaveLength(1);
      expect(receipt.items[0]?.name).toBe("Yirgacheffe Pour-Over");
    });
  });

  describe("processRefund", () => {
    it("should process an authorized refund for a paid transaction", async () => {
      const payment = await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CREDIT",
      });

      const refund = await service.processRefund(
        payment.id,
        {
          amount: 10.0,
          reason: "Customer changed drink selection",
        },
        "staff-user-1",
      );

      expect(refund).toBeDefined();
      expect(refund.amount).toBe(10.0);
      expect(refund.paymentId).toBe(payment.id);
      expect(refund.reason).toBe("Customer changed drink selection");
      expect(refund.createdBy).toBe("staff-user-1");

      const updatedPayment = await service.findPaymentById(payment.id);
      expect(updatedPayment.status).toBe("PARTIALLY_PAID");
    });

    it("should reject refund if payment is in PENDING status", async () => {
      const payment = await service.initiatePayment({
        orderId: mockOrder.id,
        paymentMethod: "CASH", // Starts PENDING
      });

      await expect(
        service.processRefund(
          payment.id,
          { reason: "Cancellation request" },
          "staff-1",
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
