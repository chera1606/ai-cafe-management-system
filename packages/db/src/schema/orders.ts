import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { customers } from "./identity";
import { menuItems } from "./menu";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    customerId: uuid("customer_id").references(() => customers.id),

    orderType: varchar("order_type").notNull(),

    status: varchar("status").notNull(),

    subtotal: numeric("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),

    deliveryFee: numeric("delivery_fee", {
      precision: 12,
      scale: 2,
    }).notNull(),

    discountAmount: numeric("discount_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    totalAmount: numeric("total_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "date",
    }),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),

    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    index("orders_customer_id_idx").on(table.customerId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),

    // Financial values cannot be negative.
    // The total calculation itself remains an application/domain invariant.
    sql`check (${table.subtotal} >= 0)`,
    sql`check (${table.deliveryFee} >= 0)`,
    sql`check (${table.discountAmount} >= 0)`,
    sql`check (${table.totalAmount} >= 0)`,
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),

    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id),

    quantity: numeric("quantity", {
      precision: 10,
      scale: 3,
    }).notNull(),

    // Historical price at the time the order was created.
    unitPrice: numeric("unit_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    subtotal: numeric("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),

    specialInstruction: text("special_instruction"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_menu_item_id_idx").on(table.menuItemId),

    sql`check (${table.quantity} > 0)`,
    sql`check (${table.unitPrice} >= 0)`,
    sql`check (${table.subtotal} >= 0)`,
  ],
);
