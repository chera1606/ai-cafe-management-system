import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  type Database,
  creditAccounts,
  creditTransactions,
  customers,
} from "@cafe/db";
import { AuditService } from "../../audit/audit.service";
import { DATABASE_TOKEN } from "../../database/database.constants";
import type {
  AdjustCreditBalanceDto,
  ChargeCreditAccountDto,
  CreateCreditAccountDto,
  CreditQueryDto,
  RecordCreditPaymentDto,
  UpdateCreditAccountDto,
} from "../dto";
import { CreditAccountStatus, CreditTransactionType } from "../dto/credit-constants";

export interface CreditAccountWithDetails {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  utilizationRate: number;
  status: CreditAccountStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransactionRecord {
  id: string;
  creditAccountId: string;
  orderId?: string | null;
  paymentId?: string | null;
  transactionType: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  reference?: string | null;
  occurredAt: Date;
  createdBy: string;
  createdAt: Date;
}

export interface CreditAnalytics {
  totalAccounts: number;
  activeAccounts: number;
  frozenAccounts: number;
  totalCreditLimit: number;
  totalOutstandingBalance: number;
  totalAvailableCredit: number;
  overallUtilizationRate: number;
  recentTransactions: CreditTransactionRecord[];
}

interface InMemAccount {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  creditLimit: number;
  currentBalance: number;
  status: CreditAccountStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InMemTransaction {
  id: string;
  creditAccountId: string;
  orderId?: string;
  paymentId?: string;
  transactionType: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  reference?: string;
  occurredAt: Date;
  createdBy: string;
  createdAt: Date;
}

const SEED_CUSTOMERS = [
  {
    id: "88888888-1111-4000-8000-000000000001",
    name: "Ethiopian Airlines Aviation Academy",
    phone: "+251 11 665 0500",
    email: "procurement@ethiopianairlines.com",
  },
  {
    id: "88888888-1111-4000-8000-000000000002",
    name: "Commercial Bank of Ethiopia Head Office",
    phone: "+251 11 551 5004",
    email: "executive-catering@cbe.com.et",
  },
  {
    id: "88888888-1111-4000-8000-000000000003",
    name: "United Nations UNECA Staff Council",
    phone: "+251 11 544 4444",
    email: "staff-council@uneca.org",
  },
  {
    id: "88888888-1111-4000-8000-000000000004",
    name: "Bole Medhanialem Innovation Hub",
    phone: "+251 91 120 4589",
    email: "accounts@boletechhub.et",
  },
  {
    id: "88888888-1111-4000-8000-000000000005",
    name: "Addis Artisan Roasters Collective",
    phone: "+251 92 344 7812",
    email: "contact@addiscoffeeroasters.et",
  },
  {
    id: "88888888-1111-4000-8000-000000000006",
    name: "Meskel Square Media Bureau",
    phone: "+251 11 550 1289",
    email: "press@meskelmedia.et",
  },
];

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);
  private inMemAccounts: InMemAccount[] = [];
  private inMemTransactions: InMemTransaction[] = [];
  private isDbConnected = false;

  constructor(
    @Optional()
    @Inject(DATABASE_TOKEN)
    private readonly db: Database | null,
    private readonly auditService: AuditService,
  ) {
    this.initFallbackStore();
  }

