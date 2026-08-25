# AI-Powered Cafe Management System

**Software Requirements Specification (SRS)**

| Field                  | Value                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| **Product**            | AI-Powered Cafe Management System                                |
| **Document**           | Software Requirements Specification                              |
| **Version**            | 1.0.0                                                            |
| **Status**             | Proposed for Approval                                            |
| **Date**               | 2026-08-25                                                       |
| **Integration Branch** | `dev`                                                            |
| **Purpose**            | Final refined requirements candidate and implementation baseline |

---

## Document Control

This document defines the product and engineering requirements for the **AI-Powered Cafe Management System**.

Version **1.0.0** represents the final refined requirements candidate following requirements discovery, refinement, and review. It is intended to become the baseline for architecture and implementation once formally approved by the project owner or designated stakeholders.

This document guides:

- Domain modeling
- Architecture
- Database design
- API design
- UI/UX design
- Implementation
- Testing
- Deployment
- Operations
- Future product evolution

### Revision History

| Version | Date       | Status                | Description                                                                                 |
| ------- | ---------- | --------------------- | ------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-25 | Draft                 | Initial requirements draft                                                                  |
| 0.2.0   | 2026-08-25 | Refined Draft         | Formalized requirements, priorities, business rules, AI, notifications, security, and scope |
| 1.0.0   | 2026-08-25 | Proposed for Approval | Final refined requirements candidate                                                        |

