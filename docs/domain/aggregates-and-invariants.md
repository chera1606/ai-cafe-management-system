# Aggregates, Entities, Value Objects, and Invariants

**Version:** 0.1.0
**Status:** Draft
**Related:** SRS v1.0, Domain Model v0.1.0

---

## 1. Purpose

This document defines the initial aggregates, entities, value objects, and business invariants of the AI-Powered Cafe Management System.

The purpose is to establish clear ownership of business rules before database schema and application implementation.

---

## 2. Key DDD Concepts

### 2.1 Entity

An **entity** is a business object whose identity remains important over time.

Examples:

```text
Customer
Order
Menu Item
Payment
Employee
Inventory Item
```

### 2.2 Value Object

A **value object** represents a concept defined by its value rather than an independent identity.

Potential examples include:

```text
Money
Address
Quantity
DateRange
PhoneNumber
OrderStatus
PaymentStatus
```

### 2.3 Aggregate

An **aggregate** is a consistency boundary around related domain objects.

Each aggregate has an **aggregate root** responsible for enforcing its business invariants.

### 2.4 Invariant

An **invariant** is a business rule that must always remain true.

Example:

> An order must contain at least one order item before confirmation.

---

## 3. Order Aggregate

### Aggregate Root

```text
Order
```

### Entities

```text
Order
OrderItem
```

### Value Objects

Potential value objects include:

```text
Money
Quantity
OrderType
OrderStatus
SpecialInstruction
```

### Responsibilities

The Order aggregate is responsible for:

- Maintaining order items.
- Validating order state transitions.
- Calculating authoritative order totals.
- Maintaining order fulfilment information.
- Preventing invalid order modifications.

### Invariants

1. An order must contain at least one item before confirmation.
2. Order item quantity must be greater than zero.
3. An unavailable menu item must not be added through normal ordering.
4. A completed order cannot be modified.
5. A cancelled order cannot transition to a completed state.
6. The authoritative order total must be calculated by the application, not trusted from client input.
7. Order state transitions must follow allowed business rules.

---

## 4. Customer Aggregate

### Aggregate Root

```text
Customer
```

### Entities

```text
Customer
```

### Value Objects

Potential value objects include:

```text
Address
PhoneNumber
EmailAddress
```

### Responsibilities

The Customer aggregate is responsible for:

- Customer identity.
- Customer profile information.
- Customer preferences.
- Customer account status.

### Invariants

1. A customer must have a unique account identity where required.
2. Protected customer information must only be accessible to authorized users.
3. Customer account state must remain valid.

---

## 5. Customer Credit Aggregate

### Aggregate Root

```text
CreditAccount
```

### Entities

```text
CreditAccount
CreditTransaction
```

### Value Objects

Potential value objects include:

```text
Money
CreditLimit
Balance
BillingPeriod
```

### Responsibilities

The Customer Credit aggregate is responsible for:

- Customer credit eligibility.
- Credit limit.
- Outstanding balance.
- Credit transactions.
- Credit-related state.

### Invariants

1. Only approved customers can use credit.
2. Credit usage must respect the configured credit limit unless an authorized override is permitted.
3. A credit transaction must have a positive or otherwise explicitly valid amount.
4. The outstanding balance must remain consistent with recorded credit transactions and payments.
5. Credit adjustments must be authorized and auditable.

---

## 6. Menu Aggregate

### Aggregate Root

```text
MenuItem
```

### Entities

```text
MenuItem
```

### Value Objects

Potential value objects include:

```text
Money
Availability
PreparationDepartment
```

### Responsibilities

The Menu aggregate is responsible for:

- Menu item identity.
- Customer-facing name and description.
- Price.
- Availability.
- Preparation department.
- Recipe association.

### Invariants

1. Menu price must be valid according to business rules.
2. An inactive or unavailable item must not be normally orderable.
3. Every orderable item must have a valid preparation destination.

---

## 7. Payment Aggregate

### Aggregate Root

```text
Payment
```

### Entities

```text
Payment
Refund
```

### Value Objects

Potential value objects include:

```text
Money
PaymentMethod
PaymentStatus
TransactionReference
```

### Responsibilities

The Payment aggregate is responsible for:

- Payment lifecycle.
- Payment amount.
- Provider transaction reference.
- Payment verification state.
- Refund state.

### Invariants

1. A payment cannot be marked `PAID` without appropriate verification according to the selected payment method.
2. A successful payment amount must be valid.
3. A refund cannot exceed the amount eligible for refund.
4. Payment records must not be silently deleted.
5. Payment state transitions must follow defined rules.

---

## 8. Inventory Aggregate

### Aggregate Root

```text
InventoryItem
```

### Entities

```text
InventoryItem
StockMovement
Batch
```

### Value Objects

Potential value objects include:

```text
Quantity
UnitOfMeasure
Money
StockMovementType
ExpirationDate
```

### Responsibilities

The Inventory aggregate is responsible for:

- Current stock.
- Stock movements.
- Inventory quantities.
- Batch and expiration information where applicable.
- Inventory state.

### Invariants

1. Inventory changes must be represented by recorded stock movements.
2. Stock quantity must remain consistent with valid stock movements.
3. Negative stock should not be permitted unless explicitly allowed by business policy.
4. Waste must be distinguishable from normal consumption.
5. Inventory adjustments must be authorized and auditable.

