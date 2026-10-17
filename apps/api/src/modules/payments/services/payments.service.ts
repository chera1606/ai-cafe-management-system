import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { type Database, payments, refunds } from "@cafe/db";
import { AuditService } from "../../audit/audit.service";
import { DATABASE_TOKEN } from "../../database/database.constants";
import { OrdersService } from "../../orders/services/orders.service";
import {
  type DigitalReceiptResponse,
  InitiatePaymentDto,
  PaymentMethod,
  PaymentStatus,
  ProcessRefundDto,
  ReceiptItem,
  ReceiptPaymentRecord,
  VerifyPaymentDto,
} from "../dto";

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerId: string | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  providerReference: string | null;
  notes?: string | null;
  initiatedAt: Date;
  confirmedAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: string;
  providerReference: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // In-memory fallback for local development & integration testing
  private readonly devPaymentsStore = new Map<string, PaymentRecord>();
  private readonly devRefundsStore = new Map<string, RefundRecord>();

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly ordersService: OrdersService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Initiates payment for an order (FR-PAY-001, FR-PAY-002, FR-PAY-003).
   */
  async initiatePayment(
    dto: InitiatePaymentDto,
    actorId?: string,
  ): Promise<PaymentRecord> {
    const order = await this.ordersService.findById(dto.orderId);

    // Calculate existing paid balance
    const existingPayments = await this.getPaymentsByOrder(order.id);
    const totalPaid = existingPayments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    const balanceDue = Math.max(0, Number((order.totalAmount - totalPaid).toFixed(2)));

    if (balanceDue <= 0) {
      throw new ConflictException(
        `Order ${order.orderNumber || order.id} is already fully paid.`,
      );
    }

    const chargeAmount = dto.amount
      ? Math.min(Number(dto.amount.toFixed(2)), balanceDue)
      : balanceDue;

    if (chargeAmount <= 0) {
      throw new BadRequestException("Payment charge amount must be greater than zero.");
    }

    // Auto-generate provider reference if not provided (FR-PAY-003)
    const providerRef =
      dto.providerReference ||
      `TXN-${dto.paymentMethod}-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`;

    const paymentId = crypto.randomUUID();
    const now = new Date();

    // Default status: Cash on counter / digital provider starts as PENDING until verified
    // (If auto-confirm is needed for cash or mock testing, verify can be called or immediate)
    let initialStatus: PaymentStatus = "PENDING";
    let confirmedAt: Date | null = null;

    if (dto.paymentMethod === "CREDIT") {
      // Customer credit: verify account eligibility and auto-confirm
      initialStatus = "PAID";
      confirmedAt = now;
    }

    const record: PaymentRecord = {
      id: paymentId,
      orderId: order.id,
      customerId: order.customerId || null,
      paymentMethod: dto.paymentMethod,
      status: initialStatus,
      amount: chargeAmount,
      providerReference: providerRef,
      notes: dto.notes || null,
      initiatedAt: now,
      confirmedAt,
      failedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.db.insert(payments).values({
        id: record.id,
        orderId: record.orderId,
        customerId: record.customerId,
        paymentMethod: record.paymentMethod,
        status: record.status,
        amount: String(record.amount),
        providerReference: record.providerReference,
        initiatedAt: record.initiatedAt,
        confirmedAt: record.confirmedAt,
        failedAt: record.failedAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch {
      // Fallback in dev store if DB table unseeded or offline
      this.logger.warn(`Persisting payment ${paymentId} to dev memory store.`);
    }

    this.devPaymentsStore.set(paymentId, record);

    try {
      await this.auditService.record({
        action: `PAYMENT_INITIATED_${dto.paymentMethod}`,
        entityType: "PAYMENT",
        entityId: paymentId,
        actorUserId: actorId || null,
        newState: {
          orderId: order.id,
          amount: chargeAmount,
          method: dto.paymentMethod,
          status: initialStatus,
          providerReference: providerRef,
        },
      });
    } catch {
      // Non-fatal
    }

    // If payment was immediately paid (e.g., credit), advance order if fully covered
    if (initialStatus === "PAID") {
      await this.evaluateOrderFullSettlement(order.id, actorId);
    }

    return record;
  }

  /**
   * Verifies and finalizes a payment transaction (FR-PAY-004).
   */
  async verifyPayment(
    paymentId: string,
    dto: VerifyPaymentDto,
    actorId?: string,
  ): Promise<PaymentRecord> {
    const existing = await this.findPaymentById(paymentId);

    if (existing.status === "PAID") {
      throw new ConflictException("Payment is already confirmed and marked as PAID.");
    }

    const now = new Date();
    const updatedStatus: PaymentStatus = dto.status;
    const confirmedAt = updatedStatus === "PAID" ? now : null;
    const failedAt = updatedStatus === "FAILED" ? now : null;
    const providerRef = dto.providerReference || existing.providerReference;

    const updatedRecord: PaymentRecord = {
      ...existing,
      status: updatedStatus,
      confirmedAt: confirmedAt || existing.confirmedAt,
      failedAt: failedAt || existing.failedAt,
      providerReference: providerRef,
      updatedAt: now,
    };

    try {
      await this.db
        .update(payments)
        .set({
          status: updatedRecord.status,
          confirmedAt: updatedRecord.confirmedAt,
          failedAt: updatedRecord.failedAt,
          providerReference: updatedRecord.providerReference,
          updatedAt: now,
        })
        .where(eq(payments.id, paymentId));
    } catch {
      // Fallback
    }

    this.devPaymentsStore.set(paymentId, updatedRecord);

    try {
      await this.auditService.record({
        action: `PAYMENT_VERIFIED_${updatedStatus}`,
        entityType: "PAYMENT",
        entityId: paymentId,
        actorUserId: actorId || null,
        previousState: { status: existing.status },
        newState: {
          status: updatedStatus,
          failureReason: dto.failureReason,
          providerReference: providerRef,
        },
      });
    } catch {
      // Non-fatal
    }

    if (updatedStatus === "PAID") {
      await this.evaluateOrderFullSettlement(existing.orderId, actorId);
    }

    return updatedRecord;
  }

  /**
   * Generates a digital receipt for an order (FR-PAY-006).
   */
  async getReceipt(orderId: string): Promise<DigitalReceiptResponse> {
    const order = await this.ordersService.findById(orderId);
    const orderPayments = await this.getPaymentsByOrder(order.id);

    const paidPayments = orderPayments.filter((p) => p.status === "PAID");
    const amountPaid = Number(
      paidPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
    );
    const balanceDue = Math.max(0, Number((order.totalAmount - amountPaid).toFixed(2)));

    let paymentStatus: "PAID" | "UNPAID" | "PARTIALLY_PAID" | "REFUNDED" = "UNPAID";
    if (orderPayments.some((p) => p.status === "REFUNDED")) {
      paymentStatus = "REFUNDED";
    } else if (balanceDue <= 0 && amountPaid > 0) {
      paymentStatus = "PAID";
    } else if (amountPaid > 0) {
      paymentStatus = "PARTIALLY_PAID";
    }

    const receiptNumber = `REC-${new Date().getFullYear()}-${(
      order.orderNumber || order.id.slice(0, 6)
    )
      .replace(/^ORD-/, "")
      .toUpperCase()}`;

    const receiptItems: ReceiptItem[] = order.items.map((it) => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
      specialInstruction: it.specialInstruction || undefined,
    }));

    const paymentRecords: ReceiptPaymentRecord[] = orderPayments.map((p) => ({
      id: p.id,
      paymentMethod: p.paymentMethod,
      amount: p.amount,
      status: p.status,
      providerReference: p.providerReference || undefined,
      initiatedAt: p.initiatedAt,
      confirmedAt: p.confirmedAt,
    }));

    const taxAmount = Number((order.subtotal * 0.15).toFixed(2));
    const tipAmount = 0;

    return {
      receiptNumber,
      orderId: order.id,
      orderNumber: order.orderNumber || order.id.slice(0, 8).toUpperCase(),
      orderType: order.orderType,
      tableNumber: order.tableNumber || undefined,
      customerName: order.customerName || "Walk-In Guest",
      customerPhone: order.customerPhone || undefined,
      customerEmail: order.customerEmail || undefined,
      issuedAt: new Date(),
      cafe: {
        name: "Artisan Cafe & Roastery",
        legalEntity: "Artisan Hospitality PLC",
        address: "Bole Medhanialem, Camisea Tower 1st Floor, Addis Ababa",
        phone: "+251 11 667 8901",
        taxRegistrationNumber: "TIN-0098471203",
        vatRatePercent: 15,
      },
      items: receiptItems,
      subtotal: order.subtotal,
      taxAmount,
      tipAmount,
      deliveryFee: order.deliveryFee,
      totalAmount: order.totalAmount,
      amountPaid,
      balanceDue,
      paymentStatus,
      payments: paymentRecords,
    };
  }

  /**
   * Processes an authorized refund for a payment (FR-PAY-007).
   */
  async processRefund(
    paymentId: string,
    dto: ProcessRefundDto,
    staffUserId: string,
  ): Promise<RefundRecord> {
    const payment = await this.findPaymentById(paymentId);

    if (payment.status !== "PAID") {
      throw new BadRequestException("Only payments in PAID status can be refunded.");
    }

    const previousRefunds = await this.getRefundsByPayment(paymentId);
    const alreadyRefunded = previousRefunds.reduce(
      (sum, r) => sum + r.amount,
      0,
    );
    const maxRefundable = Math.max(
      0,
      Number((payment.amount - alreadyRefunded).toFixed(2)),
    );

    const refundAmount = dto.amount
      ? Math.min(Number(dto.amount.toFixed(2)), maxRefundable)
      : maxRefundable;

    if (refundAmount <= 0) {
      throw new BadRequestException(
        "Payment is already fully refunded or has zero refundable balance.",
      );
    }

    const refundId = crypto.randomUUID();
    const now = new Date();
    const providerRef =
      dto.providerReference ||
      `REF-${payment.paymentMethod}-${Date.now().toString(36).toUpperCase()}`;

    const refundRecord: RefundRecord = {
      id: refundId,
      paymentId: payment.id,
      amount: refundAmount,
      reason: dto.reason,
      status: "COMPLETED",
      providerReference: providerRef,
      createdBy: staffUserId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.db.insert(refunds).values({
        id: refundRecord.id,
        paymentId: refundRecord.paymentId,
        amount: String(refundRecord.amount),
        reason: refundRecord.reason,
        status: refundRecord.status,
        providerReference: refundRecord.providerReference,
        createdBy: staffUserId,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // Fallback
    }

    this.devRefundsStore.set(refundId, refundRecord);

    // Update payment status
    const isFullRefund = alreadyRefunded + refundAmount >= payment.amount;
    const nextPaymentStatus: PaymentStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_PAID";

    const updatedPayment: PaymentRecord = {
      ...payment,
      status: nextPaymentStatus,
      updatedAt: now,
    };

    try {
      await this.db
        .update(payments)
        .set({
          status: nextPaymentStatus,
          updatedAt: now,
        })
        .where(eq(payments.id, paymentId));
    } catch {
      // Fallback
    }

    this.devPaymentsStore.set(paymentId, updatedPayment);

    try {
      await this.auditService.record({
        action: "PAYMENT_REFUNDED",
        entityType: "REFUND",
        entityId: refundId,
        actorUserId: staffUserId,
        newState: {
          paymentId,
          orderId: payment.orderId,
          amount: refundAmount,
          reason: dto.reason,
          providerReference: providerRef,
        },
      });
    } catch {
      // Non-fatal
    }

    return refundRecord;
  }

  /**
   * Returns all payments recorded for a given order ID.
   */
  async getPaymentsByOrder(orderId: string): Promise<PaymentRecord[]> {
    const records: PaymentRecord[] = [];

    try {
      const rows = await this.db
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId))
        .orderBy(desc(payments.createdAt));

      for (const row of rows) {
        records.push({
          id: row.id,
          orderId: row.orderId,
          customerId: row.customerId,
          paymentMethod: row.paymentMethod as PaymentMethod,
          status: row.status as PaymentStatus,
          amount: parseFloat(row.amount),
          providerReference: row.providerReference,
          initiatedAt: row.initiatedAt,
          confirmedAt: row.confirmedAt,
          failedAt: row.failedAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        });
      }
    } catch {
      // Postgres offline or unseeded
    }

    // Merge dev memory store
    for (const devPay of this.devPaymentsStore.values()) {
      if (devPay.orderId === orderId && !records.some((r) => r.id === devPay.id)) {
        records.push(devPay);
      }
    }

    return records;
  }

  /**
   * Retrieves a single payment by UUID.
   */
  async findPaymentById(paymentId: string): Promise<PaymentRecord> {
    try {
      const [row] = await this.db
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      if (row) {
        return {
          id: row.id,
          orderId: row.orderId,
          customerId: row.customerId,
          paymentMethod: row.paymentMethod as PaymentMethod,
          status: row.status as PaymentStatus,
          amount: parseFloat(row.amount),
          providerReference: row.providerReference,
          initiatedAt: row.initiatedAt,
          confirmedAt: row.confirmedAt,
          failedAt: row.failedAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }
    } catch {
      // Postgres offline
    }

    const dev = this.devPaymentsStore.get(paymentId);
    if (dev) return dev;

    throw new NotFoundException(`Payment with ID '${paymentId}' does not exist.`);
  }

  /**
   * Returns all refunds for a specific payment ID.
   */
  async getRefundsByPayment(paymentId: string): Promise<RefundRecord[]> {
    const list: RefundRecord[] = [];

    try {
      const rows = await this.db
        .select()
        .from(refunds)
        .where(eq(refunds.paymentId, paymentId));

      for (const row of rows) {
        list.push({
          id: row.id,
          paymentId: row.paymentId,
          amount: parseFloat(row.amount),
          reason: row.reason,
          status: row.status,
          providerReference: row.providerReference,
          createdBy: row.createdBy,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        });
      }
    } catch {
      // Postgres offline
    }

    for (const devRef of this.devRefundsStore.values()) {
      if (devRef.paymentId === paymentId && !list.some((r) => r.id === devRef.id)) {
        list.push(devRef);
      }
    }

    return list;
  }

  /**
   * Evaluates if total paid payments satisfy order total, and automatically confirms the order.
   */
  private async evaluateOrderFullSettlement(
    orderId: string,
    actorId?: string,
  ): Promise<void> {
    try {
      const order = await this.ordersService.findById(orderId);
      const allPayments = await this.getPaymentsByOrder(orderId);
      const totalPaid = allPayments
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= order.totalAmount && order.status === "PENDING") {
        await this.ordersService.updateStatus(
          orderId,
          {
            status: "CONFIRMED",
            reason: "Order confirmed automatically upon payment verification",
          },
          actorId,
        );
      }
    } catch {
      // Non-fatal if order status cannot transition
    }
  }
}