> **Approval note:** Version 1.0.0 should be changed to **Approved** only after formal project-owner/stakeholder approval.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Product Vision and Goals](#2-product-vision-and-goals)
3. [Stakeholders and Actors](#3-stakeholders-and-actors)
4. [System Scope](#4-system-scope)
5. [Functional Requirements](#5-functional-requirements)
   - [5.1 Authentication and Access Control](#51-authentication-and-access-control)
   - [5.2 Customer Management](#52-customer-management)
   - [5.3 Menu Management](#53-menu-management)
   - [5.4 Ordering](#54-ordering)
   - [5.5 Kitchen and Department Operations](#55-kitchen-and-department-operations)
   - [5.6 Payments](#56-payments)
   - [5.7 Customer Credit and Monthly Accounts](#57-customer-credit-and-monthly-accounts)
   - [5.8 Inventory](#58-inventory)
   - [5.9 Recipes and Consumption](#59-recipes-and-consumption)
   - [5.10 Waste](#510-waste)
   - [5.11 Procurement and Suppliers](#511-procurement-and-suppliers)
   - [5.12 Staff Management](#512-staff-management)
   - [5.13 Delivery](#513-delivery)
   - [5.14 Notifications](#514-notifications)
   - [5.15 Customer Support and Complaints](#515-customer-support-and-complaints)
   - [5.16 Analytics and Reporting](#516-analytics-and-reporting)
   - [5.17 Asset Management](#517-asset-management)
   - [5.18 AI Capabilities](#518-ai-capabilities)
   - [5.19 Manager Dashboard](#519-manager-dashboard)

6. [Business Rules](#6-business-rules)
7. [AI Requirements and Guardrails](#7-ai-requirements-and-guardrails)
8. [Notification and Communication Requirements](#8-notification-and-communication-requirements)
9. [External Integration Requirements](#9-external-integration-requirements)
10. [Data Requirements](#10-data-requirements)
11. [Security and Authorization Requirements](#11-security-and-authorization-requirements)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Reliability, Backup, and Recovery](#13-reliability-backup-and-recovery)
14. [Auditability](#14-auditability)
15. [MVP and Release Scope](#15-mvp-and-release-scope)
16. [Future Scope](#16-future-scope)
17. [Constraints and Assumptions](#17-constraints-and-assumptions)
18. [Architectural Direction](#18-architectural-direction)
19. [Requirements Traceability](#19-requirements-traceability)
20. [SRS Approval Criteria](#20-srs-approval-criteria)
21. [Appendix A — Initial Domain Map](#appendix-a--initial-domain-map)
22. [Appendix B — Requirement Priority Convention](#appendix-b--requirement-priority-convention)
23. [Appendix C — Change Control](#appendix-c--change-control)

---

# 1. Introduction

## 1.1 Purpose

The AI-Powered Cafe Management System is a centralized digital platform for managing customer ordering, cafe operations, kitchen workflows, inventory, payments, customer credit, staff, delivery, notifications, customer support, analytics, and AI-assisted business activities.

The purpose of this SRS is to establish a clear, testable, and traceable requirements baseline before detailed architecture and implementation begin.

The SRS will guide:

- Domain modeling
- Architecture
- Database design
- API design
- UI/UX design
- Implementation
- Testing
- Deployment
- Operations
- Future product evolution

## 1.2 Intended Audience

This document is intended for:

- Product stakeholders
- Software engineers
- Backend engineers
- Frontend engineers
- AI engineers
- Database engineers
- QA engineers
- DevOps engineers
- System architects
- Project maintainers

## 1.3 Definitions

| Term               | Definition                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **KDS**            | Kitchen Display System                                                                                     |
| **AI Agent**       | An AI-powered software capability that reasons over an allowed task and interacts through authorized tools |
| **RAG**            | Retrieval-Augmented Generation                                                                             |
| **RBAC**           | Role-Based Access Control                                                                                  |
| **MVP**            | Minimum Viable Product                                                                                     |
| **Menu Item**      | A product that can be ordered by a customer                                                                |
| **Ingredient**     | A material used to prepare a menu item                                                                     |
| **Stock Movement** | A recorded change in inventory                                                                             |
| **Credit Account** | An approved customer account used for deferred payment                                                     |
| **Fulfilment**     | The method used to provide an order, such as dine-in, pickup, or delivery                                  |

---

# 2. Product Vision and Goals

## 2.1 Product Vision

> **Provide a reliable, secure, modern, and extensible cafe management platform that connects customers, employees, kitchen operations, inventory, payments, communication, and management in one system while using AI only where it provides meaningful operational or customer value.**

The platform should replace fragile paper-based and disconnected workflows with reliable digital processes while remaining flexible enough to support future business and technology changes.

## 2.2 Primary Goals

The system shall aim to:

1. Digitize core cafe operations.
2. Allow customers to order remotely.
3. Reduce order-entry and communication errors.
4. Improve kitchen visibility and coordination.
5. Provide accurate inventory tracking.
6. Digitize customer monthly-credit management.
7. Centralize payment and transaction records.
8. Provide reliable customer and staff notifications.
9. Give managers actionable operational information.
10. Use AI for natural-language interaction, assistance, recommendations, and insights.
11. Protect critical business data from loss and unauthorized access.
12. Provide an extensible foundation for future capabilities.

---

# 3. Stakeholders and Actors

## 3.1 Customer

A customer may:

- Browse the menu
- Search or filter menu items
- Place orders
- Place orders through an AI-assisted experience
- Receive recommendations
- Choose available fulfilment options
- Make payments using supported methods
- Track order status
- View order history
- View applicable account and payment history
- Use an approved credit account
- Submit complaints and feedback
- Receive notifications

## 3.2 Cashier

A cashier may:

- Create orders
- Modify orders while modification is allowed
- Process or record authorized payments
- Issue receipts
- Handle customer-credit transactions when permitted
- View relevant order status
- Perform authorized cancellation or refund workflows
- Manage cashier shift information

## 3.3 Waiter

A waiter may:

- Create dine-in or customer orders
- Associate orders with tables where table management is enabled
- Send orders to preparation departments
- View order status
- Support customer-facing service
- Record relevant customer requests

## 3.4 Kitchen Staff / Cook

Kitchen staff may:

- Receive assigned preparation tasks
- View order items and quantities
- View preparation notes
- Accept or start preparation
- Mark items or orders as ready
- Report preparation problems or unavailable items

## 3.5 Manager

The manager may:

- Manage menu items
- Manage inventory
- Manage suppliers and procurement records
- Manage customers and customer credit
- Manage staff
- Access operational financial information
- Review reports and analytics
- Manage complaints and escalations
- Manage operational configuration
- Use AI-assisted management capabilities

## 3.6 Owner

The owner may:

- Review business performance
- Review financial summaries
- Review operational analytics
- Oversee managers and staff
- Access strategic insights

## 3.7 Delivery Rider / Delivery Provider

A delivery rider or integrated delivery provider may:

- Receive delivery assignments
- View relevant delivery information
- Update delivery status

## 3.8 System Administrator

An authorized system administrator may manage:

- System configuration
- User access
- Roles and permissions
- External integrations
- Technical settings

## 3.9 AI Agents

AI capabilities are controlled system components rather than unrestricted users. AI agents shall operate only through authorized capabilities and data-access paths.

---

# 4. System Scope

## 4.1 In Scope

The product scope includes:

- Authentication and authorization
- Customer management
- Menu management
- Customer and staff ordering
- Kitchen operations
- Department/station routing
- Payment management
- Customer credit
- Inventory management
- Waste management
- Procurement records
- Staff management
- Delivery and fulfilment
- Notifications
- Customer support
- Analytics and reporting
- AI-assisted capabilities
- Auditability
- Data backup and recovery
- Security controls

## 4.2 Initial Non-Goals

The initial release is not intended to be:

- A full accounting system
- A complete enterprise payroll system
- A full ERP
- A multi-country tax platform
- A full multi-branch enterprise platform
- A fully autonomous financial decision-maker

These may be considered later through separate requirements work.

---

# 5. Functional Requirements

## 5.1 Authentication and Access Control

### FR-AUTH-001 — Secure Authentication

**Priority:** MUST

The system shall authenticate users before allowing access to protected operations.

**Acceptance Criteria:**

- Protected endpoints require authentication.
- Invalid credentials are rejected.
- Authentication failures do not expose sensitive credential information.

### FR-AUTH-002 — Role-Based Authorization

**Priority:** MUST

The system shall enforce permissions based on user roles and/or explicit permissions.

**Acceptance Criteria:**

- Users cannot perform operations outside their permissions.
- Administrative operations require elevated authorization.
- Authorization is enforced server-side.

### FR-AUTH-003 — Least Privilege

**Priority:** MUST

Users shall receive only the permissions necessary for their responsibilities.

---

## 5.2 Customer Management

### FR-CUS-001 — Customer Account

**Priority:** MUST

The system shall support customer accounts where required by the chosen ordering workflow.

### FR-CUS-002 — Customer Profile

**Priority:** MUST

The system shall maintain relevant customer profile information.

### FR-CUS-003 — Customer Order History

**Priority:** MUST

An authenticated customer shall be able to view their completed and active order history.

### FR-CUS-004 — Customer Payment History

**Priority:** SHOULD

The system should allow customers to view their payment history where applicable.

### FR-CUS-005 — Customer Credit Account

**Priority:** MUST

The system shall support approved customer credit accounts.

---

## 5.3 Menu Management

### FR-MENU-001 — Menu Item Management

**Priority:** MUST

Authorized staff shall be able to create, update, activate, deactivate, and manage menu items.

### FR-MENU-002 — Menu Categories

**Priority:** MUST

The system shall support menu categories.

### FR-MENU-003 — Menu Availability

**Priority:** MUST

Authorized staff shall be able to mark menu items as available or unavailable.

### FR-MENU-004 — Preparation Department Assignment

**Priority:** MUST

Each preparation-relevant menu item shall be associated with a configured department or station.

### FR-MENU-005 — Customer Menu

**Priority:** MUST

Customers shall be able to view currently available menu items and their current prices.

---

## 5.4 Ordering

### FR-ORD-001 — Create Order

**Priority:** MUST

The system shall allow an authorized customer, cashier, or waiter to create an order containing one or more available menu items.

### FR-ORD-002 — Order Validation

**Priority:** MUST

The system shall validate:

- Item availability
- Quantity
- Required options/modifiers where applicable
- Customer and fulfilment information where required

### FR-ORD-003 — Server-Side Order Total

**Priority:** MUST

The server shall calculate and store the authoritative order total.

### FR-ORD-004 — Order Modification

**Priority:** MUST

Authorized users shall be able to modify an order only while its current state permits modification.

### FR-ORD-005 — Order Cancellation

**Priority:** MUST

The system shall support controlled order cancellation based on order state and authorization.

### FR-ORD-006 — Special Instructions

**Priority:** MUST

The system shall allow authorized users to attach preparation instructions to an order or order item where applicable.

### FR-ORD-007 — Fulfilment Type

**Priority:** MUST

The system shall support applicable fulfilment types, including:

- Dine-in
- Pickup
- Delivery

### FR-ORD-008 — Order History

**Priority:** MUST

The system shall maintain a durable history of orders and their status changes.

### FR-ORD-009 — Duplicate-Request Protection

**Priority:** MUST

The system shall protect critical order-creation operations against accidental duplicate requests caused by retries or repeated submissions.

---

## 5.5 Kitchen and Department Operations

### FR-KDS-001 — Department Queue

**Priority:** MUST

The system shall provide a digital preparation queue for each configured preparation department.

### FR-KDS-002 — Department Routing

**Priority:** MUST

Order items shall be routed to the department or station associated with the menu item.

### FR-KDS-003 — Preparation Status

**Priority:** MUST

Authorized kitchen users shall be able to update preparation status.

Supported states shall include, where applicable:

```text
NEW
ACCEPTED
PREPARING
READY
COMPLETED
```

### FR-KDS-004 — Preparation Information

**Priority:** MUST

The KDS shall display the information required to prepare an order, including:

- Order number
- Items
- Quantities
- Preparation instructions
- Order type
- Received time
- Current preparation state

### FR-KDS-005 — Real-Time New Order Visibility

**Priority:** SHOULD

New orders should appear to the correct preparation department without requiring a manual page refresh.

### FR-KDS-006 — Unavailable Item Reporting

**Priority:** SHOULD

Kitchen staff should be able to report when an order item cannot be prepared.

### FR-KDS-007 — Kitchen Workload

**Priority:** SHOULD

The system should show the number of active, waiting, and preparing orders for authorized kitchen and management users.

---

## 5.6 Payments

### FR-PAY-001 — Payment Methods

**Priority:** MUST

The payment subsystem shall support configurable payment methods.

The initial target methods are:

- Cash
- Telebirr
- CBE
- Chapa
- Customer Credit

Additional methods may be added later.

> **MVP clarification:** Cash and Customer Credit are core MVP payment methods. A single supported digital payment provider should be integrated for the initial MVP; additional providers may be added incrementally after the core payment workflow is stable.

### FR-PAY-002 — Payment Lifecycle

**Priority:** MUST

The system shall support payment states including:

```text
PENDING
PROCESSING
PAID
FAILED
CANCELLED
PARTIALLY_PAID
REFUNDED
```

### FR-PAY-003 — Provider Transaction Reference

**Priority:** MUST

Where a payment provider supplies a transaction reference, the system shall store it.

### FR-PAY-004 — Payment Verification

**Priority:** MUST

Where supported by the provider, payment completion shall be verified using provider-side verification or webhook mechanisms.

### FR-PAY-005 — Manual Payment Evidence

**Priority:** SHOULD

The system may support manual payment evidence for exceptional cases.

Uploaded screenshots shall not by themselves cause a transaction to be considered verified.

### FR-PAY-006 — Receipt

**Priority:** MUST

The system shall provide a receipt or equivalent transaction record for completed payments.

### FR-PAY-007 — Refund Workflow

**Priority:** SHOULD

The system should support an authorized refund workflow.

---

## 5.7 Customer Credit and Monthly Accounts

### FR-CREDIT-001 — Credit Eligibility

**Priority:** MUST

Only approved customers shall be allowed to use credit-based purchasing.

### FR-CREDIT-002 — Credit Limit

**Priority:** MUST

The system shall support a configurable credit limit per eligible customer.

### FR-CREDIT-003 — Credit Transaction

**Priority:** MUST

The system shall record every transaction that increases a customer's outstanding credit balance.

### FR-CREDIT-004 — Running Balance

**Priority:** MUST

The system shall maintain the customer's current outstanding balance.

### FR-CREDIT-005 — Monthly Statement

**Priority:** MUST

The system shall generate a monthly statement containing the customer's applicable credit transactions, payments, and outstanding balance.

### FR-CREDIT-006 — Partial Payment

**Priority:** SHOULD

The system should support partial payments against an outstanding balance.

### FR-CREDIT-007 — Credit Adjustment

**Priority:** SHOULD

Authorized staff shall be able to make controlled credit adjustments with an audit record and reason.

---

## 5.8 Inventory

### FR-INV-001 — Inventory Item

**Priority:** MUST

Authorized staff shall be able to create and manage inventory items.

### FR-INV-002 — Quantity and Unit

**Priority:** MUST

Each inventory item shall have a quantity and unit of measurement appropriate to the item.

### FR-INV-003 — Stock Movement

**Priority:** MUST

The system shall record inventory changes as stock movements.

Supported movement types shall include:

```text
PURCHASE
CONSUMPTION
WASTE
ADJUSTMENT_IN
ADJUSTMENT_OUT
TRANSFER
```

### FR-INV-004 — Purchase Record

**Priority:** MUST

A purchase record shall support, where applicable:

- Item
- Quantity
- Unit
- Unit cost
- Total cost
- Supplier
- Purchase date
- Received date
- Batch/lot reference
- Expiration date
- Receiving user

### FR-INV-005 — Department Allocation

**Priority:** SHOULD

Inventory shall be assignable to a relevant department, location, or storage area where required.

### FR-INV-006 — Low-Stock Threshold

**Priority:** SHOULD

The system should support a configurable reorder or low-stock threshold.

### FR-INV-007 — Expiration Tracking

**Priority:** SHOULD

The system should support expiration tracking for applicable perishable items.

### FR-INV-008 — Inventory Reconciliation

**Priority:** MUST

The system shall support reconciliation between opening stock, purchases, consumption, waste, adjustments, transfers, and closing stock.

### FR-INV-009 — Inventory Cost Visibility

**Priority:** SHOULD

The system should provide inventory cost/value information using a documented valuation method.

---

## 5.9 Recipes and Consumption

### FR-RECIPE-001 — Recipe Definition

**Priority:** SHOULD

Authorized users should be able to define the ingredients/materials associated with a menu item.

### FR-RECIPE-002 — Recipe-Based Consumption

**Priority:** SHOULD

Where recipe tracking is enabled, the system should derive expected ingredient consumption from completed sales or configured production workflows.

---

## 5.10 Waste

### FR-WASTE-001 — Record Waste

**Priority:** MUST

Authorized users shall be able to record inventory waste.

### FR-WASTE-002 — Waste Reason

**Priority:** MUST

A waste record shall capture a reason.

Supported categories shall include:

- Expired
- Spoiled
- Damaged
- Spillage
- Preparation error
- Overproduction
- Other

### FR-WASTE-003 — Waste Cost

**Priority:** SHOULD

The system should calculate or store the estimated cost of recorded waste.

### FR-WASTE-004 — Department Waste

**Priority:** SHOULD

The system should provide waste analysis by operational department.

---

## 5.11 Procurement and Suppliers

### FR-PROC-001 — Supplier Records

**Priority:** SHOULD

Authorized staff should be able to maintain supplier information.

### FR-PROC-002 — Purchase History

**Priority:** MUST

The system shall maintain historical inventory purchase records.

### FR-PROC-003 — Supplier Performance Information

**Priority:** COULD

The system may provide supplier performance information based on recorded purchase data.

---

## 5.12 Staff Management

### FR-STAFF-001 — Employee Registration

**Priority:** MUST

Authorized managers shall be able to register cafe employees.

### FR-STAFF-002 — Employee Role

**Priority:** MUST

Each employee account shall have an assigned role and/or permission set.

### FR-STAFF-003 — Start Date

**Priority:** SHOULD

The system should record the employee's start date.

### FR-STAFF-004 — Employment Status

**Priority:** MUST

The system shall record the employee's employment status.

### FR-STAFF-005 — Compensation Information

**Priority:** SHOULD

The system should support required employee compensation information.

### FR-STAFF-006 — Staff Account Access

**Priority:** MUST

Authorized managers or administrators shall be able to create, suspend, and manage staff system access.

---

## 5.13 Delivery

### FR-DEL-001 — Fulfilment Selection

**Priority:** MUST

Customers or authorized staff shall be able to select a supported fulfilment type.

### FR-DEL-002 — Delivery Information

**Priority:** MUST

Delivery orders shall contain sufficient delivery information before assignment.

### FR-DEL-003 — Delivery Status

**Priority:** MUST

Delivery orders shall support status tracking.

Example states:

```text
READY_FOR_PICKUP
ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
FAILED
```

### FR-DEL-004 — Delivery Provider

**Priority:** COULD

The system may integrate with external delivery providers.

---

## 5.14 Notifications

### FR-NOTIF-001 — Central Notification Service

**Priority:** MUST

The system shall provide a reusable notification service rather than implementing independent notification logic inside every business module.

### FR-NOTIF-002 — Supported Channels

**Priority:** MUST

The notification architecture shall support configurable channels including:

- In-app
- Email
- SMS
- WhatsApp
- Telegram

Actual channel availability depends on provider integration.

### FR-NOTIF-003 — Event-Based Notification

**Priority:** MUST

The system shall support notifications triggered by important business events.

Examples:

```text
OrderCreated
PaymentConfirmed
PaymentFailed
OrderPreparing
OrderReady
OrderOutForDelivery
OrderDelivered
LowStockDetected
ComplaintCreated
MonthlyStatementGenerated
```

### FR-NOTIF-004 — Customer Order Progress

**Priority:** MUST

Customers shall be notified when meaningful order-state transitions occur.

### FR-NOTIF-005 — Staff Operational Notification

**Priority:** MUST

Relevant staff shall be notified about events required for their work.

### FR-NOTIF-006 — Notification Preference

**Priority:** SHOULD

Where practical, users should be able to configure supported notification preferences.

---

## 5.15 Customer Support and Complaints

### FR-SUP-001 — Complaint Submission

**Priority:** MUST

Customers shall be able to submit complaints, questions, or feedback.

### FR-SUP-002 — Order Association

**Priority:** SHOULD

A complaint should be associated with a relevant order where applicable.

### FR-SUP-003 — Complaint Status

**Priority:** MUST

Complaints shall support controlled status transitions:

```text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

### FR-SUP-004 — Complaint Assignment

**Priority:** SHOULD

Authorized staff should be able to assign a complaint to a responsible person or team.

### FR-SUP-005 — Customer Response

**Priority:** MUST

Authorized staff shall be able to communicate a response or resolution to the customer.

---

## 5.16 Analytics and Reporting

### FR-ANL-001 — Sales Metrics

**Priority:** MUST

The system shall calculate and report sales metrics from authoritative transaction data.

At minimum, authorized users should be able to inspect:

- Sales total
- Order count
- Payment totals
- Date-range summaries

### FR-ANL-002 — Order Metrics

**Priority:** MUST

The system shall provide order metrics, including counts and relevant status summaries.

### FR-ANL-003 — Inventory Metrics

**Priority:** MUST

The system shall provide current inventory and stock-movement information.

### FR-ANL-004 — Waste Metrics

**Priority:** SHOULD

The system should provide waste cost and quantity summaries.

### FR-ANL-005 — Payment Metrics

**Priority:** MUST

The system shall provide payment summaries by supported payment method.

### FR-ANL-006 — Credit Metrics

**Priority:** MUST

Authorized managers shall be able to review outstanding customer-credit balances.

### FR-ANL-007 — Department Metrics

**Priority:** SHOULD

The system should provide department-level operational metrics where applicable.

---

## 5.17 Asset Management

### FR-ASSET-001 — Asset Registration

**Priority:** SHOULD

Authorized users should be able to register non-consumable assets such as equipment and furniture.

### FR-ASSET-002 — Asset Information

**Priority:** SHOULD

Asset records should support:

- Name
- Category
- Quantity
- Purchase date
- Purchase cost
- Location
- Condition
- Serial number where applicable
- Warranty
- Maintenance information
- Status

### FR-ASSET-003 — Asset/Inventory Separation

**Priority:** MUST

Reusable assets shall be modeled separately from consumable inventory.

---

## 5.18 AI Capabilities

### FR-AI-001 — AI Ordering Assistant

**Priority:** SHOULD

The system should allow customers to describe ordering intent in natural language and receive assistance using current menu data.

### FR-AI-002 — AI Recommendation

**Priority:** SHOULD

The system should provide menu recommendations using authorized customer preferences, history, current menu data, and availability.

### FR-AI-003 — AI Customer Support

**Priority:** SHOULD

The system should assist with common customer questions, complaint classification, order-status requests, and escalation.

### FR-AI-004 — AI Manager Assistant

**Priority:** SHOULD

The system should allow authorized managers to ask natural-language questions about operational information.

### FR-AI-005 — AI Inventory Assistant

**Priority:** COULD

The system may analyze inventory trends and provide recommendations regarding stock risk, waste, and replenishment.

### FR-AI-006 — AI Insights

**Priority:** SHOULD

The system should provide AI-assisted interpretation of trusted operational analytics.

### FR-AI-007 — AI Email Assistant

**Priority:** COULD

The system may classify, summarize, draft, or automatically respond to selected emails under configured policies.

### FR-AI-008 — AI Orchestration

**Priority:** SHOULD

The AI subsystem should route requests to the appropriate agent or tool while enforcing authorization and data-access boundaries.

---

## 5.19 Manager Dashboard

### FR-MGR-001 — Operational Overview

**Priority:** MUST

The manager shall be able to view a summary of core operational information.

The initial dashboard should provide access to:

- Order activity
- Sales summary
- Inventory status
- Low-stock alerts
- Customer credit summary
- Operational notifications

### FR-MGR-002 — AI Management Insights

**Priority:** SHOULD

The manager dashboard should provide access to AI-assisted insights when the underlying data and AI capability are available.

---

# 6. Business Rules

### BR-001 — Server Authoritative Totals

The server is the authoritative source for order totals, payment calculations, and customer balances.

### BR-002 — Item Availability

Unavailable items cannot be created through normal ordering workflows.

### BR-003 — Order Modification

An order can only be modified while its current status allows modification.

### BR-004 — Payment and Order State

Payment status and order status shall be modeled as separate concepts.

### BR-005 — Payment Verification

An unverified customer-provided screenshot shall not automatically establish successful payment.

### BR-006 — Credit Eligibility

Only customers explicitly authorized for credit may use customer-credit functionality.

### BR-007 — Credit Limit

A credit transaction shall not exceed the customer's configured credit limit unless an explicitly authorized override process exists.

### BR-008 — Credit Balance

Customer balance calculations shall be based on recorded transactions and payments rather than AI-generated calculations.

### BR-009 — Inventory Movement

Every material inventory quantity change shall be represented by a stock movement.

### BR-010 — Waste Separation

Waste shall be recorded separately from ordinary consumption.

### BR-011 — AI Transaction Access

AI shall access live transactional data through authorized application tools/interfaces.

### BR-012 — AI Authorization

AI shall not bypass application authorization or business rules.

### BR-013 — Sensitive AI Actions

Actions with material financial, personnel, or security impact shall require explicit authorization and may require human approval.

### BR-014 — Audit Trail

Critical financial, credit, inventory, administrative, and authorization changes shall be traceable.

---

# 7. AI Requirements and Guardrails

## 7.1 AI Usage Principle

AI shall be used where it offers meaningful value beyond deterministic software.

The following shall remain deterministic:

- Order totals
- Payment state
- Customer balances
- Inventory quantities
- Financial calculations
- Authorization decisions
- Business-rule enforcement

AI may assist with:

- Natural-language interaction
- Recommendations
- Classification
- Summarization
- Explanation
- Forecasting
- Drafting
- Decision support

## 7.2 Source of Truth

AI shall not be the authoritative source for:

- Menu price
- Menu availability
- Payment status
- Customer credit balance
- Inventory quantity
- Official financial metrics
- User permissions

## 7.3 Tool-Based Access

When an AI agent needs live information or performs an allowed action, the preferred flow is:

```text
AI Agent
   ↓
Authorized Tool / Application API
   ↓
Business Rules
   ↓
Database / External Provider
```

## 7.4 Human Approval

Human approval shall be considered for:

- Refunds
- Financial adjustments
- Credit-limit changes
- Employee record changes
- High-value procurement
- Other high-impact actions

## 7.5 RAG

A shared RAG capability may be used for relatively stable knowledge such as:

- Cafe policies
- Operating procedures
- Customer-service guidelines
- Refund policies
- Internal documentation
- Approved product knowledge

Live transactional information shall preferably be retrieved through application APIs/tools.

---

# 8. Notification and Communication Requirements

## 8.1 Central Notification Capability

Notification functionality shall be implemented as a reusable platform service.

## 8.2 Order Notifications

A typical order notification lifecycle should support:

```text
Order Created
    ↓
Payment Confirmed
    ↓
Preparing
    ↓
Ready
    ↓
Out for Delivery
    ↓
Delivered
```

Not every order will use every state.

## 8.3 Audience

Notification recipients may include:

- Customer
- Cashier
- Waiter
- Kitchen staff
- Manager
- Delivery personnel

The recipient shall depend on event type and role.

## 8.4 Notification Delivery

Notifications should support retries and failure tracking for external channels.

---

# 9. External Integration Requirements

## 9.1 Payment Providers

The initial integration targets are:

- Telebirr
- CBE
- Chapa

The exact provider APIs and verification mechanisms shall be confirmed during technical design.

For MVP implementation, one digital provider should be selected and integrated first. Additional providers may be introduced incrementally.

## 9.2 Messaging Providers

Potential integrations include:

- Email provider
- SMS provider
- WhatsApp provider
- Telegram provider

## 9.3 AI Provider

The application shall integrate with an external LLM provider through an isolated infrastructure adapter.

## 9.4 Vector/RAG Infrastructure

Where RAG is implemented, retrieval infrastructure may be provided by a vector database or equivalent technology.

The specific vector technology shall be selected during architecture/design rather than being hard-coded as an SRS requirement.

## 9.5 Delivery Provider

External delivery services may be supported through dedicated integration adapters.

---

# 10. Data Requirements

## 10.1 Core Data

The system is expected to manage:

- Users
- Roles and permissions
- Customers
- Employees
- Menu items
- Menu categories
- Departments
- Orders
- Order items
- Payments
- Customer credit accounts
- Credit transactions
- Inventory items
- Stock movements
- Recipes
- Waste records
- Suppliers
- Purchases
- Deliveries
- Notifications
- Complaints
- Assets
- Audit logs
- Analytics inputs

## 10.2 Data Integrity

Critical data shall maintain referential, transactional, and business-rule integrity.

## 10.3 Data Retention

Retention requirements for customer, employee, financial, operational, and audit data shall be explicitly defined before production deployment where required.

## 10.4 Personal Data

Personal and sensitive information shall be collected and stored only where necessary for supported business processes.

---

# 11. Security and Authorization Requirements

## 11.1 Authentication

Protected operations shall require authentication.

## 11.2 Authorization

The server shall enforce authorization independently of frontend controls.

## 11.3 Role/Permission Model

The initial role model shall support at least:

```text
OWNER
MANAGER
CASHIER
WAITER
KITCHEN_STAFF
DELIVERY_RIDER
CUSTOMER
ADMINISTRATOR
```

The final permission matrix shall be defined during architecture/design.

## 11.4 Password Security

Passwords shall never be stored as plaintext.

## 11.5 Secret Management

API keys, database credentials, signing secrets, and provider credentials shall not be committed to source control.

## 11.6 Audit and Security Events

Significant authorization, account, and administrative actions should be auditable.

---

# 12. Non-Functional Requirements

## 12.1 Reliability

### NFR-REL-001

Critical operations shall preserve consistent state when successful and shall fail safely without partial business transactions where transactionality is required.

## 12.2 Performance

### NFR-PERF-001

The system shall provide responsive user interactions for normal cafe workflows.

Specific latency targets shall be established during architecture and performance testing.

## 12.3 Availability

### NFR-AVAIL-001

The system should remain available during normal operating periods, subject to infrastructure and required third-party provider availability.

## 12.4 Maintainability

### NFR-MAIN-001

The system shall use modular boundaries, documented architecture, automated tests, and consistent development standards.

## 12.5 Extensibility

### NFR-EXT-001

The architecture shall allow additional departments, payment providers, notification channels, AI capabilities, and integrations to be introduced without unnecessary changes to unrelated modules.

## 12.6 Observability

### NFR-OBS-001

The production system shall provide appropriate health checks, structured logging, error visibility, and metrics.

Distributed tracing shall be introduced where justified by system complexity and operational needs.

---

# 13. Reliability, Backup, and Recovery

## 13.1 Persistent Storage

Critical business records shall be stored in durable centralized storage.

## 13.2 Backup

Production data shall have a documented backup strategy.

## 13.3 Recovery

A documented recovery procedure shall exist for critical data or infrastructure failures.

## 13.4 External Service Failure

The application should fail gracefully when an external provider is unavailable.

This includes:

- Payment provider
- Email/SMS provider
- Messaging provider
- AI provider
- Delivery provider

## 13.5 Idempotency

Critical retryable operations shall use idempotency where duplicate execution could create financial or business errors.

---

# 14. Auditability

The system shall maintain audit records for important business actions.

At minimum, auditing should cover:

- Payment adjustments
- Refunds
- Customer-credit adjustments
- Inventory adjustments
- Waste records
- Role/permission changes
- Important administrative actions
- Significant AI actions that modify business state

Where applicable, audit information should include:

- Actor
- Action
- Target
- Previous state
- New state
- Timestamp
- Correlation/request identifier

---

# 15. MVP and Release Scope

## 15.1 MVP Definition

The MVP is the smallest version that can demonstrate the core value of the product and support the primary cafe workflow.

### MVP — MUST Include

```text
Authentication and Authorization
Customer Management
Menu Management
Customer Ordering
Cashier / Waiter Order Entry
Kitchen Display and Department Routing
Core Payment Recording and Verification
Basic Customer Credit
Basic Inventory
Core Notifications
Basic Manager Dashboard
Critical Auditability
```

### MVP — SHOULD Include

```text
Basic Customer Support
Basic Delivery Workflow
Basic Sales Reporting
Basic Waste Reporting
```

### MVP Payment Scope

To keep the MVP focused:

```text
Cash                 → MUST
Customer Credit      → MUST
One digital provider → MUST
Additional providers → Post-MVP / Incremental
```

The selected digital provider shall be determined during technical planning and integration design.

## 15.2 Post-MVP

The following should be considered after the deterministic core system is stable:

```text
AI Ordering
AI Customer Support
AI Manager Assistant
AI Inventory Assistant
RAG Knowledge Base
Automated Email Assistance
Advanced Procurement
Advanced Inventory Forecasting
Advanced Delivery Integrations
Asset Management
Additional Payment Providers
```

This ordering is intentional: the deterministic cafe management foundation should exist before advanced AI automation is introduced.

---

# 16. Future Scope

Potential future capabilities include:

- Loyalty and rewards
- Table reservation
- Multi-branch support
- Mobile applications
- WhatsApp ordering
- Telegram ordering
- More payment providers
- More delivery providers
- Advanced payroll
- Full accounting integration
- Advanced procurement
- Advanced forecasting
- Additional AI agents
- More advanced AI orchestration
- Advanced customer personalization

Future scope shall be added through new requirements and change control rather than silently modifying the approved baseline.

---

# 17. Constraints and Assumptions

## 17.1 Initial Deployment

The initial product is intended primarily for a single cafe.

## 17.2 Technology Direction

The initial technology direction is:

```text
Monorepo: pnpm workspaces
Frontend: Next.js + TypeScript
Backend: NestJS + TypeScript
Database: PostgreSQL
ORM: Drizzle
Shared Validation/Types: Zod
Testing: Vitest
Code Quality: Biome
Local Infrastructure: Docker / Docker Compose
CI/CD: GitHub Actions
```

These technologies represent the current project direction and may be refined through documented architectural decisions.

## 17.3 Third-Party Services

Some capabilities depend on external providers and therefore may be affected by:

- Service availability
- API limitations
- Pricing
- Rate limits
- Provider changes
- Network connectivity

## 17.4 Regulatory and Legal Considerations

Before production deployment, the project shall validate applicable obligations related to:

- Payment processing
- Personal data
- Employee information
- Financial records
- Data protection

---

# 18. Architectural Direction

## 18.1 Proposed Architecture

The initial architecture shall follow:

> **Modular Monolith + Clean Architecture principles + Domain-oriented design + selective event-driven communication**

This is a design direction and does **not** require deployment as multiple independent services.

## 18.2 Logical Modules

The initial domain boundaries are expected to include:

```text
auth
users
customers
menu
orders
kitchen
payments
customer-credit
inventory
procurement
staff
delivery
notifications
support
analytics
assets
ai
audit
```

## 18.3 Clean Architecture

Major business modules should separate concerns across:

```text
Presentation
Application
Domain
Infrastructure
```

The exact dependency rules and module boundaries shall be formally documented during the architecture phase.

## 18.4 Event-Driven Communication

Relevant modules may communicate through domain/application events.

Potential events include:

```text
OrderCreated
PaymentConfirmed
PaymentFailed
OrderPreparing
OrderReady
OrderDelivered
LowStockDetected
ComplaintCreated
MonthlyStatementGenerated
```

Event-driven communication should be used when it provides meaningful decoupling and extensibility rather than being introduced unnecessarily.

## 18.5 Future Extraction

A module may later be extracted into an independent service if actual scale, reliability, organizational, or operational requirements justify doing so.

**Microservices are not an initial requirement.**

---

# 19. Requirements Traceability

Requirements should be traceable through the engineering lifecycle:

```text
Requirement
    ↓
GitHub Issue
    ↓
Design / ADR
    ↓
Implementation
    ↓
Automated Test
    ↓
Pull Request
    ↓
Release
```

Example:

```text
FR-ORD-001
    ↓
Issue #<order-issue>
    ↓
Order Design / ADR
    ↓
Implementation
    ↓
Unit / Integration / E2E Tests
    ↓
Pull Request
    ↓
Release
```

The exact issue and PR identifiers will be populated during implementation.

---

# 20. SRS Approval Criteria

The SRS may be considered approved when all of the following are satisfied:

- [ ] Product vision is defined.
- [ ] Major actors are identified.
- [ ] Major business domains are identified.
- [ ] Functional requirements are uniquely identified.
- [ ] Requirement priorities are defined.
- [ ] Business rules are documented.
- [ ] AI capabilities and guardrails are defined.
- [ ] Notification requirements are defined.
- [ ] Integration requirements are defined.
- [ ] Security requirements are defined.
- [ ] Non-functional requirements are defined.
- [ ] Data requirements are defined.
- [ ] Reliability and recovery requirements are defined.
- [ ] Auditability requirements are defined.
- [ ] MVP scope is explicitly separated from future scope.
- [ ] Architectural direction is documented at a high level.
- [ ] Final stakeholder/project-owner review is completed.
- [ ] SRS is formally approved as the implementation baseline.

> **Status rule:** Until the final approval step is completed, the document remains **Proposed for Approval**. Once formally approved, update the document status and revision history to **Approved**.

---

# Appendix A — Initial Domain Map

```text
AI-POWERED CAFE MANAGEMENT SYSTEM
│
├── Customers
│   ├── Profiles
│   ├── Orders
│   ├── Payments
│   ├── Credit
│   └── Support
│
├── Ordering
│   ├── Menu
│   ├── Orders
│   ├── Order Status
│   └── Fulfilment
│
├── Cafe Operations
│   ├── Cashier
│   ├── Waiter
│   ├── Kitchen
│   ├── Coffee / Hot Drinks
│   └── Food
│
├── Payments
│   ├── Cash
│   ├── Telebirr
│   ├── CBE
│   ├── Chapa
│   └── Customer Credit
│
├── Inventory
│   ├── Items
│   ├── Purchases
│   ├── Recipes
│   ├── Consumption
│   ├── Waste
│   ├── Suppliers
│   └── Stock Analysis
│
├── Staff
│   ├── Employees
│   ├── Roles
│   └── Access
│
├── Delivery
│   ├── Delivery Requests
│   ├── Riders
│   └── Delivery Status
│
├── Notifications
│   ├── In-App
│   ├── Email
│   ├── SMS
│   └── Messaging Platforms
│
├── Analytics
│   ├── Sales
│   ├── Orders
│   ├── Inventory
│   ├── Waste
│   └── Credit
│
├── AI
│   ├── Ordering Assistant
│   ├── Support Agent
│   ├── Manager Assistant
│   ├── Inventory Assistant
│   ├── Insights
│   ├── Email Assistant
│   ├── RAG
│   └── Orchestration
│
├── Assets
│   ├── Equipment
│   ├── Furniture
│   └── Maintenance
│
└── Platform
    ├── Authentication
    ├── Authorization
    ├── Audit
    ├── Observability
    └── Integrations
```

---

# Appendix B — Requirement Priority Convention

| Priority   | Meaning                                                    |
| ---------- | ---------------------------------------------------------- |
| **MUST**   | Required for the defined release/MVP                       |
| **SHOULD** | Important and planned, but can follow the MVP if necessary |
| **COULD**  | Optional capability                                        |
| **WON'T**  | Explicitly outside the current release                     |

---

# Appendix C — Change Control

After approval as SRS v1.0.0, changes to requirements shall be introduced through the project's GitHub issue and pull-request workflow.

A material requirement change should include:

1. Change request or GitHub Issue.
2. Reason for the change.
3. Impact analysis.
4. Updated requirement(s).
5. Updated priority or scope if necessary.
6. Documentation update.
7. Review and approval.

The approved SRS should not be silently modified directly on the integration branch.

---

## Document Status

**Current status:** Proposed for Approval

**Integration branch:** `dev`

**Next status transition:**

```text
Proposed for Approval
        ↓
Formal Review
        ↓
Approved
```

Once formally approved, this SRS becomes the **requirements baseline for architecture, design, implementation, testing, and release planning**.
