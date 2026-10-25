/**
 * Typed dashboard service layer.
 * All totals, balances, and stock quantities are server-authoritative (SRS BR-001).
 * UI components only consume and display responses from this layer.
 * Easy drop-in swap with NestJS fetch/Axios endpoints later.
 */

import {
  type AuditRecord,
  type Complaint,
  type CustomerCreditAccount,
  type InventoryItem,
  MOCK_AUDIT_LOGS,
  MOCK_COMPLAINTS,
  MOCK_CUSTOMERS,
  MOCK_INVENTORY_ITEMS,
  MOCK_MENU_ITEMS,
  MOCK_ORDERS,
  MOCK_STAFF,
  type MenuItem,
  type Order,
  type StaffMember,
  type StockMovement,
} from "./mock-data";
import {
  adjustCreditBalance as adjustApiBalance,
  fetchCreditAccounts,
  recordCreditPayment as recordApiPayment,
} from "@/lib/credit-api";

// In-memory clones to support live mutations in dev mode
let currentOrders = [...MOCK_ORDERS];
let currentInventory = [...MOCK_INVENTORY_ITEMS];
let currentCustomers = [...MOCK_CUSTOMERS];
let currentMenuItems = [...MOCK_MENU_ITEMS];
let currentStaff = [...MOCK_STAFF];
let currentComplaints = [...MOCK_COMPLAINTS];
let currentAuditLogs = [...MOCK_AUDIT_LOGS];

export interface DashboardMetrics {
  todaySales: number;
  todaySalesDelta: number;
  todayOrdersCount: number;
  todayOrdersDelta: number;
  averageOrderValue: number;
  aovDelta: number;
  activeKitchenOrders: number;
  outstandingCreditTotal: number;
  lowStockItemsCount: number;
  salesSparkline: number[];
  hourlySalesVelocity: { hour: string; sales: number; orders: number }[];
  ordersByStatus: { status: string; count: number; color: string }[];
  ordersByFulfillment: { channel: string; count: number; percentage: number }[];
  paymentsByMethod: { method: string; amount: number; percentage: number }[];
  topSellingItems: { name: string; quantity: number; revenue: number; rating: number }[];
}

