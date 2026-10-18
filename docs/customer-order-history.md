# Customer Order History & Account Portal

## Overview

The Customer Order History & Account Portal addresses requirements **FR-CUS-001 through FR-CUS-005** and **FR-ORD-008**, providing patrons and guest customers with transparent access to their historical cafe transactions, live order states, and instant one-click reordering.

---

## 1. Access & Navigation Points

- **Customer Portal Route**: `http://localhost:3001/orders`
- **Main Navigation Link**: "My Orders" in the top navbar and mobile drawer
- **Authenticated Profile Pill**: Clicking customer profile badge in the navigation bar navigates to `/orders`
- **Guest Device Storage**: Orders placed as a guest checkout are recorded to browser local storage (`cafe_local_order_ids`), ensuring guest customers retain full visibility of recent purchases without forced account creation.

---

## 2. Status Categorization & Lifecycle Filtration

The portal organizes orders across four dynamic filter states:

| Tab | State Scope | Intended Customer Action |
| :--- | :--- | :--- |
| **All Orders** | Full historical timeline | Comprehensive audit of all past and active dining records |
| **Active** | `PENDING`, `CONFIRMED`, `PREPARING`, `READY` | Direct access to the live kitchen tracker (`/orders/:id`) |
| **Fulfilled** | `COMPLETED` | Review delivered meals, view fiscal receipts, or reorder favorites |
| **Cancelled** | `CANCELLED` | Review voided requests and operational cancellation remarks |

---

## 3. Account Overview Metrics

Real-time metric counters rendered at the top of the portal:
- **Active in Flight**: Real-time count of tickets currently being prepared or ready for table delivery.
- **Fulfilled Orders**: Total count of completed dining and takeaway experiences.
- **Total Settled**: Aggregated financial expenditure across completed transactions.

---

## 4. One-Click Reordering Workflow

- Each order card includes an **Order Again** action.
- Tapping **Order Again** extracts the original artisan items, modifiers, item quantities, and special preparation instructions directly into the active cart tray (`useCart().addItem`).
- Automatically reveals the cart drawer, ready for rapid re-checkout.

---

## 5. Fiscal Receipt Integration

- Direct link to the official electronic fiscal receipt (`/orders/:id/receipt`) featuring:
  - Unique receipt identifier (`REC-YYYY-XXXX`)
  - 15% Value Added Tax (VAT) invoice itemization
  - Tax Registration Number (`TIN-0098471203`)
  - Scannable QR code verification for counter handoffs
