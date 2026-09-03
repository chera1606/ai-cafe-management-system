import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { customers, users } from "./identity";
import { orders } from "./orders";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),

    customerId: uuid("customer_id").references(() => customers.id),

    paymentMethod: varchar("payment_method").notNull(),

    status: varchar("status").notNull(),

    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    providerReference: varchar("provider_reference"),

    initiatedAt: timestamp("initiated_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),

    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "date",
    }),

    failedAt: timestamp("failed_at", {
      withTimezone: true,
      mode: "date",
    }),

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
    index("payments_order_id_idx").on(table.orderId),
    index("payments_status_idx").on(table.status),

    unique("payments_provider_reference_unique").on(table.providerReference),

    check("payments_amount_positive", sql`${table.amount} > 0`),
  ],
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id),

    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    reason: text("reason").notNull(),

    status: varchar("status").notNull(),

    providerReference: varchar("provider_reference"),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),

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
  (table) => [check("refunds_amount_positive", sql`${table.amount} > 0`)],
);
