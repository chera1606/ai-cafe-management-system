# Sable Cafe Admin & Staff Back-Office Dashboard

A modern, data-dense, calm, and professional back-office web application for the AI-Powered Cafe Management System, located under the protected route group `apps/web/src/app/(dashboard)`.

---

## 1. Route Map & Role Authorization Matrix

Every route is guarded by both client UX role filtering (`components/dashboard/sidebar.tsx`, `app/(dashboard)/layout.tsx`) and server authorization (SRS 11.2).

| Route | View Name | Primary Functionality | Authorized Staff Roles |
| :--- | :--- | :--- | :--- |
| `/dashboard` | Executive Overview | 6 animated count-up KPIs, hourly sales velocity area chart, fulfillment share donut, live order feed with SLA escalation timers, low-stock radar, AI advisory signal shell. | OWNER, MANAGER, ADMINISTRATOR |
| `/orders` | Orders Directory | TanStack Table with faceted filtering (All, Active, Ready, Completed, Cancelled), CSV export, slide-in order drawer, line-item breakdown, separate payment vs order status, and audit timeline. | ALL STAFF ROLES |
| `/orders/[id]` | Direct Order View | Standalone deep-link detail page for ticket inspection and history. | ALL STAFF ROLES |
| `/kitchen` | Kitchen Display (KDS) | Full-screen, touch-friendly KDS. 4 Kanban columns (New → Accepted → Preparing → Ready), department tabs, sound alert mute toggle, SLA color-coded timers (amber @ 8m, red @ 15m), and 1-tap bump buttons. | KITCHEN_STAFF, BARISTA, MANAGER, ADMIN |
| `/pos` | Fast POS Terminal | Two-pane touch-first cashier interface: category tabs, item grid with search, active ticket with modifiers & table selector, change calculator, ETB split payments (Cash, Telebirr, CBE Birr, Credit), printable receipt modal. | CASHIER, WAITER, MANAGER, ADMIN |
| `/menu-admin` | Menu Catalog & BOM | Table and card views, side-sheet recipe editor, category reordering, and instant optimistic 86'd stock availability toggles. | OWNER, MANAGER, ADMIN |
| `/inventory` | Inventory & Supply | Stock table with safety threshold chips (OK, Low, Out, Expiring), append-only stock movement ledger, PO receipt drawer, spoilage waste logger with SRS 5.10 categories, and physical count reconciliation calculator. | OWNER, MANAGER, ADMIN |
| `/customers` | Customer Directory | Registered customer profiles, corporate accounts, credit line status, and contact directory. | CASHIER, MANAGER, ADMIN |
| `/credit` | Customer Credit Accounts | Facility limit gauges, running transaction ledgers (CHARGE, PAYMENT, ADJUSTMENT), partial repayment recorder, monthly statement PDF preview, and audit-governed adjustments requiring mandatory justification. | OWNER, MANAGER, ADMIN |
| `/staff` | Staff & Roles | Team directory, staff invitation side sheet, suspension modal with audit justification, and role permission assignment matrix. | OWNER, MANAGER, ADMIN |
| `/complaints` | Guest Feedback Tickets | 4-column Kanban board (Open → In Progress → Resolved → Closed), severity badges, linked orders, and resolution response composer. | MANAGER, ADMIN |
| `/reports` | Financial Intelligence | Gross sales trajectories, 15% VAT statutory remittance summaries, payment channel shares, food waste cost summaries, and CSV data export. | OWNER, MANAGER, ADMIN |
| `/audit` | System Audit Ledger | Immutable WORM log viewer with before/after state JSON diff inspector, request IDs, and operator timestamps. | OWNER, ADMINISTRATOR |
| `/settings` | Cafe Settings | Operating hours, VAT TIN, accepted payment gateway switches, staff notification preferences, and forest dark mode toggle. | OWNER, ADMINISTRATOR |

---

## 2. Design Tokens & Styling Language

- **Brand Palette:**
  - Canvas: `--cream` (`#F8F9F5`), Dark canvas: `#121A14`
  - Deep Base: `--forest` (`#263228`), Surface cards: `--white` (`#FFFFFF` / `#1B2820`)
  - Primary Accent: `--meadow` (`#48A853`), Hover: `--meadow-alt` (`#43A047`)
  - Highlights / Warnings: `--amber` (`#FF8A3D`), Alert: `--amber-alt` (`#F59E0B`)
  - Muted Neutral: `--sage` (`#718079`), Borders: `--border` (`#E5E7EB` / `#283A2D`)
- **Semantic Status Tokens:**
  - Success: `var(--status-success)` (`#48A853` with 12% tint background)
  - Warning: `var(--status-warning)` (`#F59E0B` with 12% tint background)
  - Danger: `var(--status-danger)` (`#EF4444` with 12% tint background)
  - Info: `var(--status-info)` (`#3B82F6` with 12% tint background)
- **Rules:**
  - All financial values and quantities enforce tabular numerals (`tabular-nums`) and standard Ethiopian Birr (`ETB 1,250.00`) formatting.
  - Every status badge combines an SVG icon and text (never color alone).
  - All destructive or balance-modifying actions require an audit reason.

---

## 3. How to Swap Mock Services for the Real API

The data layer is completely decoupled into `apps/web/src/services/dashboard-service.ts`. UI components **never** contain inline business calculations or direct storage mutations.

### Migration Steps:
1. Replace in-memory array operations in `apps/web/src/services/dashboard-service.ts` with HTTP calls via `@/lib/api-client`:
   ```ts
   // Example: Switching getOrders from mock to NestJS API
   async getOrders(): Promise<Order[]> {
     const res = await apiClient.get<Order[]>("/api/v1/orders");
     return res.data;
   }

   // Example: Switching stock adjustment
   async adjustStock(itemId: string, adjustmentQuantity: number, reason: string): Promise<InventoryItem> {
     const res = await apiClient.post<InventoryItem>(`/api/v1/inventory/${itemId}/adjust`, {
       quantity: adjustmentQuantity,
       reason,
     });
     return res.data;
   }
   ```
2. In `apps/web/src/lib/realtime-bus.ts`, replace the simulated heartbeat interval with an active WebSocket or Server-Sent Events (SSE) connection to `ws://localhost:3000/events` or `/api/v1/events`.

---

## 4. Final vs Placeholder Elements

| Component | Status | Notes |
| :--- | :--- | :--- |
| **All 13 Dashboard Pages** | **Final** | Fully functional UI, faceted tables, drawers, kanbans, forms, modals, and charts. |
| **Data Layer & Calculations** | **Final** | Server-authoritative formatters, reconciliation math, and state transition rules. |
| **AI Insights Card** | **Placeholder Shell** | Clearly labeled as advisory forecast (SRS 7.2 / 15.2); AI is never the authoritative source of truth for ledgers. |
| **Role Permission Matrix** | **Read-Only Shell** | Displays current capability mapping; pending dynamic IAM permission configurator. |
| **Payment Gateways** | **Simulated / POS Tender** | Fully validates credit lines, cash change, and CBE Birr; ready for live Telebirr API webhooks. |

---

## 5. Keyboard Shortcuts (`?` for Overlay)

- `⌘K` or `Ctrl+K` or `/`: Open Command Palette / Global search
- `g d`: Navigate to Dashboard Overview
- `g o`: Navigate to Orders Directory
- `g k`: Navigate to Kitchen Display (KDS)
- `g p`: Navigate to Fast POS Terminal
- `g i`: Navigate to Inventory Management
- `n`: New Order shortcut
- `Esc`: Close any active drawer, modal, or dialog
