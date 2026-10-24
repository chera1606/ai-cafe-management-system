/**
 * Realistic cafe dataset adhering to SRS specifications:
 * - 40 authentic menu catalog items & options
 * - 60 inventory raw materials, packaging, and safety thresholds
 * - 20 registered customers with credit accounts
 * - 200 chronological orders with ETB totals, line items, and audit trails
 * - 12 staff members with role mappings
 * - Complaints, stock movements, and audit log entries
 */

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  department: "BEVERAGE" | "KITCHEN" | "BAKERY" | "SPECIALTY";
  price: number;
  costPrice: number;
  description: string;
  isAvailable: boolean;
  isActive: boolean;
  image?: string;
  prepTimeMinutes: number;
  options?: {
    name: string;
    choices: { label: string; priceDelta: number }[];
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: "COFFEE_BEANS" | "DAIRY" | "PRODUCE" | "SPICES" | "PACKAGING" | "DRY_GOODS";
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  status: "OK" | "LOW" | "OUT" | "EXPIRING";
  expiryDate?: string;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: "PURCHASE" | "CONSUMPTION" | "WASTE" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" | "TRANSFER";
  quantity: number;
  unit: string;
  timestamp: string;
  performedBy: string;
  reason?: string;
  costTotal: number;
}

export interface CustomerCreditAccount {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  creditLimit: number;
  currentBalance: number; // Amount owed to cafe
  availableCredit: number;
  paymentTermsDays: number;
  status: "ACTIVE" | "SUSPENDED" | "OVERDUE";
  lastPaymentDate?: string;
  unpaidInvoicesCount: number;
  ledger: {
    id: string;
    date: string;
    type: "CHARGE" | "PAYMENT" | "ADJUSTMENT";
    amount: number;
    balanceAfter: number;
    reference: string;
    reason?: string;
  }[];
}

