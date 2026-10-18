import { apiClient } from "./api-client";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface CreateOrderItemPayload {
  menuItemId: string;
  quantity: number;
  specialInstruction?: string;
}

export interface GuestCustomerPayload {
  name: string;
  email?: string;
  phone?: string;
}

export interface DeliveryInfoPayload {
  address: string;
  dropoffNotes?: string;
}

export interface CreateOrderPayload {
  orderType: OrderType;
  tableNumber?: string;
  notes?: string;
  specialInstruction?: string;
  idempotencyKey?: string;
  items: CreateOrderItemPayload[];
  guestCustomer?: GuestCustomerPayload;
  deliveryInfo?: DeliveryInfoPayload;
}

export const MENU_ITEM_UUID_MAP: Record<string, string> = {
  // 17 Actual Catalog Items from menu-items.data.ts
  "item-yirgacheffe-pour-over": "11111111-1111-4111-8111-111111111101",
  "item-jebena-buna": "11111111-1111-4111-8111-111111111102",
  "item-pistachio-honey-latte": "11111111-1111-4111-8111-111111111103",
  "item-honey-pistachio-latte": "11111111-1111-4111-8111-111111111103",
  "item-spanish-latte": "11111111-1111-4111-8111-111111111104",
  "item-cardamom-cold-brew": "11111111-1111-4111-8111-111111111105",
  "item-cold-brew-nitro": "11111111-1111-4111-8111-111111111105",
  "item-layered-spris-juice": "11111111-1111-4111-8111-111111111106",
  "item-mango-juice": "11111111-1111-4111-8111-111111111106",
  "item-clove-spiced-chai": "11111111-1111-4111-8111-111111111107",
  "item-shai-spiced-tea": "11111111-1111-4111-8111-111111111107",
  "item-hibiscus-mint-fizz": "11111111-1111-4111-8111-111111111108",
  "item-chechebsa-kita-firfir": "11111111-1111-4111-8111-111111111109",
  "item-chechebsa": "11111111-1111-4111-8111-111111111109",
  "item-foul-mudammas": "11111111-1111-4111-8111-111111111110",
  "item-cardamom-croissant": "11111111-1111-4111-8111-111111111111",
  "item-salted-caramel-brioche": "11111111-1111-4111-8111-111111111112",
  "item-special-doro-wot": "11111111-1111-4111-8111-111111111113",
  "item-doro-wot-flatbread": "11111111-1111-4111-8111-111111111113",
  "item-sizzling-beef-tibs": "11111111-1111-4111-8111-111111111114",
  "item-tibs-sizzler": "11111111-1111-4111-8111-111111111114",
  "item-vegan-beyaynetu": "11111111-1111-4111-8111-111111111115",
  "item-coffee-tiramisu": "11111111-1111-4111-8111-111111111116",
  "item-pistachio-baklava": "11111111-1111-4111-8111-111111111117",
  "item-baklava": "11111111-1111-4111-8111-111111111117",
  // Backward compatibility legacy aliases
  "item-injera-crisps": "11111111-1111-4111-8111-111111111109",
  "item-avocado-toast": "11111111-1111-4111-8111-111111111110",
  "item-sambusa-lentil": "11111111-1111-4111-8111-111111111111",
  "item-ginger-latte": "11111111-1111-4111-8111-111111111104",
  "item-shiro-pot": "11111111-1111-4111-8111-111111111115",
};

export interface OrderItemDetail {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstruction?: string | null;
}

export interface OrderDeliveryDetail {
  id: string;
  address: string;
  deliveryFee: number;
  status: string;
  estimatedDeliveryTime?: string | null;
  providerReference?: string | null;
}

export interface OrderDetailResponse {
  id: string;
  orderNumber?: string;
  orderCode?: string;
  customerId?: string | null;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  tableNumber?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDetail[];
  delivery?: OrderDeliveryDetail | null;
}

/**
 * Places a new order against the authoritative backend API.
 * Uses a 10-second timeout to allow for transactional validation and idempotency checking.
 */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetailResponse> {
  const signal = AbortSignal.timeout(10000);
  return apiClient<OrderDetailResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}

/**
 * Retrieves an order and its current progress by UUID.
 */
export async function getOrderById(
  orderId: string,
): Promise<OrderDetailResponse> {
  const signal = AbortSignal.timeout(10000);
  return apiClient<OrderDetailResponse>(`/orders/${orderId}`, {
    method: "GET",
    signal,
  });
}

/**
 * Requests cancellation of an order before preparation starts.
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
): Promise<OrderDetailResponse> {
  const signal = AbortSignal.timeout(10000);
  return apiClient<OrderDetailResponse>(`/orders/${orderId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
    signal,
  });
}

/**
 * Retrieves the authenticated customer's historical orders.
 */
export async function getMyOrders(): Promise<OrderDetailResponse[]> {
  const signal = AbortSignal.timeout(10000);
  return apiClient<OrderDetailResponse[]>("/orders/me", {
    method: "GET",
    signal,
  });
}

const LOCAL_ORDERS_KEY = "cafe_local_order_ids";

/**
 * Persists an order UUID to local browser storage so guest customers can track and recall orders.
 */
export function recordPlacedOrderId(orderId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    if (!existing.includes(orderId)) {
      existing.unshift(orderId);
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(existing.slice(0, 50)));
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Retrieves list of locally saved order UUIDs from this browser.
 */
export function getLocalOrderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
