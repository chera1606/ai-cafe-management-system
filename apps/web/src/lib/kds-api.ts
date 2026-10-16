import { apiClient } from "./api-client";
import type { OrderDetailResponse, OrderStatus } from "./orders-api";

export type KdsStation = "ALL" | "BARISTA" | "KITCHEN";

export interface KdsWorkloadSummary {
  activeCount: number;
  pendingCount: number;
  confirmedCount: number;
  preparingCount: number;
  readyCount: number;
  completedTodayCount: number;
  averagePrepTimeMinutes: number;
}

export interface KdsQueueResponse {
  orders: OrderDetailResponse[];
  metrics: KdsWorkloadSummary;
  station: KdsStation;
}

export const BARISTA_ITEM_IDS = new Set([
  "item-yirgacheffe-pour-over",
  "11111111-1111-4111-8111-111111111101",
  "item-jebena-buna",
  "11111111-1111-4111-8111-111111111102",
  "item-pistachio-honey-latte",
  "item-honey-pistachio-latte",
  "11111111-1111-4111-8111-111111111103",
  "item-spanish-latte",
  "11111111-1111-4111-8111-111111111104",
  "item-cardamom-cold-brew",
  "item-cold-brew-nitro",
  "11111111-1111-4111-8111-111111111105",
  "item-layered-spris-juice",
  "item-mango-juice",
  "11111111-1111-4111-8111-111111111106",
  "item-clove-spiced-chai",
  "item-shai-spiced-tea",
  "11111111-1111-4111-8111-111111111107",
  "item-hibiscus-mint-fizz",
  "11111111-1111-4111-8111-111111111108",
  "item-ginger-latte",
]);

/**
 * Determines whether an item belongs to the Barista station or the Kitchen station.
 */
export function isBaristaItem(menuItemId: string): boolean {
  return BARISTA_ITEM_IDS.has(menuItemId);
}

/**
 * Fetches the active Kitchen Display System queue and live metrics.
 */
export async function getKdsQueue(
  station: KdsStation = "ALL",
): Promise<KdsQueueResponse> {
  const signal = AbortSignal.timeout(8000);
  const queryParam = station !== "ALL" ? `?station=${station}` : "";
  return apiClient<KdsQueueResponse>(`/orders/kds/queue${queryParam}`, {
    method: "GET",
    signal,
  });
}

/**
 * Updates an order's lifecycle status from the Kitchen station.
 */
export async function updateKdsOrderStatus(
  orderId: string,
  status: OrderStatus,
  reason?: string,
): Promise<OrderDetailResponse> {
  const signal = AbortSignal.timeout(8000);
  return apiClient<OrderDetailResponse>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
    signal,
  });
}