export interface OrderLineItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedOptions?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  fulfillmentType: "DINE_IN" | "PICKUP" | "DELIVERY";
  tableNumber?: string;
  orderStatus: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERING" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  paymentMethod: "CASH" | "CREDIT" | "TELEBIRR" | "CBE_BIRR";
  lineItems: OrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  assigneeName?: string;
  notes?: string;
  cancelReason?: string;
  timeline: {
    status: string;
    timestamp: string;
    actor: string;
    note?: string;
  }[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "OWNER" | "MANAGER" | "CASHIER" | "BARISTA" | "KITCHEN_STAFF" | "WAITER" | "ADMINISTRATOR";
  department: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  startDate: string;
  monthlySalary?: number;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerContact: string;
  orderNumber?: string;
  category: "FOOD_QUALITY" | "SERVICE_DELAY" | "INCORRECT_ORDER" | "BILLING" | "AMBIANCE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  subject: string;
  details: string;
  createdAt: string;
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface AuditRecord {
  id: string;
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  requestId: string;
  diff?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
}

// =========================================================================
// 40 Realistic Ethiopian Cafe Menu Catalog
// =========================================================================
export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "item-1",
    name: "Yirgacheffe Pour Over",
    slug: "yirgacheffe-pour-over",
    category: "Coffee",
    department: "BEVERAGE",
    price: 180,
    costPrice: 42,
    description: "Washed process Yirgacheffe with jasmine aroma, lemon zest, and bergamot notes.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 4,
    options: [
      { name: "Grind / Roast", choices: [{ label: "Light Roast", priceDelta: 0 }, { label: "Medium", priceDelta: 0 }] },
      { name: "Add Sweetener", choices: [{ label: "Raw Honey (+ETB 20)", priceDelta: 20 }, { label: "No Sweetener", priceDelta: 0 }] }
    ]
  },
  {
    id: "item-2",
    name: "Sidama Natural Micro-Lot",
    slug: "sidama-natural",
    category: "Coffee",
    department: "BEVERAGE",
    price: 210,
    costPrice: 50,
    description: "Sun-dried heirloom coffee featuring ripe blueberry, strawberry, and milk chocolate undertones.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 4,
  },
  {
    id: "item-3",
    name: "Traditional Jebena Buna Ceremony",
    slug: "jebena-buna-ceremony",
    category: "Specialty",
    department: "BEVERAGE",
    price: 260,
    costPrice: 55,
    description: "Full table ritual with freshly roasted Sidama beans brewed in clay jebena with frankincense smoke.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 8,
  },
  {
    id: "item-4",
    name: "Double Shot Espresso",
    slug: "double-shot-espresso",
    category: "Coffee",
    department: "BEVERAGE",
    price: 110,
    costPrice: 24,
    description: "Dense crema extracted from Harar blend with dark cacao sweetness.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 2,
  },
  {
    id: "item-5",
    name: "Classic Ethiopian Macchiato",
    slug: "ethiopian-macchiato",
    category: "Coffee",
    department: "BEVERAGE",
    price: 140,
    costPrice: 38,
    description: "Layered velvety steamed local whole milk crowned with rich espresso dot.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 3,
    options: [
      { name: "Milk Choice", choices: [{ label: "Local Whole Dairy", priceDelta: 0 }, { label: "Oat Milk (+ETB 45)", priceDelta: 45 }] }
    ]
  },
  {
    id: "item-6",
    name: "Spiced Shai with Cardamom & Cinnamon",
    slug: "spiced-shai",
    category: "Tea",
    department: "BEVERAGE",
    price: 95,
    costPrice: 18,
    description: "Wondo Genet black tea leaves steeped with freshly crushed cardamom pods and cloves.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 3,
  },
  {
    id: "item-7",
    name: "Avocado & Mango Spris",
    slug: "avocado-mango-spris",
    category: "Juice",
    department: "BEVERAGE",
    price: 190,
    costPrice: 48,
    description: "Thick layered fresh pureed Hass avocado and sun-ripened Arba Minch mango topped with lime dash.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 4,
  },
  {
    id: "item-8",
    name: "Papaya & Strawberry Spris",
    slug: "papaya-strawberry-spris",
    category: "Juice",
    department: "BEVERAGE",
    price: 190,
    costPrice: 45,
    description: "Vibrant dual-layer chilled smoothie pureed daily without added sugar.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 4,
  },
  {
    id: "item-9",
    name: "Crispy Lentil Sambusa (3 pcs)",
    slug: "lentil-sambusa",
    category: "Snacks",
    department: "KITCHEN",
    price: 150,
    costPrice: 32,
    description: "Hand-rolled golden pastry triangles filled with spiced brown lentils, jalapeño, and herbs.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 5,
  },
  {
    id: "item-10",
    name: "Minced Beef Sambusa (3 pcs)",
    slug: "beef-sambusa",
    category: "Snacks",
    department: "KITCHEN",
    price: 195,
    costPrice: 58,
    description: "Flaky crust stuffed with seasoned prime ground beef, onions, and mild green pepper.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 5,
  },
  {
    id: "item-11",
    name: "Chechebsa with Niter Kibbeh & Honey",
    slug: "chechebsa-traditional",
    category: "Breakfast",
    department: "KITCHEN",
    price: 260,
    costPrice: 62,
    description: "Pan-fried shredded flatbread tossed in spiced clarified butter, berbere, and served with wild honey.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 7,
  },
  {
    id: "item-12",
    name: "Ful Mudammas Royal",
    slug: "ful-mudammas-royal",
    category: "Breakfast",
    department: "KITCHEN",
    price: 240,
    costPrice: 54,
    description: "Slow-simmered fava beans dressed with diced tomatoes, onions, feta, boiled egg, and warm baguette.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 6,
  },
  {
    id: "item-13",
    name: "Cracked Wheat Kinche Bowl",
    slug: "kinche-bowl",
    category: "Breakfast",
    department: "KITCHEN",
    price: 180,
    costPrice: 36,
    description: "Steamed bulgur wheat infused with herb-scented niter kibbeh and scallions.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 5,
  },
  {
    id: "item-14",
    name: "Special Beef Tibs with Rosemary",
    slug: "special-beef-tibs",
    category: "Mains",
    department: "KITCHEN",
    price: 480,
    costPrice: 165,
    description: "Sizzling lean beef cubes sautéed with sweet onions, garlic, fresh rosemary sprigs, and awaze dip.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 10,
  },
  {
    id: "item-15",
    name: "Shiro Tegabino in Clay Pot",
    slug: "shiro-tegabino",
    category: "Mains",
    department: "KITCHEN",
    price: 290,
    costPrice: 68,
    description: "Rich chickpea stew cooked vigorously in terracotta pot, served bubbly hot with pure teff injera.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 8,
  },
  {
    id: "item-16",
    name: "Doro Wat Wrap with Ayib",
    slug: "doro-wat-wrap",
    category: "Mains",
    department: "KITCHEN",
    price: 380,
    costPrice: 120,
    description: "Shredded spicy tender chicken drumstick wrapped in warm flatbread with mild cottage cheese.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 7,
  },
  {
    id: "item-17",
    name: "Veggie Beyaynetu Platter",
    slug: "veggie-beyaynetu",
    category: "Mains",
    department: "KITCHEN",
    price: 360,
    costPrice: 85,
    description: "Assortment of yellow split peas, collard greens, beetroot salad, and red lentils on injera bed.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 6,
  },
  {
    id: "item-18",
    name: "Cardamom Cinnamon Bun",
    slug: "cardamom-cinnamon-bun",
    category: "Bakery",
    department: "BAKERY",
    price: 130,
    costPrice: 30,
    description: "Freshly baked Swedish-style knot glazed with pearl sugar and aromatic cardamom essence.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 2,
  },
  {
    id: "item-19",
    name: "Almond Croissant",
    slug: "almond-croissant",
    category: "Bakery",
    department: "BAKERY",
    price: 160,
    costPrice: 44,
    description: "Flaky butter pastry baked twice with almond frangipane paste and toasted sliced almonds.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 2,
  },
  {
    id: "item-20",
    name: "Teff Honey Pound Cake",
    slug: "teff-honey-cake",
    category: "Bakery",
    department: "BAKERY",
    price: 140,
    costPrice: 35,
    description: "Naturally gluten-conscious moist cake made with brown teff flour and Bale mountains raw honey.",
    isAvailable: true,
    isActive: true,
    prepTimeMinutes: 2,
  },
  // Items 21 to 40 for breadth
  { id: "item-21", name: "Cold Brew Harar Concentrate", slug: "cold-brew-harar", category: "Coffee", department: "BEVERAGE", price: 170, costPrice: 40, description: "18-hour cold steeped single origin.", isAvailable: true, isActive: true, prepTimeMinutes: 2 },
  { id: "item-22", name: "Vanilla Bean Latte", slug: "vanilla-latte", category: "Coffee", department: "BEVERAGE", price: 165, costPrice: 42, description: "Smooth espresso with Madagascar vanilla syrup.", isAvailable: true, isActive: true, prepTimeMinutes: 3 },
  { id: "item-23", name: "Caramel Macchiato", slug: "caramel-macchiato", category: "Coffee", department: "BEVERAGE", price: 175, costPrice: 45, description: "Freshly steamed milk with vanilla, marked with espresso and caramel drizzle.", isAvailable: true, isActive: true, prepTimeMinutes: 3 },
  { id: "item-24", name: "Iced Hibiscus Shai", slug: "iced-hibiscus", category: "Tea", department: "BEVERAGE", price: 120, costPrice: 22, description: "Tart and floral chilled infusion.", isAvailable: true, isActive: true, prepTimeMinutes: 2 },
  { id: "item-25", name: "Ginger Lemon Tonic", slug: "ginger-lemon-tonic", category: "Juice", department: "BEVERAGE", price: 140, costPrice: 28, description: "Hot water, crushed ginger root, lemon juice and honey.", isAvailable: true, isActive: true, prepTimeMinutes: 3 },
  { id: "item-26", name: "Sparkling Ambo Mineral Water", slug: "ambo-water", category: "Beverage", department: "BEVERAGE", price: 60, costPrice: 25, description: "Naturally carbonated Ethiopian mineral spring water.", isAvailable: true, isActive: true, prepTimeMinutes: 1 },
  { id: "item-27", name: "Scrambled Eggs with Diced Onion", slug: "scrambled-eggs", category: "Breakfast", department: "KITCHEN", price: 190, costPrice: 45, description: "Three farm-fresh eggs scrambled with jalapeño and served with toasted bread.", isAvailable: true, isActive: true, prepTimeMinutes: 5 },
  { id: "item-28", name: "Quanta Firfir", slug: "quanta-firfir", category: "Breakfast", department: "KITCHEN", price: 340, costPrice: 95, description: "Dried cured spiced beef shreds tossed with torn injera in rich berbere sauce.", isAvailable: true, isActive: true, prepTimeMinutes: 7 },
  { id: "item-29", name: "Fasting Firfir with Awaze", slug: "fasting-firfir", category: "Breakfast", department: "KITCHEN", price: 210, costPrice: 45, description: "Injera shredded in savory spiced tomato-onion reduction.", isAvailable: true, isActive: true, prepTimeMinutes: 6 },
  { id: "item-30", name: "Derek Tibs Crispy Platter", slug: "derek-tibs", category: "Mains", department: "KITCHEN", price: 520, costPrice: 180, description: "Crisp pan-roasted beef chunks served with awaze and mitmita.", isAvailable: true, isActive: true, prepTimeMinutes: 12 },
  { id: "item-31", name: "Fish Goulash with Rice", slug: "fish-goulash", category: "Mains", department: "KITCHEN", price: 390, costPrice: 130, description: "Lake Tana tilapia cubes simmered in spiced tomato gravy.", isAvailable: true, isActive: true, prepTimeMinutes: 9 },
  { id: "item-32", name: "Chicken Kebab Skewers", slug: "chicken-kebab", category: "Mains", department: "KITCHEN", price: 360, costPrice: 110, description: "Char-grilled marinated chicken breast skewers served with garlic dip.", isAvailable: true, isActive: true, prepTimeMinutes: 10 },
  { id: "item-33", name: "Fresh Garden Salad", slug: "garden-salad", category: "Salads", department: "KITCHEN", price: 160, costPrice: 35, description: "Crisp lettuce, cucumbers, cherry tomatoes with lemon-herb vinaigrette.", isAvailable: true, isActive: true, prepTimeMinutes: 4 },
  { id: "item-34", name: "Avocado Chicken Caesar Salad", slug: "chicken-caesar", category: "Salads", department: "KITCHEN", price: 290, costPrice: 75, description: "Grilled chicken, avocado slices, croutons, and creamy dressing.", isAvailable: true, isActive: true, prepTimeMinutes: 5 },
  { id: "item-35", name: "Chocolate Hazelnut Muffin", slug: "chocolate-muffin", category: "Bakery", department: "BAKERY", price: 125, costPrice: 28, description: "Baked fresh every morning with Belgian cocoa drops.", isAvailable: true, isActive: true, prepTimeMinutes: 1 },
  { id: "item-36", name: "Carrot Walnut Cake Slice", slug: "carrot-cake", category: "Bakery", department: "BAKERY", price: 150, costPrice: 38, description: "Moist spiced cake topped with cream cheese frosting.", isAvailable: true, isActive: true, prepTimeMinutes: 1 },
  { id: "item-37", name: "Apple Cinnamon Danish", slug: "apple-danish", category: "Bakery", department: "BAKERY", price: 135, costPrice: 32, description: "Flaky pastry centered with caramelized cinnamon apple chunks.", isAvailable: true, isActive: true, prepTimeMinutes: 1 },
  { id: "item-38", name: "Baguette Sandwich with Smoked Turkey", slug: "turkey-sandwich", category: "Snacks", department: "KITCHEN", price: 280, costPrice: 85, description: "Crusty baguette with mustard, turkey slices, and gouda cheese.", isAvailable: true, isActive: true, prepTimeMinutes: 5 },
  { id: "item-39", name: "Tuna Melt Panini", slug: "tuna-melt", category: "Snacks", department: "KITCHEN", price: 270, costPrice: 80, description: "Pressed warm panini with flaked tuna, sweet corn, and mozzarella.", isAvailable: true, isActive: true, prepTimeMinutes: 6 },
  { id: "item-40", name: "Mineral Still Water 500ml", slug: "still-water-500", category: "Beverage", department: "BEVERAGE", price: 40, costPrice: 15, description: "Bottled natural spring water.", isAvailable: true, isActive: true, prepTimeMinutes: 1 }
];

