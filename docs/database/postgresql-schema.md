# PostgreSQL Schema Specification

**Version:** 0.1.0  
**Status:** Draft  
**Related:** SRS v1.0, ADR-001, Domain Model v0.1.0, Database Design v0.1.0, ERD v0.1.0

---

# 1. Purpose

This document defines the detailed logical PostgreSQL schema for the
AI-Powered Cafe Management System.

The purpose is to translate the approved domain model and Entity
Relationship Diagram into a database-level specification before the
schema is implemented using Drizzle ORM.

This document defines:

- Tables
- Columns
- Data types
- Primary keys
- Foreign keys
- Constraints
- Unique rules
- Status values
- Indexes
- Delete behavior
- Timestamp conventions
- Historical-data requirements
- Transactional considerations

---

# 2. Database Principles

The database design shall follow these principles:

1. Maintain strong referential integrity.
2. Preserve important historical business records.
3. Use database constraints to prevent fundamental invalid states.
4. Keep business logic primarily in the application/domain layer.
5. Avoid unnecessary duplication of authoritative data.
6. Use transactions for multi-record business operations.
7. Design indexes from actual query patterns.
8. Preserve financial and audit history.
9. Use explicit relationships between related entities.
10. Avoid premature optimization.
11. Keep the schema extensible for future functionality.

---

# 3. Identifier Strategy

The initial design will use UUID identifiers for primary keys.

Example:

    id UUID PRIMARY KEY

UUIDs provide globally unique identifiers and are suitable for a
distributed-capable application architecture.

The exact PostgreSQL UUID generation mechanism will be selected during
implementation.

---

# 4. Timestamp Strategy

Timestamp fields should use timezone-aware PostgreSQL timestamps.

Preferred conceptual type:

    TIMESTAMPTZ

Common fields include:

    created_at
    updated_at

Lifecycle-specific timestamps may include:

    confirmed_at
    completed_at
    cancelled_at
    received_at
    occurred_at

The application and database shall follow one consistent timezone
strategy.

---

# 5. Users and Access Control

## 5.1 users

Represents authenticated system accounts.

| Column        | Type        | Constraints      |
| ------------- | ----------- | ---------------- |
| id            | UUID        | PK               |
| email         | VARCHAR     | UNIQUE, NOT NULL |
| password_hash | TEXT        | NOT NULL         |
| status        | VARCHAR     | NOT NULL         |
| created_at    | TIMESTAMPTZ | NOT NULL         |
| updated_at    | TIMESTAMPTZ | NOT NULL         |

Suggested status values:

    ACTIVE
    INACTIVE
    SUSPENDED

---

## 5.2 roles

Represents reusable authorization roles.

| Column      | Type        | Constraints      |
| ----------- | ----------- | ---------------- |
| id          | UUID        | PK               |
| name        | VARCHAR     | UNIQUE, NOT NULL |
| description | TEXT        | NULL             |
| created_at  | TIMESTAMPTZ | NOT NULL         |
| updated_at  | TIMESTAMPTZ | NOT NULL         |

---

## 5.3 permissions

Represents individual authorization capabilities.

| Column      | Type        | Constraints      |
| ----------- | ----------- | ---------------- |
| id          | UUID        | PK               |
| name        | VARCHAR     | UNIQUE, NOT NULL |
| description | TEXT        | NULL             |
| created_at  | TIMESTAMPTZ | NOT NULL         |

---

## 5.4 user_roles

Many-to-many relationship between users and roles.

| Column  | Type | Constraints       |
| ------- | ---- | ----------------- |
| user_id | UUID | PK, FK → users.id |
| role_id | UUID | PK, FK → roles.id |

Composite primary key:

    (user_id, role_id)

---

## 5.5 role_permissions

Many-to-many relationship between roles and permissions.

| Column        | Type | Constraints             |
| ------------- | ---- | ----------------------- |
| role_id       | UUID | PK, FK → roles.id       |
| permission_id | UUID | PK, FK → permissions.id |

Composite primary key:

    (role_id, permission_id)

---

# 6. Customers

