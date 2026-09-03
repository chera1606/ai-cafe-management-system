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
import { payments } from "./payments";

export const creditAccounts = pgTable(
  "credit_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),

    creditLimit: numeric("credit_limit", {
      precision: 12,
      scale: 2,
    }).notNull(),

    currentBalance: numeric("current_balance", {
      precision: 12,
      scale: 2,
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
    unique("credit_accounts_customer_id_unique").on(table.customerId),

    check(
      "credit_accounts_credit_limit_non_negative",
      sql`${table.creditLimit} >= 0`,
    ),

    check(
      "credit_accounts_current_balance_non_negative",
      sql`${table.currentBalance} >= 0`,
    ),
  ],
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    creditAccountId: uuid("credit_account_id")
      .notNull()
      .references(() => creditAccounts.id),

    orderId: uuid("order_id").references(() => orders.id),

    paymentId: uuid("payment_id").references(() => payments.id),

    transactionType: varchar("transaction_type").notNull(),

    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    reference: text("reference"),

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
    index("credit_transactions_credit_account_id_idx").on(
      table.creditAccountId,
    ),

    index("credit_transactions_occurred_at_idx").on(table.occurredAt),

    check("credit_transactions_amount_positive", sql`${table.amount} > 0`),
  ],
);