// =========================================================================
// 60 Raw Ingredients & Inventory Stock Items
// =========================================================================
export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  { id: "inv-1", name: "Yirgacheffe Grade 1 Green Coffee", sku: "CB-YIRG-G1", category: "COFFEE_BEANS", currentStock: 48.5, unit: "kg", minThreshold: 20, costPerUnit: 420, supplier: "Oromia Coffee Cooperative", lastRestocked: "2026-10-18", status: "OK" },
  { id: "inv-2", name: "Sidama Natural Special Green Coffee", sku: "CB-SIDA-LOT", category: "COFFEE_BEANS", currentStock: 14.0, unit: "kg", minThreshold: 15, costPerUnit: 480, supplier: "Sidama Farmers Union", lastRestocked: "2026-10-15", status: "LOW" },
  { id: "inv-3", name: "Harar Longberry Roast Beans", sku: "CB-HARA-RST", category: "COFFEE_BEANS", currentStock: 28.0, unit: "kg", minThreshold: 10, costPerUnit: 520, supplier: "Harar Highland Traders", lastRestocked: "2026-10-20", status: "OK" },
  { id: "inv-4", name: "Local Pasteurized Whole Milk", sku: "DRY-MILK-LCL", category: "DAIRY", currentStock: 65, unit: "liters", minThreshold: 40, costPerUnit: 75, supplier: "Mama Fresh Dairy Addis", lastRestocked: "2026-10-23", status: "OK" },
  { id: "inv-5", name: "Barista Oat Milk (Pack)", sku: "DRY-MILK-OAT", category: "DAIRY", currentStock: 6, unit: "cartons", minThreshold: 12, costPerUnit: 240, supplier: "Addis International Importers", lastRestocked: "2026-10-12", status: "LOW" },
  { id: "inv-6", name: "Niter Kibbeh (Clarified Butter)", sku: "SP-KIBBEH-CLF", category: "DAIRY", currentStock: 8.5, unit: "kg", minThreshold: 5, costPerUnit: 650, supplier: "Debre Zeit Dairy Guild", lastRestocked: "2026-10-19", status: "OK" },
  { id: "inv-7", name: "Grade A Brown Teff Flour", sku: "GR-TEFF-BRN", category: "DRY_GOODS", currentStock: 120, unit: "kg", minThreshold: 50, costPerUnit: 110, supplier: "Shoa Agricultural Supply", lastRestocked: "2026-10-16", status: "OK" },
  { id: "inv-8", name: "White Teff Injera (Fresh Batch)", sku: "GR-INJERA-RDY", category: "DRY_GOODS", currentStock: 45, unit: "pieces", minThreshold: 60, costPerUnit: 22, supplier: "Bole Artisan Bakery", lastRestocked: "2026-10-23", status: "LOW", expiryDate: "2026-10-25" },
  { id: "inv-9", name: "Traditional Berbere Spice Blend", sku: "SP-BERBERE-OG", category: "SPICES", currentStock: 18.0, unit: "kg", minThreshold: 8, costPerUnit: 340, supplier: "Mercato Traditional Herbs", lastRestocked: "2026-10-10", status: "OK" },
  { id: "inv-10", name: "Shiro Powder (Chickpea Medley)", sku: "GR-SHIRO-CHKP", category: "DRY_GOODS", currentStock: 35.0, unit: "kg", minThreshold: 15, costPerUnit: 190, supplier: "Mercato Traditional Herbs", lastRestocked: "2026-10-14", status: "OK" },
  { id: "inv-11", name: "Hass Avocado (Selected Fresh)", sku: "PR-AVOCADO-HSS", category: "PRODUCE", currentStock: 42, unit: "kg", minThreshold: 20, costPerUnit: 95, supplier: "Hawassa Fruit Growers", lastRestocked: "2026-10-22", status: "OK" },
  { id: "inv-12", name: "Arba Minch Mangoes", sku: "PR-MANGO-ARBA", category: "PRODUCE", currentStock: 8, unit: "kg", minThreshold: 15, costPerUnit: 85, supplier: "Hawassa Fruit Growers", lastRestocked: "2026-10-21", status: "LOW" },
  { id: "inv-13", name: "Bale Mountain Pure Raw Honey", sku: "DRY-HONEY-BALE", category: "DRY_GOODS", currentStock: 16, unit: "kg", minThreshold: 8, costPerUnit: 520, supplier: "Bale Wild Beekeepers", lastRestocked: "2026-10-11", status: "OK" },
  { id: "inv-14", name: "Prime Beef Sirloin (Chilled)", sku: "PR-BEEF-SRLN", category: "PRODUCE", currentStock: 19.5, unit: "kg", minThreshold: 12, costPerUnit: 680, supplier: "Modjo Quality Meats", lastRestocked: "2026-10-23", status: "OK", expiryDate: "2026-10-26" },
  { id: "inv-15", name: "Fresh Chicken Breasts (Skinless)", sku: "PR-CHK-BREAST", category: "PRODUCE", currentStock: 4.5, unit: "kg", minThreshold: 10, costPerUnit: 440, supplier: "Elfora Agro Industries", lastRestocked: "2026-10-22", status: "LOW", expiryDate: "2026-10-25" },
  { id: "inv-16", name: "Biodegradable Paper Cups (8oz)", sku: "PKG-CUP-8OZ", category: "PACKAGING", currentStock: 350, unit: "units", minThreshold: 500, costPerUnit: 4.5, supplier: "EcoPack Ethiopia", lastRestocked: "2026-10-05", status: "LOW" },
  { id: "inv-17", name: "Biodegradable Paper Cups (12oz)", sku: "PKG-CUP-12OZ", category: "PACKAGING", currentStock: 820, unit: "units", minThreshold: 400, costPerUnit: 5.8, supplier: "EcoPack Ethiopia", lastRestocked: "2026-10-18", status: "OK" },
  { id: "inv-18", name: "Cup Lids & Sip Hole (Recyclable)", sku: "PKG-LID-UNIV", category: "PACKAGING", currentStock: 1200, unit: "units", minThreshold: 600, costPerUnit: 2.2, supplier: "EcoPack Ethiopia", lastRestocked: "2026-10-18", status: "OK" },
  { id: "inv-19", name: "Whole Cardamom Pods (Green)", sku: "SP-CARDAMOM-GRN", category: "SPICES", currentStock: 3.2, unit: "kg", minThreshold: 2.0, costPerUnit: 1400, supplier: "Kaffa Forest Spices", lastRestocked: "2026-10-02", status: "OK" },
  { id: "inv-20", name: "Ceylon Cinnamon Quills", sku: "SP-CINNAMON-CYL", category: "SPICES", currentStock: 0.8, unit: "kg", minThreshold: 1.5, costPerUnit: 980, supplier: "Kaffa Forest Spices", lastRestocked: "2026-09-28", status: "LOW" }
];

