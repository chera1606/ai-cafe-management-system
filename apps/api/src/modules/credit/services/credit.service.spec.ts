import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditService } from "../../audit/audit.service";
import { CreditAccountStatus, CreditTransactionType } from "../dto/credit-constants";
import { CreditService } from "./credit.service";

describe("CreditService", () => {
  let service: CreditService;
  let mockAuditService: AuditService;

  beforeEach(() => {
    mockAuditService = {
      record: vi.fn().mockResolvedValue(undefined),
    } as unknown as AuditService;

    service = new CreditService(null, mockAuditService);
  });

  it("should initialize with pre-seeded corporate and regular accounts", async () => {
    const accounts = await service.getCreditAccounts();
    expect(accounts.length).toBeGreaterThanOrEqual(6);
    expect(accounts[0]?.customerName).toBe("Ethiopian Airlines Aviation Academy");
    expect(accounts[0]?.creditLimit).toBe(50000.0);
    expect(accounts[0]?.availableCredit).toBe(50000.0 - accounts[0]!.currentBalance);
  });

  it("should filter accounts by status and search query", async () => {
    const active = await service.getCreditAccounts({ status: CreditAccountStatus.ACTIVE });
    expect(active.every((a) => a.status === CreditAccountStatus.ACTIVE)).toBe(true);

    const searched = await service.getCreditAccounts({ search: "Commercial Bank" });
    expect(searched.length).toBe(1);
    expect(searched[0]?.customerName).toContain("Commercial Bank");
  });

  it("should retrieve an account by ID with transactions ledger", async () => {
    const accounts = await service.getCreditAccounts();
    const firstId = accounts[0]!.id;

    const detailed = await service.getCreditAccountById(firstId);
    expect(detailed.id).toBe(firstId);
    expect(Array.isArray(detailed.transactions)).toBe(true);
    expect(detailed.transactions.length).toBeGreaterThanOrEqual(1);
  });

  it("should throw NotFoundException for non-existent account ID", async () => {
    await expect(service.getCreditAccountById("non-existent-id")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should charge account successfully within credit limit", async () => {
    const accounts = await service.getCreditAccounts();
    const account = accounts[0]!;
    const prevBalance = account.currentBalance;
    const chargeAmount = 1500.0;

    const result = await service.chargeCreditAccount(account.id, {
      amount: chargeAmount,
      reference: "ORDER-POS-99",
      notes: "Lunch catering",
    });

    expect(result.currentBalance).toBe(Number((prevBalance + chargeAmount).toFixed(2)));
    expect(result.transaction.transactionType).toBe(CreditTransactionType.CHARGE);
    expect(result.transaction.amount).toBe(chargeAmount);
    expect(mockAuditService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREDIT_ACCOUNT_CHARGED" }),
    );
  });

  it("should reject charge exceeding authorized credit limit", async () => {
    const accounts = await service.getCreditAccounts();
    const account = accounts[0]!;
    const excessiveCharge = account.creditLimit * 2;

    await expect(
      service.chargeCreditAccount(account.id, {
        amount: excessiveCharge,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should reject charge on a FROZEN account", async () => {
    const accounts = await service.getCreditAccounts({ status: CreditAccountStatus.FROZEN });
    const frozenAccount = accounts[0]!;

    await expect(
      service.chargeCreditAccount(frozenAccount.id, {
        amount: 100.0,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should record payment and reduce outstanding balance", async () => {
    const accounts = await service.getCreditAccounts();
    const account = accounts[0]!;
    const prevBalance = account.currentBalance;
    const paymentAmount = 2000.0;

    const result = await service.recordPayment(account.id, {
      amount: paymentAmount,
      paymentMethod: "TELEBIRR",
      reference: "TX-TELE-0012",
    });

    expect(result.currentBalance).toBe(Number((prevBalance - paymentAmount).toFixed(2)));
    expect(result.transaction.transactionType).toBe(CreditTransactionType.PAYMENT);
    expect(mockAuditService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREDIT_PAYMENT_RECORDED" }),
    );
  });

  it("should record audit-governed balance adjustment", async () => {
    const accounts = await service.getCreditAccounts();
    const account = accounts[0]!;
    const prevBalance = account.currentBalance;
    const adjustment = -500.0;

    const result = await service.adjustBalance(account.id, {
      amount: adjustment,
      reason: "Billing reconciliation correction for duplicate invoice #402",
    });

    expect(result.currentBalance).toBe(Number((prevBalance + adjustment).toFixed(2)));
    expect(result.transaction.transactionType).toBe(CreditTransactionType.ADJUSTMENT);
    expect(mockAuditService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREDIT_BALANCE_ADJUSTED" }),
    );
  });

  it("should compute credit analytics correctly", async () => {
    const analytics = await service.getCreditAnalytics();

    expect(analytics.totalAccounts).toBe(6);
    expect(analytics.activeAccounts).toBe(5);
    expect(analytics.frozenAccounts).toBe(1);
    expect(analytics.totalCreditLimit).toBeGreaterThan(0);
    expect(analytics.totalOutstandingBalance).toBeGreaterThan(0);
    expect(analytics.totalAvailableCredit).toBe(
      Number((analytics.totalCreditLimit - analytics.totalOutstandingBalance).toFixed(2)),
    );
    expect(analytics.overallUtilizationRate).toBeGreaterThan(0);
  });
});