---

## 9. Recipe

### Primary Concept

```text
Recipe
```

### Related Entities

```text
RecipeItem
Ingredient
```

### Responsibilities

A recipe defines the ingredients and quantities required to prepare a menu item.

Example:

```text
Cappuccino
├── Coffee Beans: 18 g
└── Milk: 150 ml
```

### Invariants

1. Recipe quantities must be valid and greater than zero.
2. Recipe items must reference valid ingredients.
3. Recipe changes should be auditable where they affect costing or inventory consumption.

---

## 10. Kitchen Aggregate

### Aggregate Root

```text
KitchenTask
```

### Entities

```text
KitchenTask
PreparationItem
```

### Value Objects

Potential value objects include:

```text
PreparationStatus
PreparationInstruction
KitchenDepartment
```

### Responsibilities

The Kitchen aggregate is responsible for:

- Preparation queue.
- Preparation status.
- Department assignment.
- Preparation instructions.

### Invariants

1. A kitchen task must reference a valid order item.
2. Preparation status transitions must follow allowed workflow rules.
3. A completed preparation task cannot return to an earlier state without an explicitly supported correction workflow.
4. Kitchen staff must only access tasks permitted for their role and department.

---

## 11. Delivery Aggregate

### Aggregate Root

```text
Delivery
```

### Entities

```text
Delivery
DeliveryAssignment
```

### Value Objects

Potential value objects include:

```text
Address
DeliveryStatus
DeliveryFee
```

### Invariants

1. A delivery must reference a valid fulfilment order.
2. A delivery cannot be marked `DELIVERED` before required preceding states are completed.
3. Delivery assignment must identify an authorized rider or provider where assignment is required.

---

## 12. Staff Aggregate

### Aggregate Root

```text
Employee
```

### Entities

```text
Employee
```

### Value Objects

Potential value objects include:

```text
EmploymentStatus
EmployeeRole
Compensation
```

### Responsibilities

The Staff aggregate is responsible for:

- Employee identity.
- Employment state.
- Role.
- System access association.
- Relevant employment information.

### Invariants

1. Employee system permissions must reflect authorized role assignments.
2. Inactive employees must not retain unauthorized active access.
3. Changes to sensitive employee information must be authorized and auditable.

---

## 13. Aggregate Ownership Summary

| Aggregate       | Aggregate Root | Primary Responsibility           |
| --------------- | -------------- | -------------------------------- |
| Order           | Order          | Order lifecycle                  |
| Customer        | Customer       | Customer identity and profile    |
| Customer Credit | CreditAccount  | Customer credit                  |
| Menu            | MenuItem       | Product availability and pricing |
| Payment         | Payment        | Payment lifecycle                |
| Inventory       | InventoryItem  | Stock state                      |
| Recipe          | Recipe         | Preparation composition          |
| Kitchen         | KitchenTask    | Preparation workflow             |
| Delivery        | Delivery       | Delivery lifecycle               |
| Staff           | Employee       | Employee information and access  |

---

## 14. Cross-Aggregate Rules

Aggregates must not directly manipulate the internal state of other aggregates.

Cross-aggregate interactions should occur through application services, commands, or domain/application events where appropriate.

### Example: Order and Payment

```text
Order
  ↓
requests payment
  ↓
Payment Application Service
  ↓
Payment Aggregate
```

### Example: Order Completion and Inventory

```text
Order Completion
  ↓
Inventory Application Service
  ↓
Inventory Aggregate
```

The internal state of one aggregate should therefore remain protected from direct modification by another aggregate.

---

## 15. Important Domain Events

Potential domain events include:

### Order Events

```text
OrderCreated
OrderConfirmed
OrderCancelled
OrderReady
OrderCompleted
```

### Payment Events

```text
PaymentInitiated
PaymentConfirmed
PaymentFailed
PaymentRefunded
```

### Credit Events

```text
CreditTransactionRecorded
CreditPaymentRecorded
```

### Inventory Events

```text
InventoryReceived
InventoryConsumed
InventoryWasteRecorded
LowStockDetected
```

### Delivery Events

```text
DeliveryAssigned
DeliveryPickedUp
DeliveryCompleted
```

### Customer and Reporting Events

```text
ComplaintCreated
MonthlyStatementGenerated
```

These events will be refined during application architecture design.

---

## 16. Design Principles

The domain model should follow these principles:

1. **Explicit business concepts** — Business concepts should be represented clearly in the domain model.
2. **Clear aggregate ownership** — Each business rule should have a clearly defined owner.
3. **Protected invariants** — Aggregates must protect their own business invariants.
4. **Controlled cross-domain communication** — Aggregates should communicate through defined application or domain mechanisms.
5. **Minimal coupling between aggregates** — Aggregates should remain independently understandable and maintainable.
6. **Testable business rules** — Domain rules should be testable independently of infrastructure.
7. **Technology-independent domain logic** — Domain logic should remain independent of frameworks and infrastructure where practical.
8. **No direct database concerns inside the domain model** — Database persistence concerns should remain outside the domain model.

---

## 17. Current Status

**Version:** 0.1.0
**Status:** Draft
