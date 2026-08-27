# Database Design

**Version:** 0.1.0
**Status:** Draft
**Related:** SRS v1.0, ADR-001, Domain Model v0.1.0

---

## 1. Purpose

This document defines the initial relational database design for the AI-Powered Cafe Management System.

The design translates the approved domain model into a PostgreSQL data model while preserving business rules, data integrity, auditability, and future extensibility.

This document defines the conceptual and logical database model. It is not yet the implementation-specific Drizzle schema.

---

## 2. Database Technology

The initial database technology is:

```text
PostgreSQL
```

The application will access PostgreSQL through the project's selected database abstraction layer.

The exact implementation details will be defined after this design has been reviewed.

---

## 3. Design Principles

The database design should follow these principles:

1. Represent important business concepts explicitly.
2. Maintain referential integrity.
3. Prevent invalid states where database constraints can reasonably do so.
4. Keep transactional data consistent.
5. Avoid unnecessary duplication of authoritative data.
6. Preserve historical records required for business and audit purposes.
7. Support efficient access to frequently queried data.
8. Keep domain ownership clear.
9. Avoid premature optimization.
10. Allow future features without unnecessary schema redesign.

---

# 4. Core Entities

## 4.1 User

Represents an authenticated system account.

### Potential Attributes

```text
id
email
password_hash
status
created_at
updated_at
```

A User represents system identity and authentication.

---

## 4.2 Role

Represents a set of permissions associated with system access.

### Potential Attributes

```text
id
name
description
created_at
updated_at
```

---

## 4.3 Permission

Represents an individual authorization capability.

### Potential Attributes

```text
id
name
description
```

---

## 4.4 Customer

Represents a cafe customer.

### Potential Attributes

```text
id
user_id
name
phone
email
status
created_at
updated_at
```

A customer may have an associated user account depending on the selected customer experience.

---

## 4.5 Employee

Represents a cafe worker.

### Potential Attributes

```text
id
user_id
name
role_reference
employment_status
start_date
compensation_information
created_at
updated_at
```

Sensitive employee information must be access controlled.

---

# 5. Menu Domain

## 5.1 Category

Represents a logical menu category.

### Potential Attributes

```text
id
name
description
status
created_at
updated_at
```

---

## 5.2 Department

Represents a preparation or operational department.

### Examples

```text
Coffee / Hot Drinks
Food
Bakery
Juice
```

### Potential Attributes

```text
id
name
description
status
created_at
updated_at
```

---

## 5.3 Menu Item

Represents a product that can be offered to customers.

### Potential Attributes

```text
id
category_id
department_id
name
description
price
availability_status
created_at
updated_at
```

A menu item may reference a recipe where applicable.

---

# 6. Order Domain

## 6.1 Order

Represents a customer's order.

### Potential Attributes

```text
id
customer_id
order_type
status
subtotal
delivery_fee
discount_amount
total_amount
created_at
updated_at
confirmed_at
completed_at
cancelled_at
```

The total amount is authoritative on the server side.

---

## 6.2 Order Item

Represents one menu item within an order.

### Potential Attributes

```text
id
order_id
menu_item_id
quantity
unit_price
subtotal
special_instruction
created_at
updated_at
```

Historical order information should preserve the relevant price used when the order was created rather than relying exclusively on the current menu price.

---

# 7. Recipe and Ingredient Domain

## 7.1 Ingredient

Represents a material consumed in food or drink preparation.

### Potential Attributes

```text
id
name
unit_of_measure
status
created_at
updated_at
```

---

## 7.2 Recipe

Represents the composition of a menu item.

### Potential Attributes

```text
id
menu_item_id
name
version
status
created_at
updated_at
```

---

## 7.3 Recipe Item

Associates an ingredient with a recipe.

### Potential Attributes

```text
id
recipe_id
ingredient_id
quantity
unit_of_measure
```

---

# 8. Inventory Domain

## 8.1 Inventory Item

Represents tracked physical stock.

### Potential Attributes

```text
id
ingredient_id
department_id
current_quantity
unit_of_measure
reorder_level
status
created_at
updated_at
```