## 6.1 customers

Represents cafe customers.

| Column     | Type        | Constraints                 |
| ---------- | ----------- | --------------------------- |
| id         | UUID        | PK                          |
| user_id    | UUID        | UNIQUE, FK → users.id, NULL |
| name       | VARCHAR     | NOT NULL                    |
| phone      | VARCHAR     | NULL                        |
| email      | VARCHAR     | NULL                        |
| status     | VARCHAR     | NOT NULL                    |
| created_at | TIMESTAMPTZ | NOT NULL                    |
| updated_at | TIMESTAMPTZ | NOT NULL                    |

Suggested status values:

    ACTIVE
    INACTIVE
    BLOCKED

---

# 7. Employees

## 7.1 employees

Represents cafe workers.

| Column                   | Type        | Constraints           |
| ------------------------ | ----------- | --------------------- |
| id                       | UUID        | PK                    |
| user_id                  | UUID        | UNIQUE, FK → users.id |
| name                     | VARCHAR     | NOT NULL              |
| employment_status        | VARCHAR     | NOT NULL              |
| start_date               | DATE        | NOT NULL              |
| compensation_information | JSONB       | NULL                  |
| created_at               | TIMESTAMPTZ | NOT NULL              |
| updated_at               | TIMESTAMPTZ | NOT NULL              |

Suggested employment statuses:

    ACTIVE
    INACTIVE
    ON_LEAVE
    TERMINATED

Sensitive employee data must be protected through authorization.

---

# 8. Menu

## 8.1 categories

| Column      | Type        | Constraints      |
| ----------- | ----------- | ---------------- |
| id          | UUID        | PK               |
| name        | VARCHAR     | UNIQUE, NOT NULL |
| description | TEXT        | NULL             |
| status      | VARCHAR     | NOT NULL         |
| created_at  | TIMESTAMPTZ | NOT NULL         |
| updated_at  | TIMESTAMPTZ | NOT NULL         |

---

## 8.2 departments

Represents preparation or operational departments.

| Column      | Type        | Constraints      |
| ----------- | ----------- | ---------------- |
| id          | UUID        | PK               |
| name        | VARCHAR     | UNIQUE, NOT NULL |
| description | TEXT        | NULL             |
| status      | VARCHAR     | NOT NULL         |
| created_at  | TIMESTAMPTZ | NOT NULL         |
| updated_at  | TIMESTAMPTZ | NOT NULL         |

Examples:

    COFFEE_HOT_DRINKS
    FOOD
    BAKERY
    JUICE

The database must not assume only two departments.

---

## 8.3 menu_items

| Column              | Type          | Constraints         |
| ------------------- | ------------- | ------------------- |
| id                  | UUID          | PK                  |
| category_id         | UUID          | FK → categories.id  |
| department_id       | UUID          | FK → departments.id |
| name                | VARCHAR       | NOT NULL            |
| description         | TEXT          | NULL                |
| price               | NUMERIC(12,2) | NOT NULL            |
| availability_status | VARCHAR       | NOT NULL            |
| created_at          | TIMESTAMPTZ   | NOT NULL            |
| updated_at          | TIMESTAMPTZ   | NOT NULL            |

Business constraints:

    price >= 0

Suggested availability values:

    AVAILABLE
    UNAVAILABLE
    ARCHIVED

---

# 9. Orders

## 9.1 orders

| Column          | Type          | Constraints             |
| --------------- | ------------- | ----------------------- |
| id              | UUID          | PK                      |
| customer_id     | UUID          | FK → customers.id, NULL |
| order_type      | VARCHAR       | NOT NULL                |
| status          | VARCHAR       | NOT NULL                |
| subtotal        | NUMERIC(12,2) | NOT NULL                |
| delivery_fee    | NUMERIC(12,2) | NOT NULL                |
| discount_amount | NUMERIC(12,2) | NOT NULL                |
| total_amount    | NUMERIC(12,2) | NOT NULL                |
| created_at      | TIMESTAMPTZ   | NOT NULL                |
| updated_at      | TIMESTAMPTZ   | NOT NULL                |
| confirmed_at    | TIMESTAMPTZ   | NULL                    |
| completed_at    | TIMESTAMPTZ   | NULL                    |
| cancelled_at    | TIMESTAMPTZ   | NULL                    |

