# Payment Processing & Digital Receipts Engine

## Overview

The Payment Processing & Digital Receipts subsystem implements the complete commercial transaction lifecycle for the AI Cafe Management System, addressing **FR-PAY-001 through FR-PAY-007**.

---

## 1. Supported Payment Channels (FR-PAY-001)

| Channel Code | Payment Method | Channel Type | Typical Settlement |
| :--- | :--- | :--- | :--- |
| `CASH` | Cash on Counter / Delivery | Direct Tender | Cashier verification at POS, counter, or delivery drop-off |
| `TELEBIRR` | Telebirr Mobile Money | Digital Superapp | Instant USSD prompt / QR push / transaction reference verification |
| `CBE_BIRR` | Commercial Bank of Ethiopia (CBE) | Digital Banking | Account transfer with external transaction confirmation code |
| `CARD` | Debit / Credit Card | Card Payment | EMV POS terminal / tokenized web card gateway (Visa, Mastercard) |
| `CREDIT` | House Credit Account | Patron Ledger | Direct ledger charging against verified corporate or patron account |

---

## 2. Payment Lifecycle States (FR-PAY-002)

```
[ PENDING ] ─────────> [ PAID ] ─────────> [ REFUNDED ]
    │                     │                     ^
    │                     v                     │
    ├─────────> [ FAILED ]                [ PARTIALLY_REFUNDED ]
    │
    └─────────> [ CANCELLED ]
```

1. **PENDING**: Payment transaction initialized; awaiting customer or gateway confirmation.
2. **PROCESSING**: Multi-step mobile prompt or external gateway authorization in flight.
3. **PAID**: Confirmed and fully settled. When total paid amount covers the order balance, the order status transitions to `CONFIRMED` and immediately routes tickets to the Kitchen Display System (KDS).
4. **FAILED**: Gateway authorization declined or transaction timed out.
5. **CANCELLED**: Payment aborted before settlement.
6. **PARTIALLY_PAID**: Partial installment received against order total.
7. **REFUNDED**: Funds returned to customer via authorized manager or admin workflow.

---

## 3. Digital Receipts & Fiscal Record (FR-PAY-006)

Each completed transaction provides a structured electronic fiscal receipt accessible at:
`http://localhost:3001/orders/:id/receipt`

- **Receipt Numbering**: Deterministic format `REC-YYYY-XXXX` (e.g., `REC-2026-B226`).
- **Fiscal Metadata**: Legal PLC entity, registered address, phone, and Tax Registration Number (`TIN-0098471203`).
- **Tax Breakdown**: Subtotal, standard 15% Value Added Tax (VAT), gratuity/tip, and delivery fee.
- **Verification QR Code**: Scannable verification code for counter and runner hand-offs.
- **Printer & PDF Support**: Fully responsive `@media print` styling stripping web navigation for thermal or A4 printers.

---

## 4. Authorized Refund Workflow (FR-PAY-007)

- **Endpoint**: `POST /api/v1/payments/:id/refund`
- **Role Requirement**: `MANAGER` or `ADMIN`
- **Audit Logging**: Every refund logs the authorized staff UUID, refund amount, operational reason, and timestamp to the central audit ledger.

---

## 5. API Endpoints Reference

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/initiate` | Public / Customer | Initiates payment for an order |
| `POST` | `/api/v1/payments/:id/verify` | Public / Webhook | Verifies payment completion or logs gateway failure |
| `GET` | `/api/v1/payments/receipt/:orderId`| Public | Retrieves structured fiscal receipt for printing or display |
| `GET` | `/api/v1/payments/order/:orderId` | Public / Customer | Lists all payment attempts and transactions for an order |
| `POST` | `/api/v1/payments/:id/refund` | Staff (`MANAGER`, `ADMIN`) | Processes authorized full or partial refund |
