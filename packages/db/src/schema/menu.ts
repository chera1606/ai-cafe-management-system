import {
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
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

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
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

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    name: varchar("name").notNull(),
    description: text("description"),
    price: numeric("price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    availabilityStatus: varchar("availability_status").notNull(),
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
    index("menu_items_category_id_idx").on(table.categoryId),
    index("menu_items_department_id_idx").on(table.departmentId),
    index("menu_items_availability_status_idx").on(table.availabilityStatus),
  ],
);

export const ingredients = pgTable("ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  unitOfMeasure: varchar("unit_of_measure").notNull(),
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

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id),
    name: varchar("name").notNull(),
    version: integer("version").notNull(),
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
    unique("recipes_menu_item_version_unique").on(
      table.menuItemId,
      table.version,
    ),
  ],
);

export const recipeItems = pgTable(
  "recipe_items",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredients.id),
    quantity: numeric("quantity", {
      precision: 12,
      scale: 3,
    }).notNull(),
    unitOfMeasure: varchar("unit_of_measure").notNull(),
  },
  (table) => [
    primaryKey({
      name: "recipe_items_pk",
      columns: [table.recipeId, table.ingredientId],
    }),
    index("recipe_items_ingredient_id_idx").on(table.ingredientId),
  ],
);
