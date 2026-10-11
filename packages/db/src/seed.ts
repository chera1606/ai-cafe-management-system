import { existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import * as dotenv from "dotenv";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import {
  categories,
  departments,
  employees,
  ingredients,
  menuItems,
  permissions,
  recipeItems,
  recipes,
  rolePermissions,
  roles,
  userRoles,
  users,
} from "./schema";

// Load environment variables from standard root or local locations
const envPaths = [
  pathResolve(process.cwd(), ".env"),
  pathResolve(process.cwd(), "../../.env"),
  pathResolve(process.cwd(), "../.env"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/cafe_db";

console.log("🌱 Starting idempotent cafe database seeder...");
console.log(`📡 Target DB: ${DATABASE_URL.replace(/:[^:@]*@/, ":****@")}`);

const sqlClient = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(sqlClient, { schema });

async function seed() {
  try {
    // 1. Roles
    console.log("👥 Seeding default roles...");
    const defaultRoles = [
      {
        name: "ADMIN",
        description: "System administrator with full cafe access",
      },
      {
        name: "MANAGER",
        description:
          "Cafe operations manager with catalog and inventory oversight",
      },
      {
        name: "CASHIER",
        description: "Cashier handling POS transactions and guest orders",
      },
      {
        name: "BARISTA",
        description: "Beverage specialist preparing coffee and drink tickets",
      },
      {
        name: "KITCHEN_STAFF",
        description: "Kitchen team preparing food orders and recipes",
      },
      {
        name: "WAITER",
        description: "Floor service handling customer tables and orders",
      },
      {
        name: "CUSTOMER",
        description:
          "Registered cafe customer browsing menu and placing orders",
      },
    ];

    const roleMap = new Map<string, string>();
    for (const r of defaultRoles) {
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, r.name))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        roleMap.set(r.name, existing[0].id);
      } else {
        const [inserted] = await db
          .insert(roles)
          .values({
            name: r.name,
            description: r.description,
          })
          .returning();
        if (inserted) {
          roleMap.set(r.name, inserted.id);
        }
      }
    }

    // 2. Permissions
    console.log("🔑 Seeding default permissions...");
    const defaultPermissions = [
      {
        name: "menu:read",
        description: "View categories, items, and menu offerings",
      },
      {
        name: "menu:manage",
        description: "Create, update, and manage menu catalog and recipes",
      },
      {
        name: "inventory:read",
        description: "View ingredients and stock levels",
      },
      {
        name: "inventory:manage",
        description: "Adjust inventory stock levels and ingredient definitions",
      },
      {
        name: "orders:read",
        description: "View incoming and completed customer orders",
      },
      {
        name: "orders:manage",
        description: "Create, update, and process orders",
      },
      {
        name: "users:read",
        description: "View staff members and customer profiles",
      },
      {
        name: "users:manage",
        description: "Manage users, staff roles, and administrative settings",
      },
    ];

    const permMap = new Map<string, string>();
    for (const p of defaultPermissions) {
      const existing = await db
        .select()
        .from(permissions)
        .where(eq(permissions.name, p.name))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        permMap.set(p.name, existing[0].id);
      } else {
        const [inserted] = await db
          .insert(permissions)
          .values({
            name: p.name,
            description: p.description,
          })
          .returning();
        if (inserted) {
          permMap.set(p.name, inserted.id);
        }
      }
    }

    // 3. Role-Permission Mappings
    console.log("🔗 Seeding role-permission mappings...");
    const rolePermissionBindings: Record<string, string[]> = {
      ADMIN: [
        "menu:read",
        "menu:manage",
        "inventory:read",
        "inventory:manage",
        "orders:read",
        "orders:manage",
        "users:read",
        "users:manage",
      ],
      MANAGER: [
        "menu:read",
        "menu:manage",
        "inventory:read",
        "inventory:manage",
        "orders:read",
        "orders:manage",
        "users:read",
      ],
      CASHIER: ["menu:read", "orders:read", "orders:manage"],
      BARISTA: ["menu:read", "orders:read", "orders:manage"],
      KITCHEN_STAFF: ["menu:read", "orders:read", "orders:manage"],
      WAITER: ["menu:read", "orders:read", "orders:manage"],
      CUSTOMER: ["menu:read", "orders:read", "orders:manage"],
    };

    for (const [roleName, permNames] of Object.entries(
      rolePermissionBindings,
    )) {
      const roleId = roleMap.get(roleName);
      if (!roleId) continue;

      for (const permName of permNames) {
        const permId = permMap.get(permName);
        if (!permId) continue;

        const existingMapping = await db
          .select()
          .from(rolePermissions)
          .where(
            and(
              eq(rolePermissions.roleId, roleId),
              eq(rolePermissions.permissionId, permId),
            ),
          )
          .limit(1);

        if (existingMapping.length === 0) {
          await db.insert(rolePermissions).values({
            roleId,
            permissionId: permId,
          });
        }
      }
    }

    // 4. Default Admin Account
    console.log("👤 Seeding default admin account (admin@sablecafe.com)...");
    const adminEmail = "admin@sablecafe.com";
    // Bcrypt hash for password "Admin123!@#"
    const adminPasswordHash =
      "$2b$10$xKHZ0ubd1yKRjrrW27IKqeNiaE5lRiEieYOO.MZn2ZS4glXv097Lq";

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    let adminUserId: string;
    if (existingAdmin.length > 0 && existingAdmin[0]) {
      adminUserId = existingAdmin[0].id;
    } else {
      const [insertedAdmin] = await db
        .insert(users)
        .values({
          email: adminEmail,
          passwordHash: adminPasswordHash,
          status: "active",
          emailVerifiedAt: new Date(),
        })
        .returning();
      if (!insertedAdmin) {
        throw new Error("Failed to create default admin user");
      }
      adminUserId = insertedAdmin.id;
    }

    // Link admin user to ADMIN role
    const adminRoleId = roleMap.get("ADMIN");
    if (adminRoleId) {
      const existingUserRole = await db
        .select()
        .from(userRoles)
        .where(
          and(
            eq(userRoles.userId, adminUserId),
            eq(userRoles.roleId, adminRoleId),
          ),
        )
        .limit(1);

      if (existingUserRole.length === 0) {
        await db.insert(userRoles).values({
          userId: adminUserId,
          roleId: adminRoleId,
        });
      }
    }

    // Ensure employee record exists for admin
    const existingEmployee = await db
      .select()
      .from(employees)
      .where(eq(employees.userId, adminUserId))
      .limit(1);

    if (existingEmployee.length === 0) {
      await db.insert(employees).values({
        userId: adminUserId,
        name: "Admin User",
        employmentStatus: "active",
        startDate: new Date("2024-01-01"),
        compensationInformation: { title: "Head Administrator" },
      });
    }

    // 5. Initial Cafe Catalog: Departments
    console.log("🏢 Seeding departments...");
    const defaultDepartments = [
      {
        name: "Espresso Bar",
        description: "Hot coffee and espresso extraction bar",
        status: "active",
      },
      {
        name: "Cold Beverage Station",
        description: "Iced drinks, cold brew kegs, and blenders",
        status: "active",
      },
      {
        name: "Bakery & Kitchen",
        description: "Ovens, pastry warming, and savory food prep",
        status: "active",
      },
    ];

    const departmentMap = new Map<string, string>();
    for (const d of defaultDepartments) {
      const existing = await db
        .select()
        .from(departments)
        .where(eq(departments.name, d.name))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        departmentMap.set(d.name, existing[0].id);
      } else {
        const [inserted] = await db.insert(departments).values(d).returning();
        if (inserted) {
          departmentMap.set(d.name, inserted.id);
        }
      }
    }

    // 6. Initial Cafe Catalog: Categories
    console.log("📂 Seeding categories...");
    const defaultCategories = [
      {
        name: "Signature Espresso",
        description: "Artisan espresso handcrafted with premium beans",
        status: "active",
      },
      {
        name: "Iced & Cold Brew",
        description: "Refreshing cold brews and chilled specialty concoctions",
        status: "active",
      },
      {
        name: "Artisan Pastries",
        description: "Freshly baked daily pastries and viennoiseries",
        status: "active",
      },
      {
        name: "All-Day Breakfast",
        description: "Wholesome gourmet breakfast and brunch favorites",
        status: "active",
      },
    ];

    const categoryMap = new Map<string, string>();
    for (const c of defaultCategories) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.name, c.name))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        categoryMap.set(c.name, existing[0].id);
      } else {
        const [inserted] = await db.insert(categories).values(c).returning();
        if (inserted) {
          categoryMap.set(c.name, inserted.id);
        }
      }
    }

    // 7. Initial Cafe Catalog: Ingredients
    console.log("🧂 Seeding raw ingredients...");
    const defaultIngredients = [
      {
        name: "Arabica Beans",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Whole Milk",
        unitOfMeasure: "ml",
        status: "active",
      },
      {
        name: "Oat Milk",
        unitOfMeasure: "ml",
        status: "active",
      },
      {
        name: "Vanilla Syrup",
        unitOfMeasure: "ml",
        status: "active",
      },
      {
        name: "Butter Croissant Dough",
        unitOfMeasure: "pcs",
        status: "active",
      },
    ];

    const ingredientMap = new Map<string, string>();
    for (const ing of defaultIngredients) {
      const existing = await db
        .select()
        .from(ingredients)
        .where(eq(ingredients.name, ing.name))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        ingredientMap.set(ing.name, existing[0].id);
      } else {
        const [inserted] = await db.insert(ingredients).values(ing).returning();
        if (inserted) {
          ingredientMap.set(ing.name, inserted.id);
        }
      }
    }

    // 8. Initial Cafe Catalog: Menu Items
    console.log("☕ Seeding menu items and recipes...");
    const defaultMenuItems = [
      {
        name: "Signature Espresso",
        categoryName: "Signature Espresso",
        departmentName: "Espresso Bar",
        price: "3.50",
        availabilityStatus: "AVAILABLE",
        description:
          "Rich double shot of artisan espresso with thick hazelnut crema",
        recipeIngredients: [
          {
            ingredientName: "Arabica Beans",
            quantity: "18.000",
            unitOfMeasure: "g",
          },
        ],
      },
      {
        name: "Iced Vanilla Latte",
        categoryName: "Iced & Cold Brew",
        departmentName: "Cold Beverage Station",
        price: "5.50",
        availabilityStatus: "AVAILABLE",
        description:
          "Smooth espresso over cold milk and artisanal Madagascar vanilla syrup",
        recipeIngredients: [
          {
            ingredientName: "Arabica Beans",
            quantity: "18.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Whole Milk",
            quantity: "220.000",
            unitOfMeasure: "ml",
          },
          {
            ingredientName: "Vanilla Syrup",
            quantity: "30.000",
            unitOfMeasure: "ml",
          },
        ],
      },
      {
        name: "Cold Brew Reserve",
        categoryName: "Iced & Cold Brew",
        departmentName: "Cold Beverage Station",
        price: "4.75",
        availabilityStatus: "AVAILABLE",
        description:
          "Steeped for 18 hours for an exceptionally smooth, low-acidity profile",
        recipeIngredients: [
          {
            ingredientName: "Arabica Beans",
            quantity: "35.000",
            unitOfMeasure: "g",
          },
        ],
      },
      {
        name: "Artisan Butter Croissant",
        categoryName: "Artisan Pastries",
        departmentName: "Bakery & Kitchen",
        price: "4.25",
        availabilityStatus: "AVAILABLE",
        description:
          "Flaky, golden-brown Parisian croissant made with cultured French butter",
        recipeIngredients: [
          {
            ingredientName: "Butter Croissant Dough",
            quantity: "1.000",
            unitOfMeasure: "pcs",
          },
        ],
      },
      {
        name: "Avocado Toast Breakfast",
        categoryName: "All-Day Breakfast",
        departmentName: "Bakery & Kitchen",
        price: "8.50",
        availabilityStatus: "AVAILABLE",
        description:
          "Crushed Hass avocado on toasted sourdough with microgreens and chili flakes",
        recipeIngredients: [],
      },
    ];

    for (const item of defaultMenuItems) {
      const categoryId = categoryMap.get(item.categoryName);
      const departmentId = departmentMap.get(item.departmentName);

      if (!categoryId || !departmentId) {
        console.warn(
          `⚠️ Skipping item ${item.name}: Category or Department not found.`,
        );
        continue;
      }

      const existingItem = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.name, item.name))
        .limit(1);

      let itemId: string;
      if (existingItem.length > 0 && existingItem[0]) {
        itemId = existingItem[0].id;
      } else {
        const [insertedItem] = await db
          .insert(menuItems)
          .values({
            name: item.name,
            categoryId,
            departmentId,
            price: item.price,
            availabilityStatus: item.availabilityStatus,
            description: item.description,
          })
          .returning();

        if (!insertedItem) continue;
        itemId = insertedItem.id;
      }

      // If recipe ingredients exist, seed recipe and recipe items
      if (item.recipeIngredients.length > 0) {
        const existingRecipe = await db
          .select()
          .from(recipes)
          .where(and(eq(recipes.menuItemId, itemId), eq(recipes.version, 1)))
          .limit(1);

        let recipeId: string;
        if (existingRecipe.length > 0 && existingRecipe[0]) {
          recipeId = existingRecipe[0].id;
        } else {
          const [insertedRecipe] = await db
            .insert(recipes)
            .values({
              menuItemId: itemId,
              name: `${item.name} Standard Recipe`,
              version: 1,
              status: "active",
            })
            .returning();

          if (!insertedRecipe) continue;
          recipeId = insertedRecipe.id;
        }

        for (const ing of item.recipeIngredients) {
          const ingredientId = ingredientMap.get(ing.ingredientName);
          if (!ingredientId) continue;

          const existingRecipeItem = await db
            .select()
            .from(recipeItems)
            .where(
              and(
                eq(recipeItems.recipeId, recipeId),
                eq(recipeItems.ingredientId, ingredientId),
              ),
            )
            .limit(1);

          if (existingRecipeItem.length === 0) {
            await db.insert(recipeItems).values({
              recipeId,
              ingredientId,
              quantity: ing.quantity,
              unitOfMeasure: ing.unitOfMeasure,
            });
          }
        }
      }
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    throw error;
  } finally {
    await sqlClient.end();
  }
}

seed().catch(() => {
  process.exit(1);
});