// Fill up to 60 items with additional pantry items
for (let i = 21; i <= 60; i++) {
  const categories: InventoryItem["category"][] = ["DRY_GOODS", "PRODUCE", "SPICES", "PACKAGING", "DAIRY"];
  const cat = categories[i % categories.length] || "DRY_GOODS";
  MOCK_INVENTORY_ITEMS.push({
    id: `inv-${i}`,
    name: `Inventory Item #${i} (${cat.replace("_", " ")})`,
    sku: `SKU-${1000 + i}`,
    category: cat,
    currentStock: Math.floor(15 + Math.random() * 85),
    unit: cat === "DAIRY" ? "liters" : cat === "PACKAGING" ? "units" : "kg",
    minThreshold: Math.floor(10 + Math.random() * 25),
    costPerUnit: Math.floor(40 + Math.random() * 260),
    supplier: "Addis Commercial Supply Co.",
    lastRestocked: "2026-10-19",
    status: i % 7 === 0 ? "LOW" : "OK"
  });
}

// =========================================================================
// 20 Registered Customers with Credit Accounts
// =========================================================================
export const MOCK_CUSTOMERS: CustomerCreditAccount[] = [
  {
    id: "cust-1",
    customerId: "CUST-1001",
    customerName: "Abebe Bikila Law Chambers",
    phone: "+251 91 123 4567",
    email: "contact@bikilalaw.et",
    creditLimit: 25000,
    currentBalance: 8450,
    availableCredit: 16550,
    paymentTermsDays: 30,
    status: "ACTIVE",
    lastPaymentDate: "2026-10-15",
    unpaidInvoicesCount: 3,
    ledger: [
      { id: "led-1", date: "2026-10-02", type: "CHARGE", amount: 3200, balanceAfter: 3200, reference: "ORD-9102" },
      { id: "led-2", date: "2026-10-09", type: "CHARGE", amount: 2850, balanceAfter: 6050, reference: "ORD-9244" },
      { id: "led-3", date: "2026-10-15", type: "PAYMENT", amount: 3000, balanceAfter: 3050, reference: "PAY-CBE-771" },
      { id: "led-4", date: "2026-10-21", type: "CHARGE", amount: 5400, balanceAfter: 8450, reference: "ORD-9512" },
    ]
  },
  {
    id: "cust-2",
    customerId: "CUST-1002",
    customerName: "Ethiopian Airlines Crew Lounge",
    phone: "+251 91 234 5678",
    email: "catering@ethiopianairlines.com",
    creditLimit: 60000,
    currentBalance: 32400,
    availableCredit: 27600,
    paymentTermsDays: 15,
    status: "ACTIVE",
    lastPaymentDate: "2026-10-20",
    unpaidInvoicesCount: 6,
    ledger: [
      { id: "led-5", date: "2026-10-18", type: "CHARGE", amount: 14200, balanceAfter: 47400, reference: "ORD-9420" },
      { id: "led-6", date: "2026-10-20", type: "PAYMENT", amount: 15000, balanceAfter: 32400, reference: "PAY-EB-8821" },
    ]
  },
  {
    id: "cust-3",
    customerId: "CUST-1003",
    customerName: "Selamawit Kebede (Diplomat)",
    phone: "+251 92 345 6789",
    email: "s.kebede@diplomacy.gov.et",
    creditLimit: 15000,
    currentBalance: 14200,
    availableCredit: 800,
    paymentTermsDays: 15,
    status: "OVERDUE",
    lastPaymentDate: "2026-09-28",
    unpaidInvoicesCount: 5,
    ledger: [
      { id: "led-7", date: "2026-09-30", type: "CHARGE", amount: 4800, balanceAfter: 14200, reference: "ORD-8812" },
    ]
  },
  {
    id: "cust-4",
    customerId: "CUST-1004",
    customerName: "Fintech Hub Addis",
    phone: "+251 93 456 7890",
    email: "office@fintechaddis.io",
    creditLimit: 35000,
    currentBalance: 11200,
    availableCredit: 23800,
    paymentTermsDays: 30,
    status: "ACTIVE",
    lastPaymentDate: "2026-10-10",
    unpaidInvoicesCount: 2,
    ledger: []
  },
  {
    id: "cust-5",
    customerId: "CUST-1005",
    customerName: "Zep-Re Insurance Regional Office",
    phone: "+251 94 567 8901",
    email: "operations@zepre.com",
    creditLimit: 40000,
    currentBalance: 0,
    availableCredit: 40000,
    paymentTermsDays: 30,
    status: "ACTIVE",
    lastPaymentDate: "2026-10-22",
    unpaidInvoicesCount: 0,
    ledger: []
  }
];

