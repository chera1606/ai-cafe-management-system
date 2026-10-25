import { apiClient } from "./api-client";

export type CreditAccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type CreditTransactionType = "CHARGE" | "PAYMENT" | "ADJUSTMENT";

export interface CreditTransactionEntity {
  id: string;
  creditAccountId: string;
  orderId?: string | null;
  paymentId?: string | null;
  transactionType: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  reference?: string | null;
  occurredAt: string;
  createdBy: string;
  createdAt: string;
}

export interface CreditAccountEntity {
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
  createdAt: string;
  updatedAt: string;
  transactions?: CreditTransactionEntity[];
}

export interface CreditAnalytics {
  totalAccounts: number;
  activeAccounts: number;
  frozenAccounts: number;
  totalCreditLimit: number;
  totalOutstandingBalance: number;
  totalAvailableCredit: number;
  overallUtilizationRate: number;
  recentTransactions: CreditTransactionEntity[];
}

const FALLBACK_ACCOUNTS: CreditAccountEntity[] = [
  {
    id: "77777777-1111-4000-8000-000000000001",
    customerId: "88888888-1111-4000-8000-000000000001",
    customerName: "Ethiopian Airlines Aviation Academy",
    customerPhone: "+251 11 665 0500",
    customerEmail: "procurement@ethiopianairlines.com",
    creditLimit: 50000.0,
    currentBalance: 12450.0,
    availableCredit: 37550.0,
    utilizationRate: 24.9,
    status: "ACTIVE",
    notes: "Corporate catering account approved for flight crews",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "77777777-1111-4000-8000-000000000002",
    customerId: "88888888-1111-4000-8000-000000000002",
    customerName: "Commercial Bank of Ethiopia Head Office",
    customerPhone: "+251 11 551 5004",
    customerEmail: "executive-catering@cbe.com.et",
    creditLimit: 40000.0,
    currentBalance: 8200.0,
    availableCredit: 31800.0,
    utilizationRate: 20.5,
    status: "ACTIVE",
    notes: "Executive floor coffee service tab",
    createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "77777777-1111-4000-8000-000000000003",
    customerId: "88888888-1111-4000-8000-000000000003",
    customerName: "United Nations UNECA Staff Council",
    customerPhone: "+251 11 544 4444",
    customerEmail: "staff-council@uneca.org",
    creditLimit: 35000.0,
    currentBalance: 21350.0,
    availableCredit: 13650.0,
    utilizationRate: 61.0,
    status: "ACTIVE",
    notes: "Delegation and conference dining account",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "77777777-1111-4000-8000-000000000004",
    customerId: "88888888-1111-4000-8000-000000000004",
    customerName: "Bole Medhanialem Innovation Hub",
    customerPhone: "+251 91 120 4589",
    customerEmail: "accounts@boletechhub.et",
    creditLimit: 20000.0,
    currentBalance: 3120.0,
    availableCredit: 16880.0,
    utilizationRate: 15.6,
    status: "ACTIVE",
    notes: "Tech co-working space monthly barista tab",
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "77777777-1111-4000-8000-000000000005",
    customerId: "88888888-1111-4000-8000-000000000005",
    customerName: "Addis Artisan Roasters Collective",
    customerPhone: "+251 92 344 7812",
    customerEmail: "contact@addiscoffeeroasters.et",
    creditLimit: 15000.0,
    currentBalance: 15000.0,
    availableCredit: 0.0,
    utilizationRate: 100.0,
    status: "FROZEN",
    notes: "Account limit reached, pending quarterly settlement",
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "77777777-1111-4000-8000-000000000006",
    customerId: "88888888-1111-4000-8000-000000000006",
    customerName: "Meskel Square Media Bureau",
    customerPhone: "+251 11 550 1289",
    customerEmail: "press@meskelmedia.et",
    creditLimit: 10000.0,
    currentBalance: 0.0,
    availableCredit: 10000.0,
    utilizationRate: 0.0,
    status: "ACTIVE",
    notes: "New facility opened, zero outstanding balance",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FALLBACK_TRANSACTIONS: CreditTransactionEntity[] = [
  {
    id: "tt-1",
    creditAccountId: "77777777-1111-4000-8000-000000000001",
    transactionType: "CHARGE",
    amount: 2450.0,
    balanceAfter: 12450.0,
    reference: "POS-INV-2026-904",
    occurredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdBy: "SYSTEM",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "tt-2",
    creditAccountId: "77777777-1111-4000-8000-000000000001",
    transactionType: "PAYMENT",
    amount: 5000.0,
    balanceAfter: 10000.0,
    reference: "CBE-FT2026-881",
    occurredAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdBy: "SYSTEM",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "tt-3",
    creditAccountId: "77777777-1111-4000-8000-000000000002",
    transactionType: "CHARGE",
    amount: 1800.0,
    balanceAfter: 8200.0,
    reference: "POS-INV-2026-891",
    occurredAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdBy: "SYSTEM",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "tt-4",
    creditAccountId: "77777777-1111-4000-8000-000000000003",
    transactionType: "CHARGE",
    amount: 4200.0,
    balanceAfter: 21350.0,
    reference: "POS-INV-2026-880",
    occurredAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdBy: "SYSTEM",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export async function fetchCreditAccounts(params?: {
  status?: CreditAccountStatus;
  search?: string;
}): Promise<CreditAccountEntity[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const endpoint = `/credit/accounts${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    return await apiClient<CreditAccountEntity[]>(endpoint);
  } catch {
    let list = [...FALLBACK_ACCOUNTS];
    if (params?.status) {
      list = list.filter((a) => a.status === params.status);
    }
    if (params?.search?.trim()) {
      const term = params.search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.customerName.toLowerCase().includes(term) ||
          (a.customerPhone && a.customerPhone.includes(term)) ||
          (a.customerEmail && a.customerEmail.toLowerCase().includes(term)),
      );
    }
    return list;
  }
}

export async function fetchCreditAnalytics(): Promise<CreditAnalytics> {
  try {
    return await apiClient<CreditAnalytics>("/credit/accounts/analytics");
  } catch {
    let totalLimit = 0;
    let totalBalance = 0;
    let activeCount = 0;
    let frozenCount = 0;

    for (const a of FALLBACK_ACCOUNTS) {
      totalLimit += a.creditLimit;
      totalBalance += a.currentBalance;
      if (a.status === "ACTIVE") activeCount += 1;
      if (a.status === "FROZEN") frozenCount += 1;
    }

    const available = Math.max(0, Number((totalLimit - totalBalance).toFixed(2)));
    const util = totalLimit > 0 ? Number(((totalBalance / totalLimit) * 100).toFixed(1)) : 0;

    return {
      totalAccounts: FALLBACK_ACCOUNTS.length,
      activeAccounts: activeCount,
      frozenAccounts: frozenCount,
      totalCreditLimit: Number(totalLimit.toFixed(2)),
      totalOutstandingBalance: Number(totalBalance.toFixed(2)),
      totalAvailableCredit: available,
      overallUtilizationRate: util,
      recentTransactions: FALLBACK_TRANSACTIONS,
    };
  }
}

export async function fetchCreditAccountById(
  id: string,
): Promise<CreditAccountEntity & { transactions: CreditTransactionEntity[] }> {
  try {
    return await apiClient<CreditAccountEntity & { transactions: CreditTransactionEntity[] }>(
      `/credit/accounts/${id}`,
    );
  } catch {
    const acc =
      FALLBACK_ACCOUNTS.find((a) => a.id === id) || FALLBACK_ACCOUNTS[0]!;
    const txs = FALLBACK_TRANSACTIONS.filter((t) => t.creditAccountId === id);
    return { ...acc, transactions: txs };
  }
}

export async function fetchCreditAccountByCustomerId(
  customerId: string,
): Promise<CreditAccountEntity | null> {
  try {
    return await apiClient<CreditAccountEntity>(`/credit/accounts/customer/${customerId}`);
  } catch {
    return FALLBACK_ACCOUNTS.find((a) => a.customerId === customerId) || null;
  }
}

export async function createCreditAccount(data: {
  customerId: string;
  creditLimit: number;
  initialBalance?: number;
  status?: CreditAccountStatus;
  notes?: string;
}): Promise<CreditAccountEntity> {
  return apiClient<CreditAccountEntity>("/credit/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCreditAccount(
  id: string,
  data: {
    creditLimit?: number;
    status?: CreditAccountStatus;
    notes?: string;
  },
): Promise<CreditAccountEntity> {
  return apiClient<CreditAccountEntity>(`/credit/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function chargeCreditAccount(
  id: string,
  data: {
    amount: number;
    orderId?: string;
    reference?: string;
    notes?: string;
  },
): Promise<CreditAccountEntity & { transaction: CreditTransactionEntity }> {
  return apiClient<CreditAccountEntity & { transaction: CreditTransactionEntity }>(
    `/credit/accounts/${id}/charge`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function recordCreditPayment(
  id: string,
  data: {
    amount: number;
    paymentMethod?: string;
    reference?: string;
    notes?: string;
  },
): Promise<CreditAccountEntity & { transaction: CreditTransactionEntity }> {
  return apiClient<CreditAccountEntity & { transaction: CreditTransactionEntity }>(
    `/credit/accounts/${id}/payment`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function adjustCreditBalance(
  id: string,
  data: {
    amount: number;
    reason: string;
  },
): Promise<CreditAccountEntity & { transaction: CreditTransactionEntity }> {
  return apiClient<CreditAccountEntity & { transaction: CreditTransactionEntity }>(
    `/credit/accounts/${id}/adjust`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}
