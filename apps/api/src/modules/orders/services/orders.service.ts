import {
  customers,
  type Database,
  deliveries,
  menuItems,
  orderItems,
  orders,
} from "@cafe/db";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { AuditService } from "../../audit/audit.service";
import { DATABASE_TOKEN } from "../../database/database.constants";
import type {
  CreateOrderDto,
  OrderQueryDto,
  OrderStatus,
  OrderType,
  UpdateOrderStatusDto,
} from "../dto";

export interface OrderItemDetail {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstruction: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  specialInstruction?: string | null;
  tableNumber?: string | null;
  delivery?: {
    id: string;
    address: string;
    status: string;
    deliveryFee: number;
  } | null;
  items: OrderItemDetail[];
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
}

@Injectable()
export class OrdersService {
  // In-memory idempotency cache for duplicate request protection (FR-ORD-009)
  // Maps idempotencyKey -> { orderId: string, timestamp: number }
  private readonly idempotencyCache = new Map<
    string,
    { orderId: string; timestamp: number }
  >();

  // TTL: 10 minutes
  private readonly IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Generates a concise human-readable order code, e.g. "ORD-4821"
   */
  private generateOrderNumber(orderId: string): string {
    const compact = orderId.replace(/-/g, "").slice(0, 4).toUpperCase();
    return `ORD-${compact}`;
  }

  /**
   * Cleans expired idempotency cache entries
   */
  private cleanIdempotencyCache() {
    const now = Date.now();
    for (const [key, val] of this.idempotencyCache.entries()) {
      if (now - val.timestamp > this.IDEMPOTENCY_TTL_MS) {
        this.idempotencyCache.delete(key);
      }
    }
  }

