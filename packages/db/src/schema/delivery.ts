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

import { employees } from "./identity";
import { orders } from "./orders";

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),

    address: text("address").notNull(),

    deliveryFee: numeric("delivery_fee", {
      precision: 12,
      scale: 2,
    }).notNull(),

    status: varchar("status").notNull(),

    providerReference: varchar("provider_reference"),

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
    unique("deliveries_order_id_unique").on(table.orderId),

    index("deliveries_status_idx").on(table.status),

    check(
      "deliveries_delivery_fee_non_negative",
      sql`${table.deliveryFee} >= 0`,
    ),
  ],
);

export const deliveryAssignments = pgTable("delivery_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),

  deliveryId: uuid("delivery_id")
    .notNull()
    .references(() => deliveries.id),

  riderId: uuid("rider_id").references(() => employees.id),

  assignedAt: timestamp("assigned_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),

  pickedUpAt: timestamp("picked_up_at", {
    withTimezone: true,
    mode: "date",
  }),

  deliveredAt: timestamp("delivered_at", {
    withTimezone: true,
    mode: "date",
  }),

  status: varchar("status").notNull(),
});
