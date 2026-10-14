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

console.log("[SEED] Starting idempotent cafe database seeder...");
console.log(`[SEED] Target DB: ${DATABASE_URL.replace(/:[^:@]*@/, ":****@")}`);

const sqlClient = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(sqlClient, { schema });

async function seed() {
  try {
    // 1. Roles
    console.log("[SEED] Seeding default roles...");
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
    console.log("[SEED] Seeding default permissions...");
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
    console.log("[SEED] Seeding role-permission mappings...");
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
    console.log(
      "[SEED] Seeding default admin account (admin@sablecafe.com)...",
    );
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
    console.log("[SEED] Seeding departments...");
    const defaultDepartments = [
      {
        name: "Jebena & Coffee Ceremony",
        description:
          "Clay pot Jebena extraction, roasting, frankincense station",
        status: "active",
      },
      {
        name: "Traditional Kitchen",
        description: "Mitad injera baking, wot slow-cookers, and clay pots",
        status: "active",
      },
      {
        name: "Espresso & Cold Bar",
        description:
          "Modern espresso machines, iced concoctions, and specialty tea",
        status: "active",
      },
      {
        name: "Pastry & Breakfast",
        description:
          "Fresh pastry ovens, morning breakfast station, and snacks",
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
    console.log("[SEED] Seeding categories...");
    const defaultCategories = [
      {
        name: "Traditional Mains",
        description:
          "Authentic slow-simmered wots served with sourdough teff injera",
        status: "active",
      },
      {
        name: "Ethiopian Coffee Ceremony",
        description:
          "Hand-roasted Yirgacheffe & Sidama coffee brewed in traditional clay Jebena",
        status: "active",
      },
      {
        name: "Breakfast & Morning Bites",
        description:
          "Hearty traditional morning dishes: Chechebsa, Ful, and Kinche",
        status: "active",
      },
      {
        name: "Beverages & Herbal Teas",
        description:
          "Spiced Ethiopian teas, fresh juices, and signature iced drinks",
        status: "active",
      },
      {
        name: "Vegetarian & Vegan",
        description:
          "Wholesome fasting (Tsom) platters: Misir, Shiro, and Gomen",
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
    console.log("[SEED] Seeding raw ingredients...");
    const defaultIngredients = [
      {
        name: "Teff Injera",
        unitOfMeasure: "pcs",
        status: "active",
      },
      {
        name: "Yirgacheffe Coffee Beans",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Sidama Coffee Beans",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Niter Kibbeh (Spiced Butter)",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Berbere Spice Blend",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Shiro Powder (Chickpea Flour)",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Prime Beef Cuts",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Chicken Drumsticks & Thighs",
        unitOfMeasure: "pcs",
        status: "active",
      },
      {
        name: "Hard Boiled Egg",
        unitOfMeasure: "pcs",
        status: "active",
      },
      {
        name: "Split Red Lentils",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Collard Greens (Gomen)",
        unitOfMeasure: "g",
        status: "active",
      },
      {
        name: "Ethiopian Tea Spices (Cardamom, Cinnamon, Clove)",
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
        name: "Korerima (Black Cardamom)",
        unitOfMeasure: "g",
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
    console.log("[SEED] Seeding Ethiopian food and drink menu items...");
    const defaultMenuItems = [
      {
        name: "Doro Wot Deluxe",
        categoryName: "Traditional Mains",
        departmentName: "Traditional Kitchen",
        price: "16.50",
        availabilityStatus: "AVAILABLE",
        description:
          "The crown jewel of Ethiopian cuisine: slow-cooked chicken drumstick in fragrant berbere sauce, seasoned with niter kibbeh and hard-boiled farm egg. Served with fresh teff injera.",
        recipeIngredients: [
          {
            ingredientName: "Chicken Drumsticks & Thighs",
            quantity: "1.000",
            unitOfMeasure: "pcs",
          },
          {
            ingredientName: "Hard Boiled Egg",
            quantity: "1.000",
            unitOfMeasure: "pcs",
          },
          {
            ingredientName: "Berbere Spice Blend",
            quantity: "25.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Niter Kibbeh (Spiced Butter)",
            quantity: "30.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Teff Injera",
            quantity: "2.000",
            unitOfMeasure: "pcs",
          },
        ],
      },
      {
        name: "Special Sizzling Tibs",
        categoryName: "Traditional Mains",
        departmentName: "Traditional Kitchen",
        price: "14.75",
        availabilityStatus: "AVAILABLE",
        description:
          "Tender prime beef cubes pan-seared with rosemary, sweet onions, jalapeños, and fragrant garlic butter served sizzling on a clay burner with injera and awaze dip.",
        recipeIngredients: [
          {
            ingredientName: "Prime Beef Cuts",
            quantity: "220.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Niter Kibbeh (Spiced Butter)",
            quantity: "25.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Teff Injera",
            quantity: "2.000",
            unitOfMeasure: "pcs",
          },
        ],
      },
      {
        name: "Clay Pot Shiro Miteen",
        categoryName: "Vegetarian & Vegan",
        departmentName: "Traditional Kitchen",
        price: "11.50",
        availabilityStatus: "AVAILABLE",
        description:
          "Bubbling ground seasoned chickpeas simmered in garlic, ginger, and berbere served piping hot in a traditional handcrafted black clay pot with injera.",
        recipeIngredients: [
          {
            ingredientName: "Shiro Powder (Chickpea Flour)",
            quantity: "80.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Berbere Spice Blend",
            quantity: "10.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Teff Injera",
            quantity: "2.000",
            unitOfMeasure: "pcs",
          },
        ],
      },
      {
        name: "Yetsom Beyaynetu Platter",
        categoryName: "Vegetarian & Vegan",
        departmentName: "Traditional Kitchen",
        price: "13.95",
        availabilityStatus: "AVAILABLE",
        description:
          "Vibrant plant-based banquet platter: spicy red lentil wot (Misir), turmeric yellow split peas (Kik), steamed spiced collard greens (Gomen), and crisp beet salad over sourdough teff injera.",
        recipeIngredients: [
          {
            ingredientName: "Split Red Lentils",
            quantity: "70.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Collard Greens (Gomen)",
            quantity: "60.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Teff Injera",
            quantity: "2.000",
            unitOfMeasure: "pcs",
          },
        ],
      },
      {
        name: "Traditional Jebena Buna Ceremony",
        categoryName: "Ethiopian Coffee Ceremony",
        departmentName: "Jebena & Coffee Ceremony",
        price: "6.50",
        availabilityStatus: "AVAILABLE",
        description:
          "Full sensory ceremony: green beans freshly washed, pan-roasted to medium-dark, ground and slow-brewed in a charcoal-heated clay Jebena pot. Served with popcorn and frankincense aroma.",
        recipeIngredients: [
          {
            ingredientName: "Yirgacheffe Coffee Beans",
            quantity: "25.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Korerima (Black Cardamom)",
            quantity: "2.000",
            unitOfMeasure: "g",
          },
        ],
      },
      {
        name: "Yirgacheffe Pour-Over Reserve",
        categoryName: "Ethiopian Coffee Ceremony",
        departmentName: "Espresso & Cold Bar",
        price: "4.85",
        availabilityStatus: "AVAILABLE",
        description:
          "Single-origin specialty roast from high-altitude Yirgacheffe washed lots. Bright floral jasmine aromatics, citrus notes of bergamot, and a honey-smooth tea-like finish.",
        recipeIngredients: [
          {
            ingredientName: "Yirgacheffe Coffee Beans",
            quantity: "20.000",
            unitOfMeasure: "g",
          },
        ],
      },
      {
        name: "Chechebsa (Kita Firfir) Honey & Kibbeh",
        categoryName: "Breakfast & Morning Bites",
        departmentName: "Pastry & Breakfast",
        price: "8.75",
        availabilityStatus: "AVAILABLE",
        description:
          "Torn pieces of freshly baked flatbread pan-fried in warm spiced berbere niter kibbeh, finished with raw highland honey and a side of fresh yogurt.",
        recipeIngredients: [
          {
            ingredientName: "Niter Kibbeh (Spiced Butter)",
            quantity: "35.000",
            unitOfMeasure: "g",
          },
          {
            ingredientName: "Berbere Spice Blend",
            quantity: "5.000",
            unitOfMeasure: "g",
          },
        ],
      },
      {
        name: "Spiced Ethiopian Chai (Shai)",
        categoryName: "Beverages & Herbal Teas",
        departmentName: "Espresso & Cold Bar",
        price: "3.75",
        availabilityStatus: "AVAILABLE",
        description:
          "Aromatic loose black tea infused with cracked cinnamon bark, whole cloves, and crushed korerima cardamom pods. Served sweet and piping hot.",
        recipeIngredients: [
          {
            ingredientName: "Ethiopian Tea Spices (Cardamom, Cinnamon, Clove)",
            quantity: "8.000",
            unitOfMeasure: "g",
          },
        ],
      },
      {
        name: "Avocado & Mango Layered Juice (Espris)",
        categoryName: "Beverages & Herbal Teas",
        departmentName: "Espresso & Cold Bar",
        price: "5.25",
        availabilityStatus: "AVAILABLE",
        description:
          "Classic Addis Ababa cafe style: dense layers of pure crushed Hass avocado, sweet mango puree, and squeezed lime, served with a straw and spoon.",
        recipeIngredients: [],
      },
    ];

    for (const item of defaultMenuItems) {
      const categoryId = categoryMap.get(item.categoryName);
      const departmentId = departmentMap.get(item.departmentName);

      if (!categoryId || !departmentId) {
        console.warn(
          `[WARN] Skipping item ${item.name}: Category or Department not found.`,
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

    console.log("[SUCCESS] Database seeding completed successfully!");
  } catch (error) {
    console.error("[ERROR] Seeding failed with error:", error);
    throw error;
  } finally {
    await sqlClient.end();
  }
}

seed().catch(() => {
  process.exit(1);
});
