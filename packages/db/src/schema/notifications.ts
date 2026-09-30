import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./identity";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    recipientUserId: uuid("recipient_user_id")
      .notNull()
      .references(() => users.id),

    type: varchar("type").notNull(),

    channel: varchar("channel").notNull(),

    title: varchar("title").notNull(),

    content: text("content").notNull(),

    status: varchar("status").notNull(),

    sentAt: timestamp("sent_at", {
      withTimezone: true,
      mode: "date",
    }),

    readAt: timestamp("read_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_recipient_user_id_idx").on(table.recipientUserId),

    index("notifications_status_idx").on(table.status),

    index("notifications_created_at_idx").on(table.createdAt),
  ],
);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    channel: varchar("channel").notNull(),

    notificationType: varchar("notification_type").notNull(),

    enabled: boolean("enabled").notNull(),

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
    unique("notification_preferences_user_channel_type_unique").on(
      table.userId,
      table.channel,
      table.notificationType,
    ),
  ],
);
