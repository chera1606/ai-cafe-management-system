import {
  check,
  date,
  index,
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./identity";
import { departments, ingredients } from "./menu";

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredients.id),

    departmentId: uuid("department_id").references(() => departments.id),

    currentQuantity: numeric("current_quantity", {
      precision: 14,
      scale: 3,
    }).notNull(),

    unitOfMeasure: varchar("unit_of_measure").notNull(),

    reorderLevel: numeric("reorder_level", {
      precision: 14,
      scale: 3,
    }).notNull(),

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
  },
  (table) => [
    unique("inventory_items_ingredient_id_unique").on(table.ingredientId),

    index("inventory_items_ingredient_id_idx").on(table.ingredientId),

    index("inventory_items_department_id_idx").on(table.departmentId),

    check(
      "inventory_items_current_quantity_non_negative",
      sql`${table.currentQuantity} >= 0`,
    ),

    check(
      "inventory_items_reorder_level_non_negative",
      sql`${table.reorderLevel} >= 0`,
    ),
  ],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id),

    movementType: varchar("movement_type").notNull(),

    quantity: numeric("quantity", {
      precision: 14,
      scale: 3,
    }).notNull(),

    unitCost: numeric("unit_cost", {
      precision: 12,
      scale: 2,
    }),

    referenceType: varchar("reference_type"),

    referenceId: uuid("reference_id"),

    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("stock_movements_inventory_item_id_idx").on(table.inventoryItemId),

    index("stock_movements_occurred_at_idx").on(table.occurredAt),

    check("stock_movements_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const inventoryBatches = pgTable(
  "inventory_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id),

    batchReference: varchar("batch_reference"),

    quantity: numeric("quantity", {
      precision: 14,
      scale: 3,
    }).notNull(),

    unitCost: numeric("unit_cost", {
      precision: 12,
      scale: 2,
    }),

    receivedAt: timestamp("received_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),

    expirationDate: date("expiration_date"),

    status: varchar("status").notNull(),
  },
  (table) => [
    index("inventory_batches_inventory_item_id_idx").on(table.inventoryItemId),

    check("inventory_batches_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const wasteRecords = pgTable(
  "waste_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    inventoryItemId: uuid("inventory_item_id")
      .notNull()
      .references(() => inventoryItems.id),

    quantity: numeric("quantity", {
      precision: 14,
      scale: 3,
    }).notNull(),

    estimatedCost: numeric("estimated_cost", {
      precision: 12,
      scale: 2,
    }),

    reason: varchar("reason").notNull(),

    departmentId: uuid("department_id").references(() => departments.id),

    recordedBy: uuid("recorded_by")
      .notNull()
      .references(() => users.id),

    recordedAt: timestamp("recorded_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("waste_records_inventory_item_id_idx").on(table.inventoryItemId),

    index("waste_records_department_id_idx").on(table.departmentId),

    index("waste_records_recorded_at_idx").on(table.recordedAt),

    check("waste_records_quantity_positive", sql`${table.quantity} > 0`),
  ],
);
