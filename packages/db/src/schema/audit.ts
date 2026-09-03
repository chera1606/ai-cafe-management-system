import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./identity";

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    actorUserId: uuid("actor_user_id").references(() => users.id),

    action: varchar("action").notNull(),

    entityType: varchar("entity_type").notNull(),

    entityId: uuid("entity_id"),

    previousState: jsonb("previous_state"),

    newState: jsonb("new_state"),

    requestId: varchar("request_id"),

    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [
    index("audit_events_actor_user_id_idx").on(table.actorUserId),

    index("audit_events_entity_type_idx").on(table.entityType),

    index("audit_events_entity_id_idx").on(table.entityId),

    index("audit_events_occurred_at_idx").on(table.occurredAt),
  ],
);