  private initFallbackStore(): void {
    const now = new Date();
    this.inMemAccounts = [
      {
        id: "77777777-1111-4000-8000-000000000001",
        customerId: SEED_CUSTOMERS[0]!.id,
        customerName: SEED_CUSTOMERS[0]!.name,
        customerPhone: SEED_CUSTOMERS[0]!.phone,
        customerEmail: SEED_CUSTOMERS[0]!.email,
        creditLimit: 50000.0,
        currentBalance: 12450.0,
        status: CreditAccountStatus.ACTIVE,
        notes: "Corporate catering account approved for flight crews",
        createdAt: new Date(now.getTime() - 90 * 86400000),
        updatedAt: now,
      },
      {
        id: "77777777-1111-4000-8000-000000000002",
        customerId: SEED_CUSTOMERS[1]!.id,
        customerName: SEED_CUSTOMERS[1]!.name,
        customerPhone: SEED_CUSTOMERS[1]!.phone,
        customerEmail: SEED_CUSTOMERS[1]!.email,
        creditLimit: 40000.0,
        currentBalance: 8200.0,
        status: CreditAccountStatus.ACTIVE,
        notes: "Executive floor coffee service tab",
        createdAt: new Date(now.getTime() - 75 * 86400000),
        updatedAt: now,
      },
      {
        id: "77777777-1111-4000-8000-000000000003",
        customerId: SEED_CUSTOMERS[2]!.id,
        customerName: SEED_CUSTOMERS[2]!.name,
        customerPhone: SEED_CUSTOMERS[2]!.phone,
        customerEmail: SEED_CUSTOMERS[2]!.email,
        creditLimit: 35000.0,
        currentBalance: 21350.0,
        status: CreditAccountStatus.ACTIVE,
        notes: "Delegation and conference dining account",
        createdAt: new Date(now.getTime() - 60 * 86400000),
        updatedAt: now,
      },
      {
        id: "77777777-1111-4000-8000-000000000004",
        customerId: SEED_CUSTOMERS[3]!.id,
        customerName: SEED_CUSTOMERS[3]!.name,
        customerPhone: SEED_CUSTOMERS[3]!.phone,
        customerEmail: SEED_CUSTOMERS[3]!.email,
        creditLimit: 20000.0,
        currentBalance: 3120.0,
        status: CreditAccountStatus.ACTIVE,
        notes: "Tech co-working space monthly barista tab",
        createdAt: new Date(now.getTime() - 40 * 86400000),
        updatedAt: now,
      },
      {
        id: "77777777-1111-4000-8000-000000000005",
        customerId: SEED_CUSTOMERS[4]!.id,
        customerName: SEED_CUSTOMERS[4]!.name,
        customerPhone: SEED_CUSTOMERS[4]!.phone,
        customerEmail: SEED_CUSTOMERS[4]!.email,
        creditLimit: 15000.0,
        currentBalance: 15000.0,
        status: CreditAccountStatus.FROZEN,
        notes: "Account limit reached, pending quarterly settlement",
        createdAt: new Date(now.getTime() - 50 * 86400000),
        updatedAt: now,
      },
      {
        id: "77777777-1111-4000-8000-000000000006",
        customerId: SEED_CUSTOMERS[5]!.id,
        customerName: SEED_CUSTOMERS[5]!.name,
        customerPhone: SEED_CUSTOMERS[5]!.phone,
        customerEmail: SEED_CUSTOMERS[5]!.email,
        creditLimit: 10000.0,
        currentBalance: 0.0,
        status: CreditAccountStatus.ACTIVE,
        notes: "New facility opened, zero outstanding balance",
        createdAt: new Date(now.getTime() - 10 * 86400000),
        updatedAt: now,
      },
    ];

    this.inMemTransactions = [
      {
        id: "tt-1",
        creditAccountId: this.inMemAccounts[0]!.id,
        transactionType: CreditTransactionType.CHARGE,
        amount: 2450.0,
        balanceAfter: 12450.0,
        reference: "POS-INV-2026-904",
        occurredAt: new Date(now.getTime() - 2 * 86400000),
        createdBy: "SYSTEM",
        createdAt: new Date(now.getTime() - 2 * 86400000),
      },
      {
        id: "tt-2",
        creditAccountId: this.inMemAccounts[0]!.id,
        transactionType: CreditTransactionType.PAYMENT,
        amount: 5000.0,
        balanceAfter: 10000.0,
        reference: "CBE-FT2026-881",
        occurredAt: new Date(now.getTime() - 7 * 86400000),
        createdBy: "SYSTEM",
        createdAt: new Date(now.getTime() - 7 * 86400000),
      },
      {
        id: "tt-3",
        creditAccountId: this.inMemAccounts[1]!.id,
        transactionType: CreditTransactionType.CHARGE,
        amount: 1800.0,
        balanceAfter: 8200.0,
        reference: "POS-INV-2026-891",
        occurredAt: new Date(now.getTime() - 3 * 86400000),
        createdBy: "SYSTEM",
        createdAt: new Date(now.getTime() - 3 * 86400000),
      },
      {
        id: "tt-4",
        creditAccountId: this.inMemAccounts[2]!.id,
        transactionType: CreditTransactionType.CHARGE,
        amount: 4200.0,
        balanceAfter: 21350.0,
        reference: "POS-INV-2026-880",
        occurredAt: new Date(now.getTime() - 4 * 86400000),
        createdBy: "SYSTEM",
        createdAt: new Date(now.getTime() - 4 * 86400000),
      },
    ];

    this.logger.log(
      `Initialized CreditService with ${this.inMemAccounts.length} pre-seeded credit accounts.`,
    );
  }

