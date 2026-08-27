# Domain Model

**Version:** 0.1.0  
**Status:** Draft  
**Related:** SRS v1.0, ADR-001

---

## 1. Purpose

This document defines the initial domain model of the AI-Powered Cafe Management System.

The purpose is to identify the major business domains, their responsibilities, core business concepts, relationships, and ownership before database implementation.

This document represents the business model of the system rather than its physical database schema.

---

## 2. Domain Overview

The system is organized around the following major business domains:

```text
Customer Management
Menu Management
Order Management
Kitchen Operations
Inventory Management
Procurement
Payment Management
Customer Credit
Staff Management
Delivery
Notifications
Customer Support
Analytics
Asset Management
AI Platform
Security & Audit
3. Domain Map
                         CAFE MANAGEMENT SYSTEM
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
      Customer                Operations              Management
          |                       |                       |
          |                 +-----+------+         +------+------+
          |                 |            |         |             |
          v                 v            v         v             v
      Ordering           Kitchen     Inventory   Staff        Analytics
          |                 |            |
          v                 v            v
       Payment          Departments   Procurement
          |
          v
      Credit

                    Cross-Cutting / Platform
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
         Notifications       AI          Security/Audit
4. Customer Management
Responsibility

The Customer domain manages customer identity, profile information, account relationships, and customer-facing history.

Core Concepts
Customer
Customer Profile
Customer Account
Customer Preferences
Responsibilities
Maintain customer information.
Associate customers with orders.
Provide customer history.
Support customer preferences.
Connect customer accounts with credit and payment information where appropriate.
Does Not Own

The Customer domain does not own:

Order preparation.
Inventory.
Payment-provider processing.
Kitchen operations.
5. Menu Management
Responsibility

The Menu domain manages products that can be offered to customers.

Core Concepts
Menu
Category
Menu Item
Price
Availability
Preparation Department
Recipe reference
Responsibilities
Create and manage menu items.
Organize items into categories.
Maintain customer-facing prices.
Control availability.
Associate menu items with preparation departments.
Associate menu items with recipes where applicable.
Does Not Own

The Menu domain does not own:

Actual ingredient stock.
Payment transactions.
Order preparation.
Customer balances.
6. Order Management
Responsibility

The Order domain manages the lifecycle of customer orders.

Core Concepts
Order
Order Item
Order Status
Order Type
Special Instruction
Fulfilment Information
Responsibilities
Create orders.
Add and remove order items.
Validate order contents.
Calculate authoritative order totals.
Manage order lifecycle.
Manage order cancellation according to business rules.
Associate orders with customers where applicable.
Publish relevant order events.
Order Lifecycle
CREATED
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY
   ↓
COMPLETED

The exact lifecycle will be refined during application and workflow design.

Important Boundary

Order Management owns the order lifecycle.

It does not directly own:

Payment processing.
Inventory records.
Kitchen implementation.
Delivery execution.

Those are separate domains.

7. Kitchen Operations
Responsibility

The Kitchen domain manages preparation of ordered products.

Core Concepts
Kitchen Task
Preparation Department
Kitchen Station
Preparation Status
Preparation Instruction
Responsibilities
Receive preparation tasks from orders.
Route items to the correct department.
Display active preparation work.
Track preparation status.
Display special instructions.
Report preparation exceptions.
Notify relevant users when items are ready.
Departments

The initial cafe may include:

Coffee / Hot Drinks
Food

The model should support additional departments in the future.

8. Inventory Management
Responsibility

The Inventory domain manages physical stock and stock movements.

Core Concepts
Inventory Item
Ingredient
Stock Level
Stock Movement
Batch
Expiration
Waste
Inventory Location
Stock Movement Types
PURCHASE
CONSUMPTION
WASTE
ADJUSTMENT_IN
ADJUSTMENT_OUT
TRANSFER
Responsibilities
Track current stock.
Record stock movements.
Track inventory consumption.
Track waste.
Monitor low-stock conditions.
Track expiration information where applicable.
Support inventory valuation.
Maintain inventory history.
Important Principle

Inventory quantity should not be changed without an appropriate recorded stock movement.

9. Recipe Management
Responsibility

Recipes define the ingredients or materials required to produce a menu item.

Core Concepts
Recipe
Recipe Item
Ingredient
Quantity
Unit of Measurement
Example
Cappuccino
    |
    +-- Coffee Beans: 18 g
    +-- Milk: 150 ml
Relationship
Menu Item
    ↓
Recipe
    ↓
Ingredients
    ↓
Inventory

Recipe definitions support inventory consumption and cost analysis.

10. Procurement
Responsibility

The Procurement domain manages supplier and purchasing activities.

Core Concepts
Supplier
Purchase
Purchase Item
Purchase Cost
Received Quantity
Receipt Date
Responsibilities
Manage suppliers.
Record purchases.
Record received stock.
Track purchase costs.
Maintain supplier purchase history.
11. Payment Management
Responsibility

The Payment domain manages financial transactions associated with orders.

Core Concepts
Payment
Payment Method
Payment Status
Transaction Reference
Refund
Supported Methods

Potential methods include:

CASH
TELEBIRR
CBE
CHAPA
CUSTOMER_CREDIT
Payment Status
PENDING
PROCESSING
PAID
FAILED
CANCELLED
PARTIALLY_PAID
REFUNDED
Important Boundary

Payment Management owns payment transactions.

It does not own:

Order business rules.
Customer credit policy.
Inventory.
Menu pricing.
12. Customer Credit
Responsibility

The Customer Credit domain manages approved deferred-payment arrangements.

Core Concepts
Credit Account
Credit Limit
Credit Transaction
Outstanding Balance
Statement
Credit Payment
Workflow
Customer
    ↓
Approved Credit Account
    ↓
Daily Consumption
    ↓
Credit Transaction
    ↓
Outstanding Balance
    ↓
Monthly Statement
    ↓
Payment
    ↓
Balance Updated
Important Rules
Credit must be explicitly authorized.
Credit usage must respect the configured limit.
Credit transactions must be auditable.
Payments may reduce the outstanding balance.
Adjustments require authorization.
13. Staff Management
Responsibility

The Staff domain manages cafe employees and their system access.

Core Concepts
Employee
Role
Permission
Employment Status
Start Date
Compensation Information
Example Roles
MANAGER
CASHIER
WAITER
KITCHEN_STAFF
COOK
DELIVERY_RIDER
ADMINISTRATOR

Role and permission definitions will be refined during security design.

14. Delivery
Responsibility

The Delivery domain manages delivery fulfilment where applicable.

Core Concepts
Delivery
Delivery Address
Delivery Assignment
Delivery Rider
Delivery Status
Delivery Provider
Delivery Status
READY_FOR_PICKUP
ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
FAILED

Delivery may be provided by cafe staff or an external delivery provider.

15. Notification Management
Responsibility

The Notification domain manages communication with customers and staff.

Core Concepts
Notification
Notification Template
Notification Preference
Notification Channel
Delivery Status
Potential Channels
IN_APP
EMAIL
SMS
WHATSAPP
TELEGRAM
Trigger Examples
OrderCreated
PaymentConfirmed
OrderReady
OrderDelivered
LowStockDetected
ComplaintCreated
MonthlyStatementGenerated

The notification domain should consume business events rather than embedding notification logic throughout unrelated domains.

16. Customer Support
Responsibility

The Support domain manages customer questions, complaints, and feedback.

Core Concepts
Support Case
Complaint
Category
Status
Assignment
Resolution
Support Lifecycle
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED

Support cases may be associated with customers and orders.

17. Analytics and Reporting
Responsibility

The Analytics domain provides aggregated business information for authorized users.

Core Concepts
Sales Metrics
Order Metrics
Inventory Metrics
Waste Metrics
Payment Metrics
Customer Credit Metrics
Department Metrics

Analytics should consume authoritative business data and should not become the owner of transactional records.

18. Asset Management
Responsibility

The Asset domain manages reusable physical resources belonging to the cafe.

Core Concepts
Asset
Asset Category
Location
Condition
Warranty
Maintenance
Status
Examples
Coffee Machines
Ovens
Refrigerators
Tables
Chairs
POS Equipment
Printers

Assets are distinct from consumable inventory.

19. AI Platform
Responsibility

The AI domain provides controlled AI-assisted capabilities.

Candidate Capabilities
Ordering Assistant
Customer Support Assistant
Manager Assistant
Inventory Assistant
Insights Assistant
Email Assistant
AI Orchestrator
Important Boundary

AI does not own transactional business data.

The AI platform accesses business capabilities through authorized application tools/interfaces.

AI Agent
    ↓
Authorized Tool
    ↓
Application Use Case
    ↓
Domain Rules
    ↓
Infrastructure
    ↓
Database

AI must not bypass authorization or business rules.

20. Security and Audit
Responsibility

Security and Audit provide cross-cutting controls for protected operations.

Core Concepts
User Identity
Role
Permission
Audit Event
Security Event
Audit Targets

Important operations should be traceable, including:

Payment changes
Refunds
Credit adjustments
Inventory adjustments
Waste records
Role changes
Administrative changes
21. Core Domain Relationships
21.1 Customer and Order
Customer
   |
   +----< Order

A customer may place multiple orders.

21.2 Order and Order Item
Order
   |
   +----< Order Item

An order contains one or more order items.

21.3 Order Item and Menu Item
Order Item
   |
   +----> Menu Item

Each order item references a menu item.

21.4 Menu Item and Recipe
Menu Item
   |
   +----> Recipe

A menu item may have a recipe.

21.5 Recipe and Ingredient
Recipe
   |
   +----< Recipe Item >---- Ingredient

A recipe consists of required ingredients/materials.

21.6 Inventory
Ingredient
    ↓
Inventory Item
    ↓
Stock Movements

Stock movements represent changes to physical inventory.

21.7 Order and Payment
Order
   |
   +----< Payment

An order may have one or more payment transactions depending on business rules.

21.8 Order and Kitchen
Order
   ↓
Order Item
   ↓
Preparation Department
   ↓
Kitchen Task
21.9 Customer and Credit
Customer
   |
   +---- Credit Account
             |
             +----< Credit Transaction
21.10 Order and Delivery
Order
   ↓
Delivery
   ↓
Delivery Assignment

Only applicable to delivery orders.

22. Domain Ownership Principles

Each domain should own its own business concepts and rules.

Examples:

Orders       → Order lifecycle
Payments     → Payment lifecycle
Inventory    → Stock lifecycle
Kitchen      → Preparation lifecycle
Credit       → Customer credit lifecycle
Delivery     → Delivery lifecycle

A domain should not directly modify another domain's internal state.

Cross-domain operations should use appropriate interfaces, application services, or domain/application events.

23. Domain Events

Potential domain/application events include:

CustomerRegistered
OrderCreated
OrderConfirmed
OrderCancelled
OrderReady
OrderCompleted
PaymentInitiated
PaymentConfirmed
PaymentFailed
CreditTransactionRecorded
InventoryReceived
InventoryConsumed
InventoryWasteRecorded
LowStockDetected
DeliveryAssigned
DeliveryPickedUp
DeliveryCompleted
ComplaintCreated
MonthlyStatementGenerated

Events will be refined during application architecture design.

24. Domain Model Principles

The domain model shall follow these principles:

Model real business concepts explicitly.
Keep each domain responsible for its own business rules.
Avoid unnecessary coupling between domains.
Keep external technology details outside core business rules.
Make important business invariants explicit.
Prefer clear domain language over technical terminology.
Do not design database tables before the business model is understood.
Allow future domains or capabilities to be introduced without unnecessary restructuring.
25. Current Status

Version: 0.1.0
Status: Draft

This model is an initial domain representation and will be refined before database schema design.
```