Suggested order types:

    DINE_IN
    PICKUP
    DELIVERY

Suggested initial order statuses:

    CREATED
    CONFIRMED
    PREPARING
    READY
    COMPLETED
    CANCELLED

Financial amounts must not be negative unless explicitly permitted
by business rules.

---

## 9.2 order_items

| Column              | Type          | Constraints        |
| ------------------- | ------------- | ------------------ |
| id                  | UUID          | PK                 |
| order_id            | UUID          | FK → orders.id     |
| menu_item_id        | UUID          | FK → menu_items.id |
| quantity            | NUMERIC(10,3) | NOT NULL           |
| unit_price          | NUMERIC(12,2) | NOT NULL           |
| subtotal            | NUMERIC(12,2) | NOT NULL           |
| special_instruction | TEXT          | NULL               |
| created_at          | TIMESTAMPTZ   | NOT NULL           |
| updated_at          | TIMESTAMPTZ   | NOT NULL           |

Constraints:

    quantity > 0
    unit_price >= 0
    subtotal >= 0

The unit_price is stored to preserve the historical price applied
when the order was created.

---

# 10. Recipes and Ingredients

## 10.1 ingredients

| Column          | Type        | Constraints      |
| --------------- | ----------- | ---------------- |
| id              | UUID        | PK               |
| name            | VARCHAR     | UNIQUE, NOT NULL |
| unit_of_measure | VARCHAR     | NOT NULL         |
| status          | VARCHAR     | NOT NULL         |
| created_at      | TIMESTAMPTZ | NOT NULL         |
| updated_at      | TIMESTAMPTZ | NOT NULL         |

---

## 10.2 recipes

| Column       | Type        | Constraints        |
| ------------ | ----------- | ------------------ |
| id           | UUID        | PK                 |
| menu_item_id | UUID        | FK → menu_items.id |
| name         | VARCHAR     | NOT NULL           |
| version      | INTEGER     | NOT NULL           |
| status       | VARCHAR     | NOT NULL           |
| created_at   | TIMESTAMPTZ | NOT NULL           |
| updated_at   | TIMESTAMPTZ | NOT NULL           |

Potential uniqueness rule:

    (menu_item_id, version)

must be unique.

---

## 10.3 recipe_items

| Column          | Type          | Constraints             |
| --------------- | ------------- | ----------------------- |
| recipe_id       | UUID          | PK, FK → recipes.id     |
| ingredient_id   | UUID          | PK, FK → ingredients.id |
| quantity        | NUMERIC(12,3) | NOT NULL                |
| unit_of_measure | VARCHAR       | NOT NULL                |

Constraint:

    quantity > 0

Composite primary key:

    (recipe_id, ingredient_id)

---

# 11. Inventory

## 11.1 inventory_items

| Column           | Type          | Constraints                 |
| ---------------- | ------------- | --------------------------- |
| id               | UUID          | PK                          |
| ingredient_id    | UUID          | UNIQUE, FK → ingredients.id |
| department_id    | UUID          | FK → departments.id, NULL   |
| current_quantity | NUMERIC(14,3) | NOT NULL                    |
| unit_of_measure  | VARCHAR       | NOT NULL                    |
| reorder_level    | NUMERIC(14,3) | NOT NULL                    |
| status           | VARCHAR       | NOT NULL                    |
| created_at       | TIMESTAMPTZ   | NOT NULL                    |
| updated_at       | TIMESTAMPTZ   | NOT NULL                    |

Constraints:

    current_quantity >= 0
    reorder_level >= 0

The final decision on whether current_quantity is authoritative or
a maintained projection of stock movements will be made during
implementation.

---

## 11.2 stock_movements

