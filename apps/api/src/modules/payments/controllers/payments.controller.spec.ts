import { JwtService } from "@nestjs/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { PaymentsController } from "./payments.controller";
import type { PaymentsService } from "../services/payments.service";

describe("PaymentsController", () => {
  let controller: PaymentsController;
  let mockPaymentsService: {
    initiatePayment: ReturnType<typeof vi.fn>;
    verifyPayment: ReturnType<typeof vi.fn>;
    getReceipt: ReturnType<typeof vi.fn>;
    getPaymentsByOrder: ReturnType<typeof vi.fn>;
    processRefund: ReturnType<typeof vi.fn>;
  };
  let mockJwtService: {
    decode: ReturnType<typeof vi.fn>;
  };

  const mockUser: JwtPayload = {
    sub: "user-uuid-1",
    email: "manager@example.com",
    role: "MANAGER",
    roles: ["MANAGER"],
    type: "staff",
  };

  beforeEach(() => {
    mockPaymentsService = {
      initiatePayment: vi.fn(),
      verifyPayment: vi.fn(),
      getReceipt: vi.fn(),
      getPaymentsByOrder: vi.fn(),
      processRefund: vi.fn(),
    };

    mockJwtService = {
      decode: vi.fn(),
    };

    controller = new PaymentsController(
      mockPaymentsService as unknown as PaymentsService,
      mockJwtService as unknown as JwtService,
    );
  });

  it("should initiate payment with optional token extraction", async () => {
    const dto = {
      orderId: "ord-1",
      paymentMethod: "CASH" as const,
      amount: 15.0,
    };
    mockPaymentsService.initiatePayment.mockResolvedValue({ id: "pay-1", ...dto });

    const req = { headers: {} } as any;
    const result = await controller.initiate(dto, req);

    expect(result).toBeDefined();
    expect(mockPaymentsService.initiatePayment).toHaveBeenCalledWith(dto, undefined);
  });

  it("should verify payment status", async () => {
    const dto = { status: "PAID" as const, providerReference: "REF-1" };
    mockPaymentsService.verifyPayment.mockResolvedValue({ id: "pay-1", status: "PAID" });

    const req = { headers: {} } as any;
    const result = await controller.verify("pay-1", dto, req);

    expect(result).toBeDefined();
    expect(mockPaymentsService.verifyPayment).toHaveBeenCalledWith("pay-1", dto, undefined);
  });

  it("should get receipt for an order", async () => {
    mockPaymentsService.getReceipt.mockResolvedValue({ receiptNumber: "REC-2026-001" });

    const result = await controller.getReceipt("ord-1");

    expect(result.receiptNumber).toBe("REC-2026-001");
    expect(mockPaymentsService.getReceipt).toHaveBeenCalledWith("ord-1");
  });

  it("should retrieve all payments for an order", async () => {
    mockPaymentsService.getPaymentsByOrder.mockResolvedValue([{ id: "pay-1" }]);

    const result = await controller.getPaymentsByOrder("ord-1");

    expect(result).toHaveLength(1);
    expect(mockPaymentsService.getPaymentsByOrder).toHaveBeenCalledWith("ord-1");
  });

  it("should process authorized refund by staff user", async () => {
    const dto = { reason: "Damaged packaging", amount: 12.0 };
    mockPaymentsService.processRefund.mockResolvedValue({ id: "ref-1", amount: 12.0 });

    const result = await controller.processRefund("pay-1", dto, mockUser);

    expect(result.id).toBe("ref-1");
    expect(mockPaymentsService.processRefund).toHaveBeenCalledWith("pay-1", dto, mockUser.sub);
  });
});