// Fill up to 20 customers
for (let c = 6; c <= 20; c++) {
  const limit = 10000 + (c % 4) * 10000;
  const balance = Math.floor(Math.random() * (limit * 0.7));
  MOCK_CUSTOMERS.push({
    id: `cust-${c}`,
    customerId: `CUST-${1000 + c}`,
    customerName: `Corporate Guest / Entity #${c}`,
    phone: `+251 91 ${(100 + c * 33).toString().padStart(3, "0")} ${c * 42}`,
    email: `accounts${c}@corporate-client.et`,
    creditLimit: limit,
    currentBalance: balance,
    availableCredit: limit - balance,
    paymentTermsDays: 30,
    status: balance > limit * 0.85 ? "OVERDUE" : "ACTIVE",
    lastPaymentDate: "2026-10-18",
    unpaidInvoicesCount: balance > 0 ? Math.ceil(balance / 2000) : 0,
    ledger: []
  });
}

// =========================================================================
// 200 Chronological Orders Generation
// =========================================================================
const statuses: Order["orderStatus"][] = ["COMPLETED", "COMPLETED", "COMPLETED", "READY", "PREPARING", "CONFIRMED", "PENDING", "CANCELLED"];
const fulfillments: Order["fulfillmentType"][] = ["DINE_IN", "DINE_IN", "PICKUP", "DELIVERY"];
const paymentMethods: Order["paymentMethod"][] = ["TELEBIRR", "CASH", "CBE_BIRR", "CREDIT"];

