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
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { inventoryItems } from "./inventory";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name").notNull(),

  phone: varchar("phone"),

  email: varchar("email"),

  address: text("address"),

  status: varchar("status").notNull(),

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
});

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),

    purchaseReference: varchar("purchase_reference").notNull(),

    purchaseDate: date("purchase_date").notNull(),

    receivedDate: date("received_date"),

    status: varchar("status").notNull(),

    totalCost: numeric("total_cost", {
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
  },
  (table) => [
    unique("purchases_purchase_reference_unique").on(table.purchaseReference),

    index("purchases_supplier_id_idx").on(table.supplierId),

    index("purchases_purchase_date_idx").on(table.purchaseDate),

    check("purchases_total_cost_non_negative", sql`${table.totalCost} >= 0`),
  ],
);

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    purchaseId: uuid("purchase_id")
      .notNull()
      .references(() => purchases.id),

    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id),

    quantity: numeric("quantity", {
      precision: 14,
      scale: 3,
    }).notNull(),

    unitCost: numeric("unit_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),

    totalCost: numeric("total_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    index("purchase_items_purchase_id_idx").on(table.purchaseId),

    index("purchase_items_inventory_item_id_idx").on(table.inventoryItemId),

    check("purchase_items_quantity_positive", sql`${table.quantity} > 0`),

    check("purchase_items_unit_cost_non_negative", sql`${table.unitCost} >= 0`),

    check(
      "purchase_items_total_cost_non_negative",
      sql`${table.totalCost} >= 0`,
    ),
  ],
);