| Column            | Type          | Constraints             |
| ----------------- | ------------- | ----------------------- |
| id                | UUID          | PK                      |
| inventory_item_id | UUID          | FK → inventory_items.id |
| movement_type     | VARCHAR       | NOT NULL                |
| quantity          | NUMERIC(14,3) | NOT NULL                |
| unit_cost         | NUMERIC(12,2) | NULL                    |
| reference_type    | VARCHAR       | NULL                    |
| reference_id      | UUID          | NULL                    |
| occurred_at       | TIMESTAMPTZ   | NOT NULL                |
| created_by        | UUID          | FK → users.id           |
| created_at        | TIMESTAMPTZ   | NOT NULL                |

Suggested movement types:

    PURCHASE
    CONSUMPTION
    WASTE
    ADJUSTMENT_IN
    ADJUSTMENT_OUT
    TRANSFER

Quantity must be greater than zero for individual movement records.

---

## 11.3 inventory_batches

| Column            | Type          | Constraints             |
| ----------------- | ------------- | ----------------------- |
| id                | UUID          | PK                      |
| inventory_item_id | UUID          | FK → inventory_items.id |
| batch_reference   | VARCHAR       | NULL                    |
| quantity          | NUMERIC(14,3) | NOT NULL                |
| unit_cost         | NUMERIC(12,2) | NULL                    |
| received_at       | TIMESTAMPTZ   | NOT NULL                |
| expiration_date   | DATE          | NULL                    |
| status            | VARCHAR       | NOT NULL                |

---

## 11.4 waste_records

| Column            | Type          | Constraints               |
| ----------------- | ------------- | ------------------------- |
| id                | UUID          | PK                        |
| inventory_item_id | UUID          | FK → inventory_items.id   |
| quantity          | NUMERIC(14,3) | NOT NULL                  |
| estimated_cost    | NUMERIC(12,2) | NULL                      |
| reason            | VARCHAR       | NOT NULL                  |
| department_id     | UUID          | FK → departments.id, NULL |
| recorded_by       | UUID          | FK → users.id             |
| recorded_at       | TIMESTAMPTZ   | NOT NULL                  |
| created_at        | TIMESTAMPTZ   | NOT NULL                  |

---

# 12. Procurement

## 12.1 suppliers

| Column     | Type        | Constraints |
| ---------- | ----------- | ----------- |
| id         | UUID        | PK          |
| name       | VARCHAR     | NOT NULL    |
| phone      | VARCHAR     | NULL        |
| email      | VARCHAR     | NULL        |
| address    | TEXT        | NULL        |
| status     | VARCHAR     | NOT NULL    |
| created_at | TIMESTAMPTZ | NOT NULL    |
| updated_at | TIMESTAMPTZ | NOT NULL    |

---

## 12.2 purchases

| Column             | Type          | Constraints       |
| ------------------ | ------------- | ----------------- |
| id                 | UUID          | PK                |
| supplier_id        | UUID          | FK → suppliers.id |
| purchase_reference | VARCHAR       | UNIQUE, NOT NULL  |
| purchase_date      | DATE          | NOT NULL          |
| received_date      | DATE          | NULL              |
| status             | VARCHAR       | NOT NULL          |
| total_cost         | NUMERIC(12,2) | NOT NULL          |
| created_at         | TIMESTAMPTZ   | NOT NULL          |
| updated_at         | TIMESTAMPTZ   | NOT NULL          |

---

## 12.3 purchase_items

| Column            | Type          | Constraints             |
| ----------------- | ------------- | ----------------------- |
| id                | UUID          | PK                      |
| purchase_id       | UUID          | FK → purchases.id       |
| inventory_item_id | UUID          | FK → inventory_items.id |
| quantity          | NUMERIC(14,3) | NOT NULL                |
| unit_cost         | NUMERIC(12,2) | NOT NULL                |
| total_cost        | NUMERIC(12,2) | NOT NULL                |

---

# 13. Payments

## 13.1 payments

