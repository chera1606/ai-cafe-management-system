import { apiClient } from "./api-client";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TELEBIRR"
  | "CBE_BIRR"
  | "CHAPA"
  | "CREDIT";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "PARTIALLY_PAID"
  | "REFUNDED";

export interface InitiatePaymentPayload {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount?: number;
  providerReference?: string;
  customerPhone?: string;
  notes?: string;
}

export interface VerifyPaymentPayload {
  status: "PAID" | "FAILED";
  providerReference?: string;
  failureReason?: string;
}

export interface ProcessRefundPayload {
  amount?: number;
  reason: string;
  providerReference?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerId: string | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  providerReference: string | null;
  notes?: string | null;
  initiatedAt: string;
  confirmedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstruction?: string;
}

export interface ReceiptPaymentRecord {
  id: string;
  paymentMethod: string;
  amount: number;
  status: string;
  providerReference?: string;
  initiatedAt: string;
  confirmedAt?: string | null;
}

export interface CafeMetadata {
  name: string;
  legalEntity: string;
  address: string;
  phone: string;
  taxRegistrationNumber: string;
  vatRatePercent: number;
}

export interface DigitalReceiptResponse {
  receiptNumber: string;
  orderId: string;
  orderNumber: string;
  orderType: string;
  tableNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  issuedAt: string;
  cafe: CafeMetadata;
  items: ReceiptItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  deliveryFee: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: "PAID" | "UNPAID" | "PARTIALLY_PAID" | "REFUNDED";
  payments: ReceiptPaymentRecord[];
}

/**
 * Initiates payment settlement for an order.
 */
export async function initiatePayment(
  payload: InitiatePaymentPayload,
): Promise<PaymentRecord> {
  return apiClient<PaymentRecord>("/payments/initiate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Verifies or confirms a payment transaction (callback, webhook, or cashier approval).
 */
export async function verifyPayment(
  paymentId: string,
  payload: VerifyPaymentPayload,
): Promise<PaymentRecord> {
  return apiClient<PaymentRecord>(`/payments/${paymentId}/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieves formatted itemized digital receipt for an order.
 */
export async function getReceipt(orderId: string): Promise<DigitalReceiptResponse> {
  return apiClient<DigitalReceiptResponse>(`/payments/receipt/${orderId}`, {
    method: "GET",
  });
}

/**
 * Retrieves all payment records associated with an order.
 */
export async function getOrderPayments(
  orderId: string,
): Promise<PaymentRecord[]> {
  return apiClient<PaymentRecord[]>(`/payments/order/${orderId}`, {
    method: "GET",
  });
}

/**
 * Processes an authorized refund for a payment.
 */
export async function processRefund(
  paymentId: string,
  payload: ProcessRefundPayload,
): Promise<{ id: string; amount: number; reason: string; status: string }> {
  return apiClient<{ id: string; amount: number; reason: string; status: string }>(
    `/payments/${paymentId}/refund`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
