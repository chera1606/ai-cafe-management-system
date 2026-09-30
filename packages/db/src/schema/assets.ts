import { sql } from "drizzle-orm";
import {
  check,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name").notNull(),

    category: varchar("category").notNull(),

    quantity: integer("quantity").notNull(),

    purchaseDate: date("purchase_date"),

    purchaseCost: numeric("purchase_cost", {
      precision: 12,
      scale: 2,
    }),

    location: varchar("location"),

    condition: varchar("condition"),

    serialNumber: varchar("serial_number"),

    warrantyInformation: jsonb("warranty_information"),

    maintenanceInformation: jsonb("maintenance_information"),

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
  (table) => [check("assets_quantity_positive", sql`${table.quantity} > 0`)],
);
