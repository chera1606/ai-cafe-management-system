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
  initiatedAt: Date | string;
  confirmedAt?: Date | string | null;
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
  issuedAt: Date | string;
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