  /**
   * Creates a new customer or staff order with server-calculated authoritative totals.
   */
  async create(
    dto: CreateOrderDto,
    authUserId?: string,
    _userRoles: string[] = [],
  ): Promise<OrderDetail> {
    // 1. Duplicate Request Protection (FR-ORD-009)
    if (dto.idempotencyKey) {
      this.cleanIdempotencyCache();
      const existing = this.idempotencyCache.get(dto.idempotencyKey);
      if (existing) {
        const cachedOrder = await this.findById(existing.orderId);
        if (cachedOrder) return cachedOrder;
      }
    }

    // 2. Validate Fulfilment specifics (FR-ORD-002, FR-ORD-007)
    if (dto.orderType === "DELIVERY" && !dto.deliveryInfo?.address?.trim()) {
      throw new BadRequestException(
        "A valid delivery address is required for delivery orders.",
      );
    }

    // 3. Resolve Customer (FR-ORD-001)
    let customerId: string | null = null;

    if (authUserId) {
      const [existingCustomer] = await this.db
        .select()
        .from(customers)
        .where(eq(customers.userId, authUserId))
        .limit(1);

      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    } else if (dto.guestCustomer) {
      // Create guest customer profile record if guest information provided
      const [newGuest] = await this.db
        .insert(customers)
        .values({
          name: dto.guestCustomer.name.trim(),
          email: dto.guestCustomer.email?.trim() || null,
          phone: dto.guestCustomer.phone?.trim() || null,
          status: "ACTIVE",
        })
        .returning();

      if (newGuest) {
        customerId = newGuest.id;
      }
    }

    // 4. Validate Menu Items & Calculate Authoritative Totals (FR-ORD-002, FR-ORD-003)
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const dbMenuItems = await this.db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    const itemMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    // Check all requested items exist and are available
    for (const itemDto of dto.items) {
      const item = itemMap.get(itemDto.menuItemId);
      if (!item) {
        throw new NotFoundException(
          `Menu item with ID '${itemDto.menuItemId}' does not exist.`,
        );
      }
      if (item.availabilityStatus.toUpperCase() !== "AVAILABLE") {
        throw new BadRequestException(
          `Menu item '${item.name}' is currently unavailable.`,
        );
      }
    }

    // Calculate item subtotals and order subtotal
    let orderSubtotal = 0;
    const computedItems = dto.items.map((itemDto) => {
      const dbItem = itemMap.get(itemDto.menuItemId);
      if (!dbItem) {
        throw new NotFoundException(
          `Menu item with ID '${itemDto.menuItemId}' does not exist.`,
        );
      }
      const unitPrice = Number(dbItem.price);
      const subtotal = Math.round(unitPrice * itemDto.quantity * 100) / 100;
      orderSubtotal += subtotal;

      return {
        menuItemId: dbItem.id,
        name: dbItem.name,
        quantity: itemDto.quantity,
        unitPrice,
        subtotal,
        specialInstruction: itemDto.specialInstruction?.trim() || null,
      };
    });

    orderSubtotal = Math.round(orderSubtotal * 100) / 100;
    const deliveryFee = dto.orderType === "DELIVERY" ? 2.5 : 0;
    const discountAmount = 0;
    const totalAmount =
      Math.round((orderSubtotal + deliveryFee - discountAmount) * 100) / 100;

    // 5. Transactional Order Insertion
    const result = await this.db.transaction(async (tx) => {
      // Insert Order Record
      const [orderRecord] = await tx
        .insert(orders)
        .values({
          customerId,
          orderType: dto.orderType,
          status: "PENDING",
          subtotal: orderSubtotal.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
        })
        .returning();

      if (!orderRecord) {
        throw new InternalServerErrorException(
          "Failed to persist order record",
        );
      }

      // Insert Order Items
      const insertedItems = await Promise.all(
        computedItems.map((item) =>
          tx
            .insert(orderItems)
            .values({
              orderId: orderRecord.id,
              menuItemId: item.menuItemId,
              quantity: item.quantity.toString(),
              unitPrice: item.unitPrice.toFixed(2),
              subtotal: item.subtotal.toFixed(2),
              specialInstruction:
                item.specialInstruction ||
                (dto.tableNumber ? `Table: ${dto.tableNumber}` : null),
            })
            .returning(),
        ),
      );

      // Insert Delivery Record if applicable
      let deliveryRecord = null;
      if (dto.orderType === "DELIVERY" && dto.deliveryInfo) {
        const [del] = await tx
          .insert(deliveries)
          .values({
            orderId: orderRecord.id,
            address: dto.deliveryInfo.address.trim(),
            deliveryFee: deliveryFee.toFixed(2),
            status: "PENDING",
            providerReference: dto.deliveryInfo.dropoffNotes?.trim() || null,
          })
          .returning();
        deliveryRecord = del;
      }

      return { orderRecord, insertedItems, deliveryRecord };
    });

    // 6. Record Audit Log
    try {
      await this.auditService.record({
        action: "ORDER_CREATED",
        entityType: "ORDER",
        entityId: result.orderRecord.id,
        actorUserId: authUserId || null,
        newState: {
          orderType: dto.orderType,
          totalAmount,
          itemCount: dto.items.length,
          tableNumber: dto.tableNumber,
        },
      });
    } catch {
      // Non-fatal if audit log recording encounters an issue
    }

    // 7. Store in Idempotency Cache if key provided
    if (dto.idempotencyKey) {
      this.idempotencyCache.set(dto.idempotencyKey, {
        orderId: result.orderRecord.id,
        timestamp: Date.now(),
      });
    }

    return this.findById(result.orderRecord.id);
  }