export const dashboardService = {
  // ─── Dashboard Overview ───────────────────────────────────────────
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const todayOrders = currentOrders.slice(0, 35);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.orderStatus !== "CANCELLED" ? o.total : 0), 0);
    const activeKitchen = currentOrders.filter((o) => ["CONFIRMED", "PREPARING", "READY"].includes(o.orderStatus)).length;
    const outstandingCredit = currentCustomers.reduce((sum, c) => sum + c.currentBalance, 0);
    const lowStock = currentInventory.filter((i) => i.currentStock <= i.minThreshold).length;

    return {
      todaySales: Math.round(todaySales),
      todaySalesDelta: 14.8,
      todayOrdersCount: todayOrders.length,
      todayOrdersDelta: 8.2,
      averageOrderValue: Math.round(todaySales / Math.max(1, todayOrders.length)),
      aovDelta: 4.1,
      activeKitchenOrders: activeKitchen,
      outstandingCreditTotal: Math.round(outstandingCredit),
      lowStockItemsCount: lowStock,
      salesSparkline: [12000, 14500, 13800, 16200, 15900, 18400, Math.round(todaySales)],
      hourlySalesVelocity: [
        { hour: "08:00", sales: 2400, orders: 12 },
        { hour: "10:00", sales: 4800, orders: 24 },
        { hour: "12:00", sales: 8600, orders: 38 },
        { hour: "14:00", sales: 6200, orders: 28 },
        { hour: "16:00", sales: 7400, orders: 32 },
        { hour: "18:00", sales: 9100, orders: 40 },
        { hour: "20:00", sales: 5200, orders: 22 },
      ],
      ordersByStatus: [
        { status: "Completed", count: currentOrders.filter((o) => o.orderStatus === "COMPLETED").length, color: "#48a853" },
        { status: "In Kitchen", count: activeKitchen, color: "#f59e0b" },
        { status: "Pending", count: currentOrders.filter((o) => o.orderStatus === "PENDING").length, color: "#3b82f6" },
        { status: "Cancelled", count: currentOrders.filter((o) => o.orderStatus === "CANCELLED").length, color: "#ef4444" },
      ],
      ordersByFulfillment: [
        { channel: "Dine-In", count: 124, percentage: 62 },
        { channel: "Takeaway / Pickup", count: 52, percentage: 26 },
        { channel: "Delivery", count: 24, percentage: 12 },
      ],
      paymentsByMethod: [
        { method: "Telebirr", amount: 28450, percentage: 48 },
        { method: "Cash", amount: 16200, percentage: 27 },
        { method: "CBE Birr", amount: 9800, percentage: 16 },
        { method: "Customer Credit", amount: 5400, percentage: 9 },
      ],
      topSellingItems: [
        { name: "Classic Ethiopian Macchiato", quantity: 68, revenue: 9520, rating: 4.9 },
        { name: "Yirgacheffe Pour Over", quantity: 54, revenue: 9720, rating: 4.95 },
        { name: "Chechebsa with Niter Kibbeh", quantity: 42, revenue: 10920, rating: 4.85 },
        { name: "Special Beef Tibs", quantity: 36, revenue: 17280, rating: 4.8 },
        { name: "Avocado & Mango Spris", quantity: 38, revenue: 7220, rating: 4.9 },
      ],
    };
  },

  // ─── Orders Module ────────────────────────────────────────────────
  async getOrders(): Promise<Order[]> {
    return [...currentOrders];
  },

  async getOrderById(id: string): Promise<Order | null> {
    return currentOrders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: Order["orderStatus"],
    actor = "Staff Operator"
  ): Promise<Order> {
    const idx = currentOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error("Order not found");

    const existing = currentOrders[idx];
    if (!existing) throw new Error("Order not found");

    const updated: Order = {
      ...existing,
      orderStatus: newStatus,
      timeline: [
        ...existing.timeline,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          actor,
        },
      ],
    };
    currentOrders[idx] = updated;
    return updated;
  },

  async cancelOrder(orderId: string, reason: string, actor = "Staff Operator"): Promise<Order> {
    const idx = currentOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error("Order not found");
    const existing = currentOrders[idx];
    if (!existing) throw new Error("Order not found");

    const updated: Order = {
      ...existing,
      orderStatus: "CANCELLED" as const,
      cancelReason: reason,
      timeline: [
        ...existing.timeline,
        {
          status: "CANCELLED",
          timestamp: new Date().toISOString(),
          actor,
          note: `Cancelled: ${reason}`,
        },
      ],
    };
    currentOrders[idx] = updated;
    return updated;
  },

  // ─── Inventory Module ─────────────────────────────────────────────
  async getInventory(): Promise<InventoryItem[]> {
    return [...currentInventory];
  },

  async adjustStock(
    itemId: string,
    adjustmentQuantity: number,
    reason: string,
    actor = "Inventory Manager"
  ): Promise<InventoryItem> {
    const item = currentInventory.find((i) => i.id === itemId);
    if (!item) throw new Error("Inventory item not found");

    item.currentStock = Math.max(0, Math.round((item.currentStock + adjustmentQuantity) * 100) / 100);
    item.status = item.currentStock === 0 ? "OUT" : item.currentStock <= item.minThreshold ? "LOW" : "OK";

    // Record audit
    currentAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor,
      role: "MANAGER",
      action: "INVENTORY_ADJUSTMENT",
      entityType: "InventoryItem",
      entityId: itemId,
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.floor(Math.random() * 900000)}`,
      diff: {
        before: { currentStock: item.currentStock - adjustmentQuantity },
        after: { currentStock: item.currentStock, reason },
      },
    });

    return { ...item };
  },

  // ─── Customer Credit Module ───────────────────────────────────────
  async getCustomers(): Promise<CustomerCreditAccount[]> {
    try {
      const liveAccounts = await fetchCreditAccounts();
      if (liveAccounts && liveAccounts.length > 0) {
        return liveAccounts.map((acc) => ({
          id: acc.id,
          customerId: acc.customerId,
          customerName: acc.customerName,
          phone: acc.customerPhone || "+251 91 100 0000",
          email: acc.customerEmail || "accounting@customer.et",
          creditLimit: acc.creditLimit,
          currentBalance: acc.currentBalance,
          availableCredit: acc.availableCredit,
          paymentTermsDays: 30,
          unpaidInvoicesCount: acc.currentBalance > 0 ? 1 : 0,
          status:
            acc.status === "FROZEN"
              ? "SUSPENDED"
              : acc.status === "CLOSED"
                ? "OVERDUE"
                : "ACTIVE",
          lastPaymentDate: new Date().toISOString().split("T")[0]!,
          ledger: (acc.transactions || []).map((t) => ({
            id: t.id,
            date: t.occurredAt.split("T")[0] || "",
            type: t.transactionType,
            amount: t.amount,
            balanceAfter: t.balanceAfter,
            reference: t.reference || "",
          })),
        }));
      }
    } catch {
      // In-memory fallback
    }
    return [...currentCustomers];
  },

  async recordCreditPayment(
    customerId: string,
    amount: number,
    reference: string
  ): Promise<CustomerCreditAccount> {
    try {
      await recordApiPayment(customerId, { amount, reference });
    } catch {
      // In-memory fallback
    }

    const cust = currentCustomers.find((c) => c.id === customerId);
    if (!cust) throw new Error("Customer not found");

    cust.currentBalance = Math.max(0, cust.currentBalance - amount);
    cust.availableCredit = cust.creditLimit - cust.currentBalance;
    cust.lastPaymentDate = new Date().toISOString().split("T")[0]!;
    cust.ledger.unshift({
      id: `led-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]!,
      type: "PAYMENT",
      amount,
      balanceAfter: cust.currentBalance,
      reference,
    });

    return { ...cust };
  },

  async adjustCreditBalance(
    customerId: string,
    amountDelta: number, // Positive adds debt, negative credits
    reason: string,
    actor = "Head of Finance"
  ): Promise<CustomerCreditAccount> {
    try {
      await adjustApiBalance(customerId, { amount: amountDelta, reason });
    } catch {
      // In-memory fallback
    }

    const cust = currentCustomers.find((c) => c.id === customerId);
    if (!cust) throw new Error("Customer not found");

    const prevBalance = cust.currentBalance;
    cust.currentBalance = Math.max(0, cust.currentBalance + amountDelta);
    cust.availableCredit = cust.creditLimit - cust.currentBalance;
    cust.ledger.unshift({
      id: `led-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]!,
      type: "ADJUSTMENT",
      amount: amountDelta,
      balanceAfter: cust.currentBalance,
      reference: `ADJ-${Math.floor(100 + Math.random() * 900)}`,
      reason,
    });

    currentAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor,
      role: "ADMINISTRATOR",
      action: "CREDIT_BALANCE_ADJUSTMENT",
      entityType: "CustomerCreditAccount",
      entityId: customerId,
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.floor(Math.random() * 900000)}`,
      diff: {
        before: { currentBalance: prevBalance },
        after: { currentBalance: cust.currentBalance, reason },
      },
    });

    return { ...cust };
  },

  // ─── Menu Catalog Module ──────────────────────────────────────────
  async getMenuItems(): Promise<MenuItem[]> {
    return [...currentMenuItems];
  },

  async toggleMenuItemAvailability(id: string): Promise<MenuItem> {
    const item = currentMenuItems.find((m) => m.id === id);
    if (!item) throw new Error("Menu item not found");
    item.isAvailable = !item.isAvailable;
    return { ...item };
  },

  // ─── Staff Module ─────────────────────────────────────────────────
  async getStaff(): Promise<StaffMember[]> {
    return [...currentStaff];
  },

  async toggleStaffStatus(id: string, reason: string): Promise<StaffMember> {
    const staff = currentStaff.find((s) => s.id === id);
    if (!staff) throw new Error("Staff member not found");
    staff.status = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    currentAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor: "Cherinet Admin",
      role: "ADMINISTRATOR",
      action: "STAFF_STATUS_TOGGLED",
      entityType: "StaffMember",
      entityId: id,
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.floor(Math.random() * 900000)}`,
      diff: {
        before: { status: staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
        after: { status: staff.status, reason },
      },
    });

    return { ...staff };
  },

  // ─── Complaints Module ────────────────────────────────────────────
  async getComplaints(): Promise<Complaint[]> {
    return [...currentComplaints];
  },

  async updateComplaintStatus(
    id: string,
    status: Complaint["status"],
    resolutionNotes?: string
  ): Promise<Complaint> {
    const comp = currentComplaints.find((c) => c.id === id);
    if (!comp) throw new Error("Complaint not found");
    comp.status = status;
    if (resolutionNotes) comp.resolutionNotes = resolutionNotes;
    return { ...comp };
  },

  // ─── Audit Log Module ─────────────────────────────────────────────
  async getAuditLogs(): Promise<AuditRecord[]> {
    return [...currentAuditLogs];
  },
};