The implementation should carefully determine whether current quantity is stored directly, derived from movements, or maintained using both a transactional ledger and a current-state value.

---

## 8.2 Stock Movement

Represents a change in inventory.

### Potential Attributes

```text
id
inventory_item_id
movement_type
quantity
unit_cost
reference_type
reference_id
occurred_at
created_by
created_at
```

### Movement Types

```text
PURCHASE
CONSUMPTION
WASTE
ADJUSTMENT_IN
ADJUSTMENT_OUT
TRANSFER
```

All important inventory changes should be traceable to a stock movement.

---

## 8.3 Inventory Batch

Where required, inventory may be tracked by batch.

### Potential Attributes

```text
id
inventory_item_id
batch_reference
quantity
unit_cost
received_at
expiration_date
status
```

Batch tracking should be used where it provides operational value, particularly for perishable items.

---

## 8.4 Waste Record

Represents inventory that cannot be used.

### Potential Attributes

```text
id
inventory_item_id
quantity
estimated_cost
reason
department_id
recorded_by
recorded_at
created_at
```

---

# 9. Procurement Domain

## 9.1 Supplier

Represents an inventory supplier.

### Potential Attributes

```text
id
name
phone
email
address
status
created_at
updated_at
```

---

## 9.2 Purchase

Represents an inventory purchase.

### Potential Attributes

```text
id
supplier_id
purchase_reference
purchase_date
received_date
status
total_cost
created_at
updated_at
```

---

## 9.3 Purchase Item

Represents an item contained in a purchase.

### Potential Attributes

```text
id
purchase_id
inventory_item_id
quantity
unit_cost
total_cost
```

---

# 10. Payment Domain

## 10.1 Payment

Represents a payment transaction.

### Potential Attributes

```text
id
order_id
customer_id
payment_method
status
amount
provider_reference
initiated_at
confirmed_at
failed_at
created_at
updated_at
```

### Payment Status

Payment status may include:

```text
PENDING
PROCESSING
PAID
FAILED
CANCELLED
PARTIALLY_PAID
REFUNDED
```

---

## 10.2 Refund

Represents a refund transaction.

### Potential Attributes

```text
id
payment_id
amount
reason
status
provider_reference
created_by
created_at
updated_at
```

Refund records should not silently overwrite original payment records.

---

# 11. Customer Credit Domain

## 11.1 Credit Account

Represents an approved customer's deferred-payment account.

### Potential Attributes

```text
id
customer_id
credit_limit
status
current_balance
created_at
updated_at
```

---

## 11.2 Credit Transaction

Represents a transaction affecting the customer's credit balance.

### Potential Attributes

```text
id
credit_account_id
order_id
transaction_type
amount
reference
occurred_at
created_by
created_at
```

### Transaction Types

Transaction types may include:

```text
CHARGE
PAYMENT
ADJUSTMENT
```

The system should maintain an auditable relationship between balance changes and their underlying transactions.

---

# 12. Delivery Domain

## 12.1 Delivery

Represents fulfilment through delivery.

### Potential Attributes

```text
id
order_id
address
delivery_fee
status
provider_reference
created_at
updated_at
```

---

## 12.2 Delivery Assignment

Represents assignment of a delivery to a rider or provider.

### Potential Attributes

```text
id
delivery_id
rider_id
assigned_at
picked_up_at
delivered_at
status
```

---

# 13. Notification Domain

## 13.1 Notification

Represents a notification intended for a recipient.

### Potential Attributes

```text
id
recipient_user_id
type
channel
title
content
status
sent_at
read_at
created_at
```

---

## 13.2 Notification Preference

Represents a user's communication preferences.

### Potential Attributes

```text
id
user_id
channel
notification_type
enabled
created_at
updated_at
```

---

# 14. Customer Support Domain

## 14.1 Support Case

Represents a customer complaint, question, or support request.

### Potential Attributes

```text
id
customer_id
order_id
category
status
subject
description
assigned_to
created_at
updated_at
resolved_at
```