  /**
   * Retrieves an order by its UUID, including joined items, menu item names, and delivery info.
   */
  async findById(orderId: string): Promise<OrderDetail> {
    const [order] = await this.db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        orderType: orders.orderType,
        status: orders.status,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        discountAmount: orders.discountAmount,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        confirmedAt: orders.confirmedAt,
        completedAt: orders.completedAt,
        cancelledAt: orders.cancelledAt,
        customerName: customers.name,
        customerPhone: customers.phone,
        customerEmail: customers.email,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found.`);
    }

    // Fetch items with menu item names
    const items = await this.db
      .select({
        id: orderItems.id,
        menuItemId: orderItems.menuItemId,
        name: menuItems.name,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        subtotal: orderItems.subtotal,
        specialInstruction: orderItems.specialInstruction,
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId));

    // Fetch delivery if applicable
    const [del] = await this.db
      .select()
      .from(deliveries)
      .where(eq(deliveries.orderId, orderId))
      .limit(1);

    return {
      id: order.id,
      orderNumber: this.generateOrderNumber(order.id),
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      orderType: order.orderType as OrderType,
      status: order.status as OrderStatus,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      delivery: del
        ? {
            id: del.id,
            address: del.address,
            status: del.status,
            deliveryFee: Number(del.deliveryFee),
          }
        : null,
      items: items.map((i) => ({
        id: i.id,
        menuItemId: i.menuItemId,
        name: i.name || "Menu Item",
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
        specialInstruction: i.specialInstruction,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
    };
  }

  /**
   * Retrieves orders matching query filters (admin, cashier, or KDS queue).
   */
  async findAll(
    query?: OrderQueryDto,
  ): Promise<{ data: OrderDetail[]; total: number }> {
    const conditions = [];

    if (query?.status) {
      conditions.push(eq(orders.status, query.status));
    }

    if (query?.orderType) {
      conditions.push(eq(orders.orderType, query.orderType));
    }

    if (query?.customerId) {
      conditions.push(eq(orders.customerId, query.customerId));
    }

    if (query?.startDate) {
      conditions.push(gte(orders.createdAt, new Date(query.startDate)));
    }

    if (query?.endDate) {
      conditions.push(lte(orders.createdAt, new Date(query.endDate)));
    }

    const limit = query?.limit ?? 20;
    const page = query?.page ?? 1;
    const offset = (page - 1) * limit;

    const matchedOrders = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const data = await Promise.all(
      matchedOrders.map((o) => this.findById(o.id)),
    );

    return {
      data,
      total: data.length,
    };
  }

  /**
   * Retrieves order history for an authenticated customer (FR-ORD-008).
   */
  async findByUserId(
    userId: string,
    query?: OrderQueryDto,
  ): Promise<OrderDetail[]> {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .limit(1);

    if (!customer) {
      return [];
    }

    const result = await this.findAll({
      ...query,
      customerId: customer.id,
    });

    return result.data;
  }

  /**
   * Updates an order's lifecycle status with transition validation (FR-ORD-004, FR-KDS-003).
   */
  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    actorId?: string,
  ): Promise<OrderDetail> {
    const existing = await this.findById(orderId);

    // Terminal state check
    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      throw new BadRequestException(
        `Order is already in terminal state '${existing.status}' and cannot be modified.`,
      );
    }

    const updateFields: {
      status: string;
      confirmedAt?: Date;
      completedAt?: Date;
      cancelledAt?: Date;
      updatedAt: Date;
    } = {
      status: dto.status,
      updatedAt: new Date(),
    };

    if (dto.status === "CONFIRMED" && !existing.confirmedAt) {
      updateFields.confirmedAt = new Date();
    } else if (dto.status === "COMPLETED") {
      updateFields.completedAt = new Date();
    } else if (dto.status === "CANCELLED") {
      updateFields.cancelledAt = new Date();
    }

    await this.db
      .update(orders)
      .set(updateFields)
      .where(eq(orders.id, orderId));

    try {
      await this.auditService.record({
        action: `ORDER_STATUS_${dto.status}`,
        entityType: "ORDER",
        entityId: orderId,
        actorUserId: actorId || null,
        previousState: { status: existing.status },
        newState: {
          status: dto.status,
          reason: dto.reason,
        },
      });
    } catch {
      // Non-fatal
    }

    return this.findById(orderId);
  }

  /**
   * Controlled order cancellation (FR-ORD-005).
   * Customers can cancel while PENDING or CONFIRMED; staff can cancel while not COMPLETED.
   */
  async cancel(
    orderId: string,
    reason?: string,
    actorId?: string,
    isStaff = false,
  ): Promise<OrderDetail> {
    const existing = await this.findById(orderId);

    if (existing.status === "CANCELLED") {
      throw new ConflictException("Order is already cancelled.");
    }

    if (existing.status === "COMPLETED") {
      throw new BadRequestException("Completed orders cannot be cancelled.");
    }

    // Customer cancellation constraint: only before preparation starts
    if (
      !isStaff &&
      existing.status !== "PENDING" &&
      existing.status !== "CONFIRMED"
    ) {
      throw new BadRequestException(
        `Order is currently '${existing.status}' and cannot be cancelled by the customer. Please contact staff directly.`,
      );
    }

    return this.updateStatus(
      orderId,
      {
        status: "CANCELLED",
        reason: reason || "Customer requested cancellation",
      },
      actorId,
    );
  }
}