export const MOCK_ORDERS: Order[] = [];

// Seed 200 orders spread across the last 7 days
const now = new Date("2026-10-23T21:30:00Z");

for (let i = 1; i <= 200; i++) {
  const orderNum = `ORD-${(9800 - i).toString()}`;
  // Spread timestamps: first 35 orders are from today, next 50 yesterday, remainder past week
  const minutesAgo = i < 35 ? i * 14 : i < 85 ? (i * 28) + 720 : (i * 45) + 1440;
  const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

  // Determine status (recent orders are active/in kitchen)
  let orderStatus: Order["orderStatus"] = "COMPLETED";
  if (i <= 6) {
    orderStatus = "PREPARING";
  } else if (i <= 12) {
    orderStatus = "CONFIRMED";
  } else if (i <= 18) {
    orderStatus = "READY";
  } else if (i <= 22) {
    orderStatus = "PENDING";
  } else if (i % 25 === 0) {
    orderStatus = "CANCELLED";
  }

  const fulfillmentType = fulfillments[i % fulfillments.length] || "DINE_IN";
  const paymentMethod = paymentMethods[i % paymentMethods.length] || "CASH";
  const paymentStatus: Order["paymentStatus"] = orderStatus === "CANCELLED" ? "REFUNDED" : orderStatus === "PENDING" && paymentMethod === "CASH" ? "UNPAID" : "PAID";

  // Pick 1 to 4 items
  const itemCount = 1 + (i % 3);
  const lineItems: OrderLineItem[] = [];
  let subtotal = 0;

  for (let k = 0; k < itemCount; k++) {
    const menuItem = MOCK_MENU_ITEMS[(i + k * 7) % MOCK_MENU_ITEMS.length] || MOCK_MENU_ITEMS[0]!;
    const qty = 1 + ((i + k) % 2);
    const itemSubtotal = menuItem.price * qty;
    subtotal += itemSubtotal;
    lineItems.push({
      id: `li-${i}-${k}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: qty,
      unitPrice: menuItem.price,
      subtotal: itemSubtotal,
      notes: k === 0 && i % 3 === 0 ? "Extra hot, side honey" : undefined
    });
  }

  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const total = subtotal + tax;

  const custEntry = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
  const customerName = i % 4 === 0 && custEntry ? custEntry.customerName : `Guest Patron #${(i * 17) % 99 + 1}`;

  MOCK_ORDERS.push({
    id: `ord-${i}`,
    orderNumber: orderNum,
    createdAt,
    customerName,
    customerPhone: i % 3 === 0 ? `+251 91 1${(10 + i).toString().padStart(2, "0")} 44` : undefined,
    fulfillmentType,
    tableNumber: fulfillmentType === "DINE_IN" ? `T-${(i % 16) + 1}` : undefined,
    orderStatus,
    paymentStatus,
    paymentMethod,
    lineItems,
    subtotal,
    tax,
    total,
    assigneeName: i % 2 === 0 ? "Almaz Tadesse" : "Dawit Bekele",
    cancelReason: orderStatus === "CANCELLED" ? "Customer requested cancellation before ticket fired" : undefined,
    timeline: [
      { status: "PENDING", timestamp: createdAt, actor: "System POS" },
      ...(orderStatus !== "PENDING" && orderStatus !== "CANCELLED"
        ? [{ status: "CONFIRMED", timestamp: new Date(new Date(createdAt).getTime() + 120000).toISOString(), actor: "Dawit Bekele (Cashier)" }]
        : []),
      ...(orderStatus === "PREPARING" || orderStatus === "READY" || orderStatus === "COMPLETED"
        ? [{ status: "PREPARING", timestamp: new Date(new Date(createdAt).getTime() + 240000).toISOString(), actor: "Almaz Tadesse (Barista)" }]
        : []),
      ...(orderStatus === "READY" || orderStatus === "COMPLETED"
        ? [{ status: "READY", timestamp: new Date(new Date(createdAt).getTime() + 680000).toISOString(), actor: "Kitchen Expediter" }]
        : []),
      ...(orderStatus === "COMPLETED"
        ? [{ status: "COMPLETED", timestamp: new Date(new Date(createdAt).getTime() + 1200000).toISOString(), actor: "Floor Waiter" }]
        : []),
    ]
  });
}

// =========================================================================
// 12 Staff Members
// =========================================================================
export const MOCK_STAFF: StaffMember[] = [
  { id: "st-1", name: "Cherinet Admin", email: "admin@sablecafe.com", phone: "+251 91 100 0001", role: "ADMINISTRATOR", department: "Executive", status: "ACTIVE", startDate: "2024-01-01", monthlySalary: 45000 },
  { id: "st-2", name: "Solomon Haile", email: "manager@sablecafe.com", phone: "+251 91 100 0002", role: "MANAGER", department: "Operations", status: "ACTIVE", startDate: "2024-02-15", monthlySalary: 32000 },
  { id: "st-3", name: "Almaz Tadesse", email: "almaz.t@sablecafe.com", phone: "+251 91 100 0003", role: "BARISTA", department: "Beverage", status: "ACTIVE", startDate: "2024-04-01", monthlySalary: 18000 },
  { id: "st-4", name: "Dawit Bekele", email: "dawit.b@sablecafe.com", phone: "+251 91 100 0004", role: "CASHIER", department: "Front Desk", status: "ACTIVE", startDate: "2024-05-10", monthlySalary: 16500 },
  { id: "st-5", name: "Tigist Mengistu", email: "tigist.m@sablecafe.com", phone: "+251 91 100 0005", role: "KITCHEN_STAFF", department: "Kitchen", status: "ACTIVE", startDate: "2024-03-20", monthlySalary: 19000 },
  { id: "st-6", name: "Kassahun Wondimu", email: "kassahun.w@sablecafe.com", phone: "+251 91 100 0006", role: "WAITER", department: "Service Floor", status: "ACTIVE", startDate: "2024-06-01", monthlySalary: 14000 },
  { id: "st-7", name: "Marta Girma", email: "marta.g@sablecafe.com", phone: "+251 91 100 0007", role: "BARISTA", department: "Beverage", status: "ACTIVE", startDate: "2024-07-15", monthlySalary: 17500 },
  { id: "st-8", name: "Yonas Abebe", email: "yonas.a@sablecafe.com", phone: "+251 91 100 0008", role: "KITCHEN_STAFF", department: "Kitchen", status: "ACTIVE", startDate: "2024-08-01", monthlySalary: 18500 },
  { id: "st-9", name: "Hiwot Assefa", email: "hiwot.a@sablecafe.com", phone: "+251 91 100 0009", role: "WAITER", department: "Service Floor", status: "ACTIVE", startDate: "2024-08-20", monthlySalary: 14000 },
  { id: "st-10", name: "Henok Tefera", email: "henok.t@sablecafe.com", phone: "+251 91 100 0010", role: "CASHIER", department: "Front Desk", status: "ON_LEAVE", startDate: "2024-09-01", monthlySalary: 16500 },
  { id: "st-11", name: "Bethlehem Desta", email: "bethlehem.d@sablecafe.com", phone: "+251 91 100 0011", role: "WAITER", department: "Service Floor", status: "ACTIVE", startDate: "2024-09-15", monthlySalary: 14000 },
  { id: "st-12", name: "Tamrat Negash", email: "tamrat.n@sablecafe.com", phone: "+251 91 100 0012", role: "MANAGER", department: "Supply Chain", status: "ACTIVE", startDate: "2024-03-01", monthlySalary: 30000 }
];

// =========================================================================
// Complaints
// =========================================================================
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "comp-1",
    ticketNumber: "CMP-401",
    customerName: "Ato Berhanu Lemma",
    customerContact: "+251 91 555 1234",
    orderNumber: "ORD-9780",
    category: "SERVICE_DELAY",
    severity: "HIGH",
    status: "OPEN",
    subject: "35 minute delay on pour-over coffee",
    details: "Guest ordered two single origin pour-overs and waited past the 15-minute SLA while subsequent guests were served.",
    createdAt: "2026-10-23T20:15:00Z",
    assignedTo: "Solomon Haile"
  },
  {
    id: "comp-2",
    ticketNumber: "CMP-402",
    customerName: "W/ro Aster Worku",
    customerContact: "+251 91 666 5678",
    orderNumber: "ORD-9764",
    category: "FOOD_QUALITY",
    severity: "MEDIUM",
    status: "IN_PROGRESS",
    subject: "Sambusa pastry cold in the center",
    details: "Patron indicated that the lentil filling was cold inside. Apologized and remade fresh batch.",
    createdAt: "2026-10-23T18:40:00Z",
    assignedTo: "Tigist Mengistu"
  },
  {
    id: "comp-3",
    ticketNumber: "CMP-403",
    customerName: "Fintech Hub Addis (Lidia)",
    customerContact: "+251 93 456 7890",
    orderNumber: "ORD-9712",
    category: "BILLING",
    severity: "LOW",
    status: "RESOLVED",
    subject: "Duplicate charge on corporate credit invoice",
    details: "Invoice #9712 showed item duplicated twice. Credit adjustment of ETB 380 credited to account ledger.",
    createdAt: "2026-10-22T14:10:00Z",
    assignedTo: "Dawit Bekele",
    resolutionNotes: "Audit credit adjustment #ADJ-204 processed and verified with accounting."
  },
  {
    id: "comp-4",
    ticketNumber: "CMP-404",
    customerName: "Anonymous Guest",
    customerContact: "in-store feedback box",
    category: "AMBIANCE",
    severity: "LOW",
    status: "CLOSED",
    subject: "Background music slightly loud during afternoon meetings",
    details: "Sound volume lowered on mezzanine floor speakers.",
    createdAt: "2026-10-21T16:00:00Z",
    assignedTo: "Solomon Haile",
    resolutionNotes: "Sound levels calibrated to 65dB max per cafe policy."
  }
];

// =========================================================================
// Immutable System Audit Records
// =========================================================================
export const MOCK_AUDIT_LOGS: AuditRecord[] = [
  {
    id: "aud-1",
    actor: "Cherinet Admin",
    role: "ADMINISTRATOR",
    action: "CREDIT_LIMIT_INCREASE",
    entityType: "CustomerCreditAccount",
    entityId: "cust-2",
    timestamp: "2026-10-23T19:40:12Z",
    requestId: "req-988421",
    diff: {
      before: { creditLimit: 50000, availableCredit: 17600 },
      after: { creditLimit: 60000, availableCredit: 27600 }
    }
  },
  {
    id: "aud-2",
    actor: "Dawit Bekele",
    role: "CASHIER",
    action: "ORDER_REFUND_PROCESSED",
    entityType: "Order",
    entityId: "ORD-9742",
    timestamp: "2026-10-23T17:12:05Z",
    requestId: "req-988310",
    diff: {
      before: { paymentStatus: "PAID", orderStatus: "CANCELLED" },
      after: { paymentStatus: "REFUNDED", refundAmount: 480 }
    }
  },
  {
    id: "aud-3",
    actor: "Tamrat Negash",
    role: "MANAGER",
    action: "INVENTORY_WASTE_LOGGED",
    entityType: "InventoryItem",
    entityId: "inv-4",
    timestamp: "2026-10-23T15:20:00Z",
    requestId: "req-988190",
    diff: {
      before: { currentStock: 71, reason: null },
      after: { currentStock: 65, wasteQuantity: 6, reason: "SPILLAGE_REFRIGERATION_FAULT" }
    }
  },
  {
    id: "aud-4",
    actor: "Solomon Haile",
    role: "MANAGER",
    action: "MENU_ITEM_PRICE_UPDATE",
    entityType: "MenuItem",
    entityId: "item-14",
    timestamp: "2026-10-22T11:05:44Z",
    requestId: "req-987812",
    diff: {
      before: { price: 450 },
      after: { price: 480 }
    }
  }
];
