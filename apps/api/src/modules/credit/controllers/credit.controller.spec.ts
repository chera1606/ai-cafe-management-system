import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreditAccountStatus } from "../dto/credit-constants";
import type { CreditService } from "../services/credit.service";
import { CreditController } from "./credit.controller";

describe("CreditController", () => {
  let controller: CreditController;
  let mockCreditService: CreditService;
  let mockJwtService: { decode: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockCreditService = {
      getCreditAccounts: vi.fn().mockResolvedValue([
        {
          id: "acc-1",
          customerName: "Ethiopian Airlines",
          creditLimit: 50000,
          currentBalance: 12000,
          availableCredit: 38000,
          status: CreditAccountStatus.ACTIVE,
        },
      ]),
      getCreditAnalytics: vi.fn().mockResolvedValue({
        totalAccounts: 1,
        activeAccounts: 1,
        totalCreditLimit: 50000,
        totalOutstandingBalance: 12000,
      }),
      getCreditAccountById: vi.fn().mockResolvedValue({
        id: "acc-1",
        customerName: "Ethiopian Airlines",
        transactions: [],
      }),
      getCreditAccountByCustomerId: vi.fn().mockResolvedValue({
        id: "acc-1",
        customerId: "cust-1",
      }),
      createCreditAccount: vi.fn().mockResolvedValue({
        id: "acc-new",
        creditLimit: 20000,
      }),
      updateCreditAccount: vi.fn().mockResolvedValue({
        id: "acc-1",
        creditLimit: 60000,
      }),
      chargeCreditAccount: vi.fn().mockResolvedValue({
        id: "acc-1",
        currentBalance: 14000,
      }),
      recordPayment: vi.fn().mockResolvedValue({
        id: "acc-1",
        currentBalance: 9000,
      }),
      adjustBalance: vi.fn().mockResolvedValue({
        id: "acc-1",
        currentBalance: 11500,
      }),
    } as unknown as CreditService;

    mockJwtService = {
      decode: vi.fn().mockReturnValue({ sub: "user-test-id" }),
    };

    controller = new CreditController(
      mockCreditService,
      mockJwtService as any,
    );
  });

  it("should get credit accounts list", async () => {
    const result = await controller.getAccounts({});
    expect(result).toHaveLength(1);
    expect(mockCreditService.getCreditAccounts).toHaveBeenCalledWith({});
  });

  it("should get credit analytics", async () => {
    const result = await controller.getAnalytics();
    expect(result.totalCreditLimit).toBe(50000);
    expect(mockCreditService.getCreditAnalytics).toHaveBeenCalled();
  });

  it("should get account by customerId", async () => {
    const result = await controller.getAccountByCustomer("cust-1");
    expect(result?.id).toBe("acc-1");
    expect(mockCreditService.getCreditAccountByCustomerId).toHaveBeenCalledWith("cust-1");
  });

  it("should get account by ID", async () => {
    const result = await controller.getAccountById("acc-1");
    expect(result.id).toBe("acc-1");
    expect(mockCreditService.getCreditAccountById).toHaveBeenCalledWith("acc-1");
  });

  it("should create credit account", async () => {
    const req = { headers: { authorization: "Bearer mock-token" } } as Request;
    const result = await controller.createAccount(
      { customerId: "cust-1", creditLimit: 20000 },
      req,
    );
    expect(result.id).toBe("acc-new");
    expect(mockCreditService.createCreditAccount).toHaveBeenCalledWith(
      expect.objectContaining({ creditLimit: 20000 }),
      "user-test-id",
    );
  });

  it("should charge credit account", async () => {
    const req = { headers: {} } as Request;
    const result = await controller.chargeAccount(
      "acc-1",
      { amount: 2000, reference: "POS-INV-1" },
      req,
    );
    expect(result.currentBalance).toBe(14000);
    expect(mockCreditService.chargeCreditAccount).toHaveBeenCalledWith(
      "acc-1",
      expect.objectContaining({ amount: 2000 }),
      undefined,
    );
  });

  it("should record payment on account", async () => {
    const req = { headers: {} } as Request;
    const result = await controller.recordPayment(
      "acc-1",
      { amount: 3000, paymentMethod: "TELEBIRR" },
      req,
    );
    expect(result.currentBalance).toBe(9000);
    expect(mockCreditService.recordPayment).toHaveBeenCalledWith(
      "acc-1",
      expect.objectContaining({ amount: 3000 }),
      undefined,
    );
  });

  it("should adjust account balance with audit justification", async () => {
    const req = { headers: {} } as Request;
    const result = await controller.adjustBalance(
      "acc-1",
      { amount: -500, reason: "Invoice error reconciliation" },
      req,
    );
    expect(result.currentBalance).toBe(11500);
    expect(mockCreditService.adjustBalance).toHaveBeenCalledWith(
      "acc-1",
      expect.objectContaining({ amount: -500 }),
      undefined,
    );
  });
});