| Column             | Type          | Constraints             |
| ------------------ | ------------- | ----------------------- |
| id                 | UUID          | PK                      |
| order_id           | UUID          | FK → orders.id          |
| customer_id        | UUID          | FK → customers.id, NULL |
| payment_method     | VARCHAR       | NOT NULL                |
| status             | VARCHAR       | NOT NULL                |
| amount             | NUMERIC(12,2) | NOT NULL                |
| provider_reference | VARCHAR       | NULL                    |
| initiated_at       | TIMESTAMPTZ   | NOT NULL                |
| confirmed_at       | TIMESTAMPTZ   | NULL                    |
| failed_at          | TIMESTAMPTZ   | NULL                    |
| created_at         | TIMESTAMPTZ   | NOT NULL                |
| updated_at         | TIMESTAMPTZ   | NOT NULL                |

Suggested methods:

    CASH
    TELEBIRR
    CBE
    CHAPA
    CUSTOMER_CREDIT

Suggested statuses:

    PENDING
    PROCESSING
    PAID
    FAILED
    CANCELLED
    PARTIALLY_PAID
    REFUNDED

Important uniqueness consideration:

Provider transaction references should be unique where a provider
reference exists.

---

## 13.2 refunds

| Column             | Type          | Constraints      |
| ------------------ | ------------- | ---------------- |
| id                 | UUID          | PK               |
| payment_id         | UUID          | FK → payments.id |
| amount             | NUMERIC(12,2) | NOT NULL         |
| reason             | TEXT          | NOT NULL         |
| status             | VARCHAR       | NOT NULL         |
| provider_reference | VARCHAR       | NULL             |
| created_by         | UUID          | FK → users.id    |
| created_at         | TIMESTAMPTZ   | NOT NULL         |
| updated_at         | TIMESTAMPTZ   | NOT NULL         |

Constraint:

    amount > 0

A refund must not exceed the refundable payment amount according to
application business rules.

---

# 14. Customer Credit

## 14.1 credit_accounts

| Column          | Type          | Constraints               |
| --------------- | ------------- | ------------------------- |
| id              | UUID          | PK                        |
| customer_id     | UUID          | UNIQUE, FK → customers.id |
| credit_limit    | NUMERIC(12,2) | NOT NULL                  |
| current_balance | NUMERIC(12,2) | NOT NULL                  |
| status          | VARCHAR       | NOT NULL                  |
| created_at      | TIMESTAMPTZ   | NOT NULL                  |
| updated_at      | TIMESTAMPTZ   | NOT NULL                  |

Constraints:

    credit_limit >= 0
    current_balance >= 0

---

## 14.2 credit_transactions

| Column            | Type          | Constraints             |
| ----------------- | ------------- | ----------------------- |
| id                | UUID          | PK                      |
| credit_account_id | UUID          | FK → credit_accounts.id |
| order_id          | UUID          | FK → orders.id, NULL    |
| payment_id        | UUID          | FK → payments.id, NULL  |
| transaction_type  | VARCHAR       | NOT NULL                |
| amount            | NUMERIC(12,2) | NOT NULL                |
| reference         | TEXT          | NULL                    |
| occurred_at       | TIMESTAMPTZ   | NOT NULL                |
| created_by        | UUID          | FK → users.id           |
| created_at        | TIMESTAMPTZ   | NOT NULL                |

Suggested transaction types:

    CHARGE
    PAYMENT
    ADJUSTMENT

---

# 15. Delivery

## 15.1 deliveries

| Column             | Type          | Constraints            |
| ------------------ | ------------- | ---------------------- |
| id                 | UUID          | PK                     |
| order_id           | UUID          | UNIQUE, FK → orders.id |
| address            | TEXT          | NOT NULL               |
| delivery_fee       | NUMERIC(12,2) | NOT NULL               |
| status             | VARCHAR       | NOT NULL               |
| provider_reference | VARCHAR       | NULL                   |
| created_at         | TIMESTAMPTZ   | NOT NULL               |
| updated_at         | TIMESTAMPTZ   | NOT NULL               |

Suggested statuses:

    READY_FOR_PICKUP
    ASSIGNED
    PICKED_UP
    OUT_FOR_DELIVERY
    DELIVERED
    FAILED

---