  private mapAccountDetails(acc: InMemAccount): CreditAccountWithDetails {
    const limit = Number(acc.creditLimit);
    const balance = Number(acc.currentBalance);
    const available = Math.max(0, Number((limit - balance).toFixed(2)));
    const utilizationRate =
      limit > 0 ? Number(((balance / limit) * 100).toFixed(1)) : 0;

    return {
      id: acc.id,
      customerId: acc.customerId,
      customerName: acc.customerName,
      customerPhone: acc.customerPhone,
      customerEmail: acc.customerEmail,
      creditLimit: limit,
      currentBalance: balance,
      availableCredit: available,
      utilizationRate,
      status: acc.status,
      notes: acc.notes,
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt,
    };
  }

  async getCreditAccounts(query?: CreditQueryDto): Promise<CreditAccountWithDetails[]> {
    if (this.db) {
      try {
        const rows = await this.db
          .select({
            id: creditAccounts.id,
            customerId: creditAccounts.customerId,
            customerName: customers.name,
            customerPhone: customers.phone,
            customerEmail: customers.email,
            creditLimit: creditAccounts.creditLimit,
            currentBalance: creditAccounts.currentBalance,
            status: creditAccounts.status,
            createdAt: creditAccounts.createdAt,
            updatedAt: creditAccounts.updatedAt,
          })
          .from(creditAccounts)
          .innerJoin(customers, eq(creditAccounts.customerId, customers.id))
          .orderBy(desc(creditAccounts.updatedAt));

        if (rows.length > 0) {
          this.isDbConnected = true;
          let mapped = rows.map((r) => {
            const limit = Number(r.creditLimit);
            const balance = Number(r.currentBalance);
            const available = Math.max(0, Number((limit - balance).toFixed(2)));
            const rate = limit > 0 ? Number(((balance / limit) * 100).toFixed(1)) : 0;
            return {
              id: r.id,
              customerId: r.customerId,
              customerName: r.customerName,
              customerPhone: r.customerPhone,
              customerEmail: r.customerEmail,
              creditLimit: limit,
              currentBalance: balance,
              availableCredit: available,
              utilizationRate: rate,
              status: r.status as CreditAccountStatus,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            };
          });

          if (query?.status) {
            mapped = mapped.filter((a) => a.status === query.status);
          }
          if (query?.search?.trim()) {
            const term = query.search.trim().toLowerCase();
            mapped = mapped.filter(
              (a) =>
                a.customerName.toLowerCase().includes(term) ||
                (a.customerPhone && a.customerPhone.includes(term)) ||
                (a.customerEmail && a.customerEmail.toLowerCase().includes(term)),
            );
          }
          return mapped;
        }
      } catch (err) {
        this.logger.warn(`Database query failed, using in-memory credit store: ${String(err)}`);
      }
    }

    let accounts = [...this.inMemAccounts];
    if (query?.status) {
      accounts = accounts.filter((a) => a.status === query.status);
    }
    if (query?.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      accounts = accounts.filter(
        (a) =>
          a.customerName.toLowerCase().includes(term) ||
          (a.customerPhone && a.customerPhone.includes(term)) ||
          (a.customerEmail && a.customerEmail.toLowerCase().includes(term)),
      );
    }

    return accounts.map((a) => this.mapAccountDetails(a));
  }

  async getCreditAccountById(
    id: string,
  ): Promise<CreditAccountWithDetails & { transactions: CreditTransactionRecord[] }> {
    const acc = this.inMemAccounts.find((a) => a.id === id);
    if (!acc) {
      throw new NotFoundException(`Credit account with ID ${id} not found`);
    }

    const txs = this.inMemTransactions
      .filter((t) => t.creditAccountId === id)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    return {
      ...this.mapAccountDetails(acc),
      transactions: txs,
    };
  }

  async getCreditAccountByCustomerId(
    customerId: string,
  ): Promise<CreditAccountWithDetails | null> {
    const acc = this.inMemAccounts.find((a) => a.customerId === customerId);
    if (!acc) return null;
    return this.mapAccountDetails(acc);
  }