---

# 15. Asset Domain

## 15.1 Asset

Represents a reusable physical cafe resource.

### Potential Attributes

```text
id
name
category
quantity
purchase_date
purchase_cost
location
condition
serial_number
warranty_information
maintenance_information
status
created_at
updated_at
```

Assets are distinct from consumable inventory.

---

# 16. Audit Domain

## 16.1 Audit Event

Represents an important auditable system action.

### Potential Attributes

```text
id
actor_user_id
action
entity_type
entity_id
previous_state
new_state
request_id
occurred_at
```

Audit events should be append-oriented and protected from unauthorized modification.

---

# 17. Core Relationships

The primary relationships include:

```text
User
├── Customer
└── Employee

Category
└── Menu Item

Department
├── Menu Item
└── Inventory Item

Customer
├── Order
└── Credit Account

Order
├── Order Item
├── Payment
└── Delivery

Order Item
└── Menu Item

Menu Item
└── Recipe

Recipe
└── Recipe Item
    └── Ingredient

Ingredient
└── Inventory Item

Inventory Item
├── Stock Movement
├── Batch
└── Waste Record

Supplier
└── Purchase
    └── Purchase Item

Payment
└── Refund

Credit Account
└── Credit Transaction

Delivery
└── Delivery Assignment

User
└── Notification

Customer
└── Support Case

User
└── Audit Event
```

---

# 18. Data Integrity Rules

The database should enforce appropriate constraints.

### Examples

```text
Order must contain valid order items.

OrderItem quantity must be greater than zero.

Payment amount must be greater than zero where applicable.

Credit limit must not be negative.

Inventory quantities must use valid units.

Foreign-key references must point to existing records.

Unique business identifiers must not be duplicated.

Required fields must not accept NULL.

Important state values must be constrained.
```

Not every business rule should be implemented exclusively at the database layer. Business logic remains the responsibility of the application/domain layer, while the database should enforce fundamental integrity rules where appropriate.

---

# 19. Indexing Strategy

Indexes should be introduced based on access patterns.

### Likely Candidates

```text
Customer email / phone

Order customer_id

Order status

Order created_at

OrderItem order_id

Payment order_id

Payment provider_reference

CreditAccount customer_id

CreditTransaction credit_account_id

InventoryItem department_id

StockMovement inventory_item_id

StockMovement occurred_at

Notification recipient_user_id

Notification status

SupportCase customer_id
```

The final index set should be validated against actual query patterns and database performance.

---

# 20. Timestamp Strategy

Entities should use consistent timestamps where appropriate.

### Common Fields

```text
created_at
updated_at
```

Lifecycle-specific records may additionally include:

```text
confirmed_at
completed_at
cancelled_at
received_at
occurred_at
```

All stored timestamps should use a consistent timezone strategy.

---

# 21. Financial Data Principles

Financial records should preserve historical information.

For example, changing the current menu price should not retroactively change the price recorded on a historical order item.

Payments, refunds, credit transactions, and other important financial records should be append-oriented or otherwise auditable.

---

# 22. Inventory Data Principles

Inventory should be represented as a traceable movement history.

Conceptually:

```text
Opening Stock
+ Purchases
+ Adjustments In
- Consumption
- Waste
- Adjustments Out
- Transfers Out
+ Transfers In
= Closing Stock
```

The final implementation must define how current stock is maintained and reconciled with the movement ledger.

---

# 23. Security Considerations

Sensitive data should receive appropriate protection.

Potentially sensitive data includes:

- Authentication credentials
- Customer information
- Employee information
- Financial records
- Credit balances
- Payment references
- Audit records

Database access should follow least-privilege principles.

---

# 24. Soft Deletion and Historical Data

Soft deletion should only be introduced where it serves a clear business or audit purpose.

Financial, order, inventory, credit, and audit records generally require stronger historical preservation than ordinary configuration data.

The final deletion policy will be defined per entity during detailed schema design.

---

# 25. Current Status

**Version:** 0.1.0
**Status:** Draft

This document is a logical database design.