## 15.2 delivery_assignments

| Column       | Type        | Constraints        |
| ------------ | ----------- | ------------------ |
| id           | UUID        | PK                 |
| delivery_id  | UUID        | FK → deliveries.id |
| rider_id     | UUID        | FK → employees.id  |
| assigned_at  | TIMESTAMPTZ | NOT NULL           |
| picked_up_at | TIMESTAMPTZ | NULL               |
| delivered_at | TIMESTAMPTZ | NULL               |
| status       | VARCHAR     | NOT NULL           |

---

# 16. Notifications

## 16.1 notifications

| Column            | Type        | Constraints   |
| ----------------- | ----------- | ------------- |
| id                | UUID        | PK            |
| recipient_user_id | UUID        | FK → users.id |
| type              | VARCHAR     | NOT NULL      |
| channel           | VARCHAR     | NOT NULL      |
| title             | VARCHAR     | NOT NULL      |
| content           | TEXT        | NOT NULL      |
| status            | VARCHAR     | NOT NULL      |
| sent_at           | TIMESTAMPTZ | NULL          |
| read_at           | TIMESTAMPTZ | NULL          |
| created_at        | TIMESTAMPTZ | NOT NULL      |

---

## 16.2 notification_preferences

| Column            | Type        | Constraints   |
| ----------------- | ----------- | ------------- |
| id                | UUID        | PK            |
| user_id           | UUID        | FK → users.id |
| channel           | VARCHAR     | NOT NULL      |
| notification_type | VARCHAR     | NOT NULL      |
| enabled           | BOOLEAN     | NOT NULL      |
| created_at        | TIMESTAMPTZ | NOT NULL      |
| updated_at        | TIMESTAMPTZ | NOT NULL      |

Potential unique constraint:

    (user_id, channel, notification_type)

---

# 17. Customer Support

## 17.1 support_cases

| Column      | Type        | Constraints             |
| ----------- | ----------- | ----------------------- |
| id          | UUID        | PK                      |
| customer_id | UUID        | FK → customers.id       |
| order_id    | UUID        | FK → orders.id, NULL    |
| assigned_to | UUID        | FK → employees.id, NULL |
| category    | VARCHAR     | NOT NULL                |
| status      | VARCHAR     | NOT NULL                |
| subject     | VARCHAR     | NOT NULL                |
| description | TEXT        | NOT NULL                |
| created_at  | TIMESTAMPTZ | NOT NULL                |
| updated_at  | TIMESTAMPTZ | NOT NULL                |
| resolved_at | TIMESTAMPTZ | NULL                    |

Suggested statuses:

    OPEN
    IN_PROGRESS
    RESOLVED
    CLOSED

---

# 18. Assets

## 18.1 assets

| Column                  | Type          | Constraints |
| ----------------------- | ------------- | ----------- |
| id                      | UUID          | PK          |
| name                    | VARCHAR       | NOT NULL    |
| category                | VARCHAR       | NOT NULL    |
| quantity                | INTEGER       | NOT NULL    |
| purchase_date           | DATE          | NULL        |
| purchase_cost           | NUMERIC(12,2) | NULL        |
| location                | VARCHAR       | NULL        |
| condition               | VARCHAR       | NULL        |
| serial_number           | VARCHAR       | NULL        |
| warranty_information    | JSONB         | NULL        |
| maintenance_information | JSONB         | NULL        |
| status                  | VARCHAR       | NOT NULL    |
| created_at              | TIMESTAMPTZ   | NOT NULL    |
| updated_at              | TIMESTAMPTZ   | NOT NULL    |

---

# 19. Audit

## 19.1 audit_events

| Column         | Type        | Constraints         |
| -------------- | ----------- | ------------------- |
| id             | UUID        | PK                  |
| actor_user_id  | UUID        | FK → users.id, NULL |
| action         | VARCHAR     | NOT NULL            |
| entity_type    | VARCHAR     | NOT NULL            |
| entity_id      | UUID        | NULL                |
| previous_state | JSONB       | NULL                |
| new_state      | JSONB       | NULL                |
| request_id     | VARCHAR     | NULL                |
| occurred_at    | TIMESTAMPTZ | NOT NULL            |

