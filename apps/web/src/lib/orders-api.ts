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
  idempotencyKey?: string;
  items: CreateOrderItemPayload[];
  guestCustomer?: GuestCustomerPayload;
  deliveryInfo?: DeliveryInfoPayload;
}

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
