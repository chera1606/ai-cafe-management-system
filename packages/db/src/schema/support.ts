import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { customers, employees } from "./identity";
import { orders } from "./orders";

export const supportCases = pgTable(
  "support_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),

    orderId: uuid("order_id").references(() => orders.id),

    assignedTo: uuid("assigned_to").references(() => employees.id),

    category: varchar("category").notNull(),

    status: varchar("status").notNull(),

    subject: varchar("subject").notNull(),

    description: text("description").notNull(),

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

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    index("support_cases_customer_id_idx").on(table.customerId),
    index("support_cases_status_idx").on(table.status),
  ],
);