Audit records should be append-oriented.

---

# 20. Core Foreign-Key Rules

The primary relationships include:

    customers.user_id
        → users.id

    employees.user_id
        → users.id

    menu_items.category_id
        → categories.id

    menu_items.department_id
        → departments.id

    orders.customer_id
        → customers.id

    order_items.order_id
        → orders.id

    order_items.menu_item_id
        → menu_items.id

    recipes.menu_item_id
        → menu_items.id

    recipe_items.recipe_id
        → recipes.id

    recipe_items.ingredient_id
        → ingredients.id

    inventory_items.ingredient_id
        → ingredients.id

    inventory_items.department_id
        → departments.id

    stock_movements.inventory_item_id
        → inventory_items.id

    payments.order_id
        → orders.id

    credit_accounts.customer_id
        → customers.id

    credit_transactions.credit_account_id
        → credit_accounts.id

    deliveries.order_id
        → orders.id

    delivery_assignments.delivery_id
        → deliveries.id

    delivery_assignments.rider_id
        → employees.id

---

# 21. Delete and Historical Data Policy

Financial and historical operational records should generally not be
physically deleted as a normal user action.

This includes:

    Orders
    Payments
    Refunds
    Credit Transactions
    Stock Movements
    Waste Records
    Audit Events

For configuration entities, deletion behavior may vary.

Possible alternatives include:

    Deactivate
    Archive
    Soft Delete

The final policy shall be defined per entity.

---

# 22. Indexing Strategy

The following indexes are likely candidates:

    users.email

    customers.user_id
    customers.phone

    orders.customer_id
    orders.status
    orders.created_at

    order_items.order_id

    menu_items.category_id
    menu_items.department_id
    menu_items.availability_status

    stock_movements.inventory_item_id
    stock_movements.occurred_at

    payments.order_id
    payments.provider_reference
    payments.status

    credit_accounts.customer_id

    credit_transactions.credit_account_id
    credit_transactions.occurred_at

    deliveries.order_id
    deliveries.status

    notifications.recipient_user_id
    notifications.status
    notifications.created_at

    support_cases.customer_id
    support_cases.status

    audit_events.actor_user_id
    audit_events.entity_type
    audit_events.entity_id
    audit_events.occurred_at

Indexes will be validated against real query patterns and performance
measurements.

---

# 23. Transaction Boundaries

The application should use database transactions for operations that
must remain atomic.

Examples:

## Order Creation

    Create Order
        +
    Create Order Items
        +
    Create required payment/credit record

## Inventory Receipt

    Create Purchase
        +
    Create Purchase Items
        +
    Record Stock Movements
        +
    Update Inventory State

## Credit Payment

    Record Payment
        +
    Record Credit Transaction
        +
    Update Credit Balance

The exact transaction boundaries will be finalized during application
design.

---

# 24. Data Integrity Strategy

Database constraints should protect fundamental invariants such as:

    Required references exist.

    Quantities cannot be invalid.

    Financial amounts cannot be invalid.

    Unique identifiers cannot be duplicated.

    Relationship records cannot reference missing parents.

    Important status values are restricted to supported states.

Application/domain logic remains responsible for higher-level business
rules.

---

# 25. Schema Evolution and Migrations

All database structure changes shall be managed through versioned
migrations.

Direct manual modification of the production schema should not be the
normal deployment process.

Every migration should be:

- Reviewable.
- Version controlled.
- Reproducible.
- Tested before production use.

---

# 26. Future Considerations

The schema should remain extensible for future features including:

- Multiple cafe branches.
- Loyalty programs.
- Advanced payroll.
- More payment providers.
- More delivery providers.
- Additional preparation departments.
- Advanced AI data requirements.
- Expanded analytics.

Future requirements must not be allowed to compromise current data
integrity.

---

# 27. Current Status

**Version:** 0.1.0

**Status:** Draft

This specification is a logical PostgreSQL schema design.