  async createCreditAccount(
    dto: CreateCreditAccountDto,
    actorId?: string,
  ): Promise<CreditAccountWithDetails> {
    const existing = this.inMemAccounts.find((a) => a.customerId === dto.customerId);
    if (existing) {
      throw new BadRequestException("A credit account already exists for this customer");
    }

    const seedCust = SEED_CUSTOMERS.find((c) => c.id === dto.customerId);
    const customerName = seedCust?.name || "Corporate Customer";
    const initialBal = dto.initialBalance || 0;

    const newAcc: InMemAccount = {
      id: `acc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      customerId: dto.customerId,
      customerName,
      customerPhone: seedCust?.phone,
      customerEmail: seedCust?.email,
      creditLimit: dto.creditLimit,
      currentBalance: initialBal,
      status: dto.status || CreditAccountStatus.ACTIVE,
      notes: dto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemAccounts.unshift(newAcc);

    if (initialBal > 0) {
      this.inMemTransactions.unshift({
        id: `tx-${Date.now()}`,
        creditAccountId: newAcc.id,
        transactionType: CreditTransactionType.CHARGE,
        amount: initialBal,
        balanceAfter: initialBal,
        reference: "Initial facility balance setup",
        occurredAt: new Date(),
        createdBy: actorId || "SYSTEM",
        createdAt: new Date(),
      });
    }

    await this.auditService.record({
      actorId: actorId || "SYSTEM",
      action: "CREDIT_ACCOUNT_CREATED",
      resourceType: "credit_accounts",
      resourceId: newAcc.id,
      metadata: {
        customerId: dto.customerId,
        creditLimit: dto.creditLimit,
        initialBalance: initialBal,
      },
    });

    return this.mapAccountDetails(newAcc);
  }

  async updateCreditAccount(
    id: string,
    dto: UpdateCreditAccountDto,
    actorId?: string,
  ): Promise<CreditAccountWithDetails> {
    const acc = this.inMemAccounts.find((a) => a.id === id);
    if (!acc) {
      throw new NotFoundException(`Credit account ${id} not found`);
    }

    if (dto.creditLimit !== undefined) {
      if (dto.creditLimit < acc.currentBalance) {
        throw new BadRequestException(
          `New credit limit (ETB ${dto.creditLimit}) cannot be lower than current outstanding balance (ETB ${acc.currentBalance})`,
        );
      }
      acc.creditLimit = dto.creditLimit;
    }

    if (dto.status) {
      acc.status = dto.status;
    }

    if (dto.notes !== undefined) {
      acc.notes = dto.notes;
    }

    acc.updatedAt = new Date();

    await this.auditService.record({
      actorId: actorId || "SYSTEM",
      action: "CREDIT_ACCOUNT_UPDATED",
      resourceType: "credit_accounts",
      resourceId: id,
      metadata: { ...dto },
    });

    return this.mapAccountDetails(acc);
  }

  async chargeCreditAccount(
    id: string,
    dto: ChargeCreditAccountDto,
    actorId?: string,
  ): Promise<CreditAccountWithDetails & { transaction: CreditTransactionRecord }> {
    const acc = this.inMemAccounts.find((a) => a.id === id);
    if (!acc) {
      throw new NotFoundException(`Credit account ${id} not found`);
    }

    if (acc.status === CreditAccountStatus.FROZEN) {
      throw new BadRequestException("Credit account is FROZEN. Settle outstanding balance before charging new tickets.");
    }

    if (acc.status === CreditAccountStatus.CLOSED) {
      throw new BadRequestException("Credit account is CLOSED.");
    }

    const newBalance = Number((acc.currentBalance + dto.amount).toFixed(2));
    if (newBalance > acc.creditLimit) {
      const available = Math.max(0, acc.creditLimit - acc.currentBalance);
      throw new BadRequestException(
        `Charge of ETB ${dto.amount.toFixed(2)} exceeds authorized limit. Available credit: ETB ${available.toFixed(2)} (Limit: ETB ${acc.creditLimit.toFixed(2)})`,
      );
    }

    acc.currentBalance = newBalance;
    acc.updatedAt = new Date();

    if (acc.currentBalance >= acc.creditLimit) {
      acc.status = CreditAccountStatus.FROZEN;
    }

    const tx: InMemTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      creditAccountId: id,
      orderId: dto.orderId,
      transactionType: CreditTransactionType.CHARGE,
      amount: dto.amount,
      balanceAfter: newBalance,
      reference: dto.reference || dto.notes || "Order charged to house tab",
      occurredAt: new Date(),
      createdBy: actorId || "CASHIER",
      createdAt: new Date(),
    };

    this.inMemTransactions.unshift(tx);

    await this.auditService.record({
      actorId: actorId || "CASHIER",
      action: "CREDIT_ACCOUNT_CHARGED",
      resourceType: "credit_accounts",
      resourceId: id,
      metadata: {
        orderId: dto.orderId,
        amount: dto.amount,
        balanceAfter: newBalance,
        reference: dto.reference,
      },
    });

    return {
      ...this.mapAccountDetails(acc),
      transaction: tx,
    };
  }

  async recordPayment(
    id: string,
    dto: RecordCreditPaymentDto,
    actorId?: string,
  ): Promise<CreditAccountWithDetails & { transaction: CreditTransactionRecord }> {
    const acc = this.inMemAccounts.find((a) => a.id === id);
    if (!acc) {
      throw new NotFoundException(`Credit account ${id} not found`);
    }

    const newBalance = Math.max(0, Number((acc.currentBalance - dto.amount).toFixed(2)));
    acc.currentBalance = newBalance;
    acc.updatedAt = new Date();

    // If account was FROZEN due to credit limit and balance was reduced, reactivate it
    if (acc.status === CreditAccountStatus.FROZEN && acc.currentBalance < acc.creditLimit) {
      acc.status = CreditAccountStatus.ACTIVE;
    }

    const tx: InMemTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      creditAccountId: id,
      paymentId: dto.paymentId,
      transactionType: CreditTransactionType.PAYMENT,
      amount: dto.amount,
      balanceAfter: newBalance,
      reference:
        dto.reference ||
        `Settlement via ${dto.paymentMethod || "CASH"} ${dto.notes ? `- ${dto.notes}` : ""}`,
      occurredAt: new Date(),
      createdBy: actorId || "FINANCE",
      createdAt: new Date(),
    };

    this.inMemTransactions.unshift(tx);

    await this.auditService.record({
      actorId: actorId || "FINANCE",
      action: "CREDIT_PAYMENT_RECORDED",
      resourceType: "credit_accounts",
      resourceId: id,
      metadata: {
        amount: dto.amount,
        paymentMethod: dto.paymentMethod || "CASH",
        balanceAfter: newBalance,
        reference: dto.reference,
      },
    });

    return {
      ...this.mapAccountDetails(acc),
      transaction: tx,
    };
  }

  async adjustBalance(
    id: string,
    dto: AdjustCreditBalanceDto,
    actorId?: string,
  ): Promise<CreditAccountWithDetails & { transaction: CreditTransactionRecord }> {
    const acc = this.inMemAccounts.find((a) => a.id === id);
    if (!acc) {
      throw new NotFoundException(`Credit account ${id} not found`);
    }

    const newBalance = Number((acc.currentBalance + dto.amount).toFixed(2));
    if (newBalance < 0) {
      throw new BadRequestException("Adjustment would cause negative account balance");
    }

    if (newBalance > acc.creditLimit) {
      throw new BadRequestException(
        `Adjustment would exceed credit limit of ETB ${acc.creditLimit} (Resulting balance: ETB ${newBalance})`,
      );
    }

    acc.currentBalance = newBalance;
    acc.updatedAt = new Date();

    const tx: InMemTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      creditAccountId: id,
      transactionType: CreditTransactionType.ADJUSTMENT,
      amount: Math.abs(dto.amount),
      balanceAfter: newBalance,
      reference: `AUDIT ADJUSTMENT: ${dto.reason}`,
      occurredAt: new Date(),
      createdBy: actorId || "ADMIN",
      createdAt: new Date(),
    };

    this.inMemTransactions.unshift(tx);

    await this.auditService.record({
      actorId: actorId || "ADMIN",
      action: "CREDIT_BALANCE_ADJUSTED",
      resourceType: "credit_accounts",
      resourceId: id,
      metadata: {
        adjustmentAmount: dto.amount,
        balanceAfter: newBalance,
        reason: dto.reason,
      },
    });

    return {
      ...this.mapAccountDetails(acc),
      transaction: tx,
    };
  }

  async getCreditAnalytics(): Promise<CreditAnalytics> {
    const accounts = this.inMemAccounts;
    let totalLimit = 0;
    let totalBalance = 0;
    let activeCount = 0;
    let frozenCount = 0;

    for (const a of accounts) {
      totalLimit += a.creditLimit;
      totalBalance += a.currentBalance;
      if (a.status === CreditAccountStatus.ACTIVE) activeCount += 1;
      if (a.status === CreditAccountStatus.FROZEN) frozenCount += 1;
    }

    const available = Math.max(0, Number((totalLimit - totalBalance).toFixed(2)));
    const utilization =
      totalLimit > 0 ? Number(((totalBalance / totalLimit) * 100).toFixed(1)) : 0;

    const recent = [...this.inMemTransactions]
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 10);

    return {
      totalAccounts: accounts.length,
      activeAccounts: activeCount,
      frozenAccounts: frozenCount,
      totalCreditLimit: Number(totalLimit.toFixed(2)),
      totalOutstandingBalance: Number(totalBalance.toFixed(2)),
      totalAvailableCredit: available,
      overallUtilizationRate: utilization,
      recentTransactions: recent,
    };
  }
}
