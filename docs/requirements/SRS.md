# Software Requirements Specification (SRS)

## AI-Powered Cafe Management System

| Field              | Value                               |
| ------------------ | ----------------------------------- |
| Document           | Software Requirements Specification |
| Product            | AI-Powered Cafe Management System   |
| Version            | 0.2.0                               |
| Status             | Refined Draft                       |
| Date               | 2026-08-25                          |
| Primary Branch     | `dev`                               |
| SRS Working Branch | `docs/refine-srs`                   |

---

## Document Status

This document represents the **Refined SRS Draft v0.2.0**.

It is not yet the approved requirements baseline. The requirements will be reviewed for completeness, ambiguity, feasibility, consistency, priority, and acceptance criteria before being finalized as **SRS v1.0 — Approved Requirements Baseline**.

---

## Revision History

| Version | Date       | Status        | Description                                                                                     |
| ------- | ---------- | ------------- | ----------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-25 | Draft         | Initial SRS requirements draft                                                                  |
| 0.2.0   | 2026-08-25 | Refined Draft | Formalized structure, requirement IDs, priorities, business rules, AI, notifications, and scope |
| 1.0.0   | TBD        | Approved      | Final approved requirements baseline                                                            |

---

# Table of Contents

1. [Introduction](#1-introduction)
2. [Product Overview](#2-product-overview)
3. [Goals and Objectives](#3-goals-and-objectives)
4. [Stakeholders and Actors](#4-stakeholders-and-actors)
5. [System Scope](#5-system-scope)
6. [Functional Requirements](#6-functional-requirements)
7. [Business Rules](#7-business-rules)
8. [AI Requirements](#8-ai-requirements)
9. [Notification and Communication Requirements](#9-notification-and-communication-requirements)
10. [Integration Requirements](#10-integration-requirements)
11. [Data Requirements](#11-data-requirements)
12. [Security and Authorization Requirements](#12-security-and-authorization-requirements)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Reliability, Backup, and Recovery](#14-reliability-backup-and-recovery)
15. [Auditability](#15-auditability)
16. [MVP Scope](#16-mvp-scope)
17. [Future Scope](#17-future-scope)
18. [Constraints and Assumptions](#18-constraints-and-assumptions)
19. [Architecture Direction](#19-architecture-direction)
20. [Requirements Traceability](#20-requirements-traceability)
21. [SRS Acceptance Criteria](#21-srs-acceptance-criteria)

---

# 1. Introduction

## 1.1 Purpose

The purpose of this Software Requirements Specification is to define the functional, non-functional, business, security, data, integration, and AI-related requirements for the AI-Powered Cafe Management System.

The system is intended to provide a centralized digital platform for customer ordering, cafe operations, kitchen workflows, inventory, payments, customer accounts, staff management, delivery, notifications, support, analytics, and AI-assisted management.

This document establishes the baseline requirements that will guide:

- Domain modeling
- Architecture
- Database design
- API design
- UI/UX design
- Implementation
- Testing
- Deployment
- Future system evolution

---

## 1.2 Intended Audience

This SRS is intended for:

- Product stakeholders
- Software engineers
- Backend developers
- Frontend developers
- AI engineers
- Database engineers
- QA engineers
- DevOps engineers
- System architects
- Project maintainers

---

## 1.3 Product Vision

The system shall provide a reliable, modern, secure, and extensible cafe management platform that connects customers, employees, kitchen operations, inventory, payments, communication, and management within one centralized system.

The platform shall use AI selectively where it provides meaningful value, such as natural-language ordering, customer support, business insights, inventory assistance, communication automation, and recommendations.

The platform shall remain extensible so that additional departments, integrations, communication channels, AI capabilities, and business features can be added without requiring unnecessary redesign of the entire system.

---

## 1.4 Definitions

| Term           | Definition                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------- |
| KDS            | Kitchen Display System                                                                              |
| AI Agent       | Software capability that uses an AI model to reason about a task and interact with authorized tools |
| RAG            | Retrieval-Augmented Generation                                                                      |
| RBAC           | Role-Based Access Control                                                                           |
| MVP            | Minimum Viable Product                                                                              |
| SRS            | Software Requirements Specification                                                                 |
| Order          | A request for one or more cafe products                                                             |
| Menu Item      | A customer-facing product that can be ordered                                                       |
| Ingredient     | A material used to prepare a menu item                                                              |
| Stock Movement | A recorded change in inventory quantity                                                             |
| Credit Account | A customer account allowing approved deferred payment                                               |
| Fulfilment     | The method by which an order is received by the customer, such as dine-in, pickup, or delivery      |

---

# 2. Product Overview

## 2.1 Product Description

The AI-Powered Cafe Management System is a digital cafe operations platform designed primarily for a single cafe while maintaining an architecture that can evolve as the business grows.

The platform will connect:

```text
Customers
    |
    +-- Menu
    +-- Ordering
    +-- Payments
    +-- Delivery
    +-- Support
    +-- Notifications

Cafe Operations
    |
    +-- Cashier
    +-- Waiter
    +-- Kitchen
    +-- Coffee / Hot Drinks
    +-- Food

Management
    |
    +-- Inventory
    +-- Procurement
    +-- Staff
    +-- Customer Credit
    +-- Financial Operations
    +-- Analytics
    +-- Assets

AI Platform
    |
    +-- Ordering Assistant
    +-- Customer Support
    +-- Manager Assistant
    +-- Inventory Assistant
    +-- Insights
    +-- Email Assistant
    +-- Orchestration
```

---

## 2.2 Problem Statement

The current manual or fragmented cafe workflow may require customers to physically visit the cafe to place orders, employees to communicate orders verbally or through paper, managers to maintain inventory and customer credit records manually, and staff to perform financial calculations manually.

These processes introduce risks including:

- Customer inconvenience
- Order mistakes
- Lost kitchen instructions
- Slow communication
- Manual calculation errors
- Lost or damaged customer records
- Poor inventory visibility
- Poor waste tracking
- Limited management analytics
- Difficulty tracking customer credit
- Limited customer communication
- Limited operational visibility

The proposed system addresses these problems through centralized digital workflows, automation, real-time operational information, and AI-assisted capabilities.

---

# 3. Goals and Objectives

## 3.1 Primary Goals

The system shall aim to:

1. Digitize core cafe operations.
2. Improve customer ordering convenience.
3. Reduce manual order and communication errors.
4. Improve kitchen coordination.
5. Provide accurate inventory visibility.
6. Digitize customer credit and monthly account management.
7. Centralize payment and transaction records.
8. Improve customer communication and notifications.
9. Provide management analytics and operational insights.
10. Use AI only where it provides meaningful business value.
11. Protect critical business data against loss and unauthorized access.
12. Provide an extensible architecture for future capabilities.

---

## 3.2 Success Indicators

The system should enable the cafe to achieve measurable improvements such as:

- Reduced order-entry errors.
- Reduced time required to process orders.
- Improved visibility of kitchen workload.
- Reduced manual inventory calculation.
- Reduced difficulty in calculating customer monthly balances.
- Improved payment tracking.
- Improved visibility into inventory waste.
- Faster customer communication.
- Better management access to operational information.

Specific measurable targets will be defined where sufficient operational data becomes available.

---

# 4. Stakeholders and Actors

## 4.1 Customer

The customer interacts with the system to discover products, place orders, make payments, receive notifications, track fulfilment, use approved credit functionality, and communicate with the cafe.

## 4.2 Cashier

The cashier manages front-of-house orders, payments, receipts, customer account interactions, and authorized transaction workflows.

## 4.3 Waiter

The waiter supports dine-in and customer-facing service, including order entry, order communication, and service coordination.

## 4.4 Kitchen Staff / Cook

Kitchen personnel receive preparation tasks through the KDS, prepare items, update preparation status, and report operational exceptions.

## 4.5 Manager

The manager oversees cafe operations, staff, menu, inventory, procurement, customer accounts, operational financial information, complaints, reports, and AI-assisted insights.

## 4.6 Owner

The owner provides higher-level oversight of business performance, management, financial summaries, operational analytics, and strategic insights.

## 4.7 Delivery Rider / Delivery Provider

Delivery personnel or integrated delivery services receive delivery assignments and update delivery status where applicable.

## 4.8 System Administrator

An authorized administrator may manage system-level configuration, roles, permissions, integrations, and technical settings.

## 4.9 AI Agents

AI capabilities act as controlled software components that use authorized tools and data sources.

AI agents are not inherently trusted system administrators and shall operate within defined permissions and guardrails.

## 4.10 External Actors

Potential external systems include:

- Payment providers
- Email providers
- SMS providers
- WhatsApp/Telegram or other messaging providers
- LLM providers
- Vector database/RAG infrastructure
- Delivery providers

---

# 5. System Scope

## 5.1 In Scope

The system will initially cover:

- Authentication and authorization
- User and customer management
- Menu management
- Customer ordering
- Cashier and waiter order workflows
- Kitchen operations
- Department/station routing
- Payment management
- Customer credit/monthly accounts
- Inventory management
- Inventory consumption and waste
- Procurement information
- Staff management
- Delivery/fulfilment
- Notifications
- Customer support
- Reporting and analytics
- AI-assisted capabilities
- Auditability
- Security
- Backup and recovery mechanisms

## 5.2 Out of Scope for the Initial Release

Unless explicitly approved later, the following are not initial MVP requirements:

- Full accounting software
- Full enterprise payroll system
- Full ERP
- Multi-country tax management
- Complex multi-branch operations
- Advanced loyalty ecosystem
- Fully autonomous financial decision-making by AI

These may be evaluated as future capabilities.

---

# 6. Functional Requirements

## 6.1 Authentication and User Access

### FR-AUTH-001 — User Authentication

**Priority:** MUST

The system shall allow authorized users to authenticate securely.

### FR-AUTH-002 — Role-Based Access Control

**Priority:** MUST

The system shall enforce role-based access control for protected operations.

### FR-AUTH-003 — Least-Privilege Access

**Priority:** MUST

Users shall have only the permissions necessary for their assigned responsibilities.

### FR-AUTH-004 — Session and Credential Security

**Priority:** MUST

The system shall protect authentication credentials and authenticated sessions according to accepted security practices.

---

# 6.2 Customer Management

### FR-CUS-001 — Customer Registration

**Priority:** MUST

The system shall allow customers to create and maintain customer accounts where required by the selected ordering workflow.

### FR-CUS-002 — Customer Profile

**Priority:** MUST

The system shall maintain relevant customer profile information.

### FR-CUS-003 — Customer Order History

**Priority:** MUST

The system shall allow authorized customers to view their order history.

### FR-CUS-004 — Customer Payment History

**Priority:** SHOULD

The system should provide customers with access to their relevant payment history.

### FR-CUS-005 — Customer Credit Account

**Priority:** MUST

The system shall support approved customer credit accounts.

---

# 6.3 Menu Management

### FR-MENU-001 — Menu Item Management

**Priority:** MUST

Authorized staff shall be able to create, view, update, activate, deactivate, and manage menu items.

### FR-MENU-002 — Menu Categories

**Priority:** MUST

The system shall support menu categories.

### FR-MENU-003 — Availability

**Priority:** MUST

Authorized users shall be able to mark menu items as available or unavailable.

### FR-MENU-004 — Preparation Department

**Priority:** MUST

A menu item shall be associated with an appropriate preparation department or station.

### FR-MENU-005 — Customer Menu

**Priority:** MUST

Customers shall be able to view currently available menu items.

---

# 6.4 Customer Ordering

### FR-ORD-001 — Create Order

**Priority:** MUST

The system shall allow an authorized customer or staff member to create an order containing one or more available menu items.

### FR-ORD-002 — Order Quantity

**Priority:** MUST

The system shall validate that ordered quantities are greater than zero and valid for the selected menu item.

### FR-ORD-003 — Order Total

**Priority:** MUST

The server shall calculate the authoritative order total.

### FR-ORD-004 — Order Modification

**Priority:** MUST

Authorized users shall be able to modify an order while the order remains in a modifiable state.

### FR-ORD-005 — Order Cancellation

**Priority:** MUST

The system shall support controlled order cancellation according to business rules.

### FR-ORD-006 — Special Instructions

**Priority:** MUST

Customers or authorized staff shall be able to provide preparation instructions where supported.

### FR-ORD-007 — Order Types

**Priority:** MUST

The system shall support applicable fulfilment types such as dine-in, pickup, and delivery.

### FR-ORD-008 — Order History

**Priority:** MUST

The system shall maintain order history.

### FR-ORD-009 — Duplicate Submission Protection

**Priority:** MUST

The system shall prevent accidental duplicate order creation caused by repeated requests or retries.

---

# 6.5 Kitchen and Department Operations

### FR-KDS-001 — Kitchen Order Queue

**Priority:** MUST

The system shall provide a digital queue of active kitchen preparation tasks.

### FR-KDS-002 — Department Routing

**Priority:** MUST

Order items shall be routed to their configured preparation department or station.

### FR-KDS-003 — Order Preparation Status

**Priority:** MUST

Authorized kitchen users shall be able to update preparation status.

Supported states should include, where applicable:

```text
NEW
ACCEPTED
PREPARING
READY
COMPLETED
```

### FR-KDS-004 — Preparation Instructions

**Priority:** MUST

The KDS shall display relevant preparation instructions.

### FR-KDS-005 — Real-Time Order Availability

**Priority:** SHOULD

New kitchen orders should become visible to the appropriate preparation department without requiring manual page refresh.

### FR-KDS-006 — Item Unavailability

**Priority:** SHOULD

Kitchen personnel shall be able to report an item or ingredient that cannot be prepared.

### FR-KDS-007 — Kitchen Workload Visibility

**Priority:** SHOULD

The system should provide appropriate visibility into active and waiting kitchen workload.

---

# 6.6 Payment Management

### FR-PAY-001 — Payment Methods

**Priority:** MUST

The system shall support configurable payment methods including, where available:

- Cash
- Telebirr
- CBE
- Chapa
- Customer Credit

### FR-PAY-002 — Payment Status

**Priority:** MUST

The system shall maintain payment states such as:

```text
PENDING
PROCESSING
PAID
FAILED
CANCELLED
PARTIALLY_PAID
REFUNDED
```

### FR-PAY-003 — Payment Transaction Reference

**Priority:** MUST

Where supported by the payment provider, the system shall store the provider transaction reference.

### FR-PAY-004 — Payment Verification

**Priority:** MUST

The system shall verify payment success using trusted provider mechanisms where such mechanisms are available.

### FR-PAY-005 — Payment Evidence

**Priority:** SHOULD

The system may support manual payment evidence for exceptional workflows, but uploaded screenshots shall not automatically be treated as authoritative proof of successful payment.

### FR-PAY-006 — Receipts

**Priority:** MUST

The system shall generate or provide access to transaction receipts.

### FR-PAY-007 — Refund Workflow

**Priority:** SHOULD

The system should provide a controlled refund workflow with authorization according to business rules.

---

# 6.7 Customer Credit and Monthly Accounts

### FR-CREDIT-001 — Credit Eligibility

**Priority:** MUST

Only authorized customers shall be allowed to use customer-credit functionality.

### FR-CREDIT-002 — Credit Limit

**Priority:** MUST

The system shall support a configurable credit limit for eligible customers.

### FR-CREDIT-003 — Daily Consumption Recording

**Priority:** MUST

The system shall record customer transactions made under an approved credit arrangement.

### FR-CREDIT-004 — Running Balance

**Priority:** MUST

The system shall maintain the customer's outstanding balance.

### FR-CREDIT-005 — Monthly Statement

**Priority:** MUST

The system shall generate a monthly statement of applicable customer transactions.

### FR-CREDIT-006 — Partial Payment

**Priority:** SHOULD

The system should support partial payment against an outstanding balance.

### FR-CREDIT-007 — Credit Auditability

**Priority:** MUST

Changes to customer balances and credit-related records shall be auditable.

---

# 6.8 Inventory Management

### FR-INV-001 — Inventory Item Management

**Priority:** MUST

Authorized staff shall be able to manage inventory items.

### FR-INV-002 — Stock Quantity

**Priority:** MUST

The system shall maintain current inventory quantities using appropriate units of measurement.

### FR-INV-003 — Stock Movement

**Priority:** MUST

The system shall record inventory movements.

Movement types shall include where applicable:

```text
PURCHASE
CONSUMPTION
WASTE
ADJUSTMENT_IN
ADJUSTMENT_OUT
TRANSFER
```

### FR-INV-004 — Purchase Information

**Priority:** MUST

The system shall store relevant purchase information, including quantity, cost, supplier, and receipt date.

### FR-INV-005 — Department Allocation

**Priority:** MUST

Inventory items shall be assignable to relevant operational departments or locations where necessary.

### FR-INV-006 — Low Stock Threshold

**Priority:** SHOULD

The system should support configurable reorder or low-stock thresholds.

### FR-INV-007 — Expiration Tracking

**Priority:** SHOULD

The system should support expiration tracking for applicable perishable inventory.

### FR-INV-008 — Inventory Valuation

**Priority:** SHOULD

The system should provide inventory cost/value information using a documented valuation approach.

---

# 6.9 Recipes and Ingredient Consumption

### FR-RECIPE-001 — Recipe Definition

**Priority:** SHOULD

The system should allow authorized users to define the ingredients or materials associated with a menu item.

### FR-RECIPE-002 — Consumption Calculation

**Priority:** SHOULD

Where recipe-based inventory tracking is enabled, completed production or sales workflows should generate appropriate inventory consumption records according to configured business rules.

---

# 6.10 Waste Management

### FR-WASTE-001 — Waste Recording

**Priority:** MUST

The system shall allow authorized staff to record inventory waste.

### FR-WASTE-002 — Waste Reason

**Priority:** MUST

A waste record shall support a reason such as:

- Expired
- Spoiled
- Damaged
- Spillage
- Preparation Error
- Overproduction
- Other

### FR-WASTE-003 — Waste Cost

**Priority:** SHOULD

The system should calculate or record the estimated financial cost of waste.

### FR-WASTE-004 — Department Waste Analysis

**Priority:** SHOULD

The system should provide waste analysis by department.

---

# 6.11 Procurement and Suppliers

### FR-PROC-001 — Supplier Management

**Priority:** SHOULD

The system should maintain supplier information.

### FR-PROC-002 — Purchase Records

**Priority:** MUST

The system shall maintain records of inventory purchases.

### FR-PROC-003 — Purchase History

**Priority:** SHOULD

The system should allow authorized users to review purchase history.

### FR-PROC-004 — Procurement Insights

**Priority:** COULD

The system may provide AI-assisted procurement recommendations based on authorized inventory and consumption data.

---

# 6.12 Staff Management

### FR-STAFF-001 — Employee Registration

**Priority:** MUST

Authorized managers shall be able to register cafe employees.

### FR-STAFF-002 — Employee Role

**Priority:** MUST

Each employee shall have an assigned role or set of permissions.

### FR-STAFF-003 — Employment Start Date

**Priority:** SHOULD

The system should record an employee's employment start date.

### FR-STAFF-004 — Employment Status

**Priority:** MUST

The system shall support employee employment status.

### FR-STAFF-005 — Compensation Information

**Priority:** SHOULD

The system should support appropriate employee compensation information.

### FR-STAFF-006 — Staff Access Management

**Priority:** MUST

Authorized managers or administrators shall be able to manage employee system access.

---

# 6.13 Delivery and Fulfilment

### FR-DEL-001 — Fulfilment Selection

**Priority:** MUST

The system shall support applicable fulfilment methods.

### FR-DEL-002 — Delivery Address

**Priority:** MUST

Delivery orders shall contain sufficient delivery information.

### FR-DEL-003 — Delivery Status

**Priority:** MUST

The system shall support delivery status tracking where delivery is used.

Example states:

```text
READY_FOR_PICKUP
ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
FAILED
```

### FR-DEL-004 — Delivery Provider Integration

**Priority:** COULD

The system may integrate with external delivery providers.

---

# 6.14 Notifications and Communication

### FR-NOTIF-001 — Central Notification Service

**Priority:** MUST

The system shall provide a centralized notification capability.

### FR-NOTIF-002 — Notification Channels

**Priority:** MUST

The architecture shall support configurable communication channels such as:

- In-app
- Email
- SMS
- WhatsApp
- Telegram

Actual availability depends on supported provider integrations.

### FR-NOTIF-003 — Event-Based Notifications

**Priority:** MUST

The system shall support notification triggers based on relevant business events.

Examples:

```text
OrderCreated
PaymentConfirmed
PaymentFailed
OrderPreparing
OrderReady
OrderDelivered
LowStock
ComplaintCreated
MonthlyStatementGenerated
```

### FR-NOTIF-004 — Customer Order Notifications

**Priority:** MUST

Customers shall receive relevant notifications regarding the progress of their orders.

### FR-NOTIF-005 — Staff Notifications

**Priority:** MUST

Authorized staff shall receive relevant operational notifications.

Examples:

- New order
- Payment issue
- Low inventory
- Customer complaint
- Delivery assignment

### FR-NOTIF-006 — Notification Preferences

**Priority:** SHOULD

The system should support configurable notification preferences where appropriate.

---

# 6.15 Customer Support and Complaints

### FR-SUP-001 — Complaint Creation

**Priority:** MUST

Customers shall be able to submit complaints or feedback.

### FR-SUP-002 — Complaint Association

**Priority:** SHOULD

A complaint should be associated with a relevant order when applicable.

### FR-SUP-003 — Complaint Status

**Priority:** MUST

Complaints shall have trackable states such as:

```text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

### FR-SUP-004 — Complaint Assignment

**Priority:** SHOULD

Authorized staff shall be able to assign complaints to responsible personnel.

### FR-SUP-005 — Customer Communication

**Priority:** MUST

Authorized staff shall be able to communicate relevant complaint resolution information to customers.

---

# 6.16 Analytics and Reporting

### FR-ANL-001 — Sales Reporting

**Priority:** MUST

The system shall provide sales information for authorized users.

### FR-ANL-002 — Order Reporting

**Priority:** MUST

The system shall provide order metrics and summaries.

### FR-ANL-003 — Inventory Reporting

**Priority:** MUST

The system shall provide inventory-related reporting.

### FR-ANL-004 — Waste Reporting

**Priority:** SHOULD

The system should provide waste summaries and trends.

### FR-ANL-005 — Payment Reporting

**Priority:** MUST

The system shall provide payment summaries for authorized users.

### FR-ANL-006 — Customer Credit Reporting

**Priority:** MUST

The system shall provide customer-credit summaries and outstanding balances to authorized users.

### FR-ANL-007 — Department Reporting

**Priority:** SHOULD

The system should support operational reporting by department where appropriate.

---

# 6.17 Asset Management

### FR-ASSET-001 — Asset Registration

**Priority:** SHOULD

The system should allow authorized users to register non-consumable cafe assets.

### FR-ASSET-002 — Asset Information

**Priority:** SHOULD

Asset records should support:

- Name
- Category
- Quantity
- Purchase date
- Cost
- Location
- Condition
- Serial number where applicable
- Warranty
- Maintenance information
- Status

### FR-ASSET-003 — Asset and Inventory Separation

**Priority:** MUST

Consumable inventory and reusable assets shall be represented as distinct business concepts.

---

# 6.18 AI Capabilities

### FR-AI-001 — AI Ordering Assistance

**Priority:** SHOULD

The system should provide a natural-language ordering assistant.

### FR-AI-002 — AI Recommendations

**Priority:** SHOULD

The system should provide personalized or contextual menu recommendations using available customer preferences, history, menu information, and applicable business rules.

### FR-AI-003 — AI Customer Support

**Priority:** SHOULD

The system should use AI to assist with customer questions, complaint classification, order-status questions, and common support interactions.

### FR-AI-004 — AI Manager Assistant

**Priority:** SHOULD

The system should provide a natural-language manager assistant capable of answering authorized operational questions.

### FR-AI-005 — AI Inventory Assistant

**Priority:** COULD

The system may provide inventory trend analysis, stock-risk explanations, and reorder recommendations.

### FR-AI-006 — AI Insights

**Priority:** SHOULD

The system should provide AI-assisted explanations and insights over trusted operational analytics.

### FR-AI-007 — AI Email Assistance

**Priority:** COULD

The system may use AI to classify, draft, summarize, or respond to selected customer/business emails according to configured business rules.

### FR-AI-008 — AI Orchestration

**Priority:** SHOULD

The AI platform should support controlled routing of requests to appropriate AI capabilities and tools.

---

# 7. Business Rules

## BR-001 — Authoritative Order Total

The server shall be the authoritative source for order totals.

## BR-002 — Order Item Availability

An unavailable menu item shall not be orderable through normal ordering workflows.

## BR-003 — Order Modification

An order shall only be modifiable while it is in an allowed business state.

## BR-004 — Completed Orders

A completed order shall not be arbitrarily modified.

## BR-005 — Payment Verification

A payment shall not be considered successfully paid solely because a customer supplies an unverified screenshot.

## BR-006 — Customer Credit Authorization

Only authorized customers may use customer-credit functionality.

## BR-007 — Credit Limit

Customer credit usage shall respect the configured credit limit unless an authorized override is explicitly permitted.

## BR-008 — Inventory Consistency

Inventory changes shall be recorded as auditable stock movements.

## BR-009 — Waste Separation

Waste shall be recorded separately from normal inventory consumption.

## BR-010 — AI Data Access

AI capabilities shall use authorized application tools or interfaces when accessing live transactional data.

## BR-011 — AI Authorization

AI shall not bypass normal business authorization controls.

## BR-012 — Sensitive AI Actions

Sensitive financial, personnel, or business actions may require human approval.

## BR-013 — Auditability

Important changes to financial, customer-credit, inventory, security, and administrative information shall be traceable.

---

# 8. AI Requirements

## 8.1 AI Design Principle

AI shall be used where it provides meaningful value beyond conventional deterministic software.

The system shall not use AI where a deterministic calculation, validation, query, or business rule is more reliable and appropriate.

Examples:

```text
Deterministic:
- Order totals
- Customer balances
- Payment status
- Inventory quantities
- Sales calculations

AI-assisted:
- Recommendations
- Natural-language ordering
- Customer support
- Trend explanations
- Manager questions
- Email drafting
- Procurement suggestions
```

## 8.2 AI Source of Truth

AI models shall not be treated as authoritative sources for:

- Current menu price
- Current menu availability
- Payment status
- Customer balance
- Inventory quantity
- Official financial calculations
- Employee authorization

Such information shall be obtained from authoritative application services.

## 8.3 Tool-Based AI Access

Where an AI agent needs to interact with system data or functionality, it should use explicitly authorized tools or application interfaces.

Conceptually:

```text
AI
 ↓
Authorized Tool
 ↓
Application Business Rules
 ↓
Database / External Service
```

## 8.4 AI Guardrails

AI functionality shall include appropriate controls for:

- Authorization
- Tool access
- Sensitive actions
- Hallucination risk
- Data exposure
- Human escalation
- Auditability

## 8.5 Human-in-the-Loop

The system should support human approval for sensitive or high-impact AI-generated actions.

Potential examples:

- Refund approval
- Financial adjustments
- Credit-limit changes
- Employee record changes
- Significant procurement actions

---

# 9. Notification and Communication Requirements

## 9.1 Notification Architecture

Notifications shall be treated as a reusable platform capability.

Business modules should publish relevant events or notification requests rather than implementing independent notification mechanisms.

Conceptually:

```text
Business Event
      ↓
Notification Service
      ↓
Channel Adapter
      ↓
Email / SMS / WhatsApp / In-App
```

## 9.2 Order Notification Flow

Example:

```text
OrderCreated
   ├── Customer → Order confirmation
   ├── Kitchen → New order
   └── Cashier/Waiter → Order update
```

## 9.3 Order Progress

Customers should be able to receive relevant progress updates such as:

```text
Received
Preparing
Ready
Out for Delivery
Delivered
```

---

# 10. Integration Requirements

The system should be designed to integrate with external services through controlled adapters/interfaces.

Potential integrations include:

## 10.1 Payment Providers

- Telebirr
- CBE
- Chapa
- Future payment providers

## 10.2 Communication Providers

- Email
- SMS
- WhatsApp
- Telegram

## 10.3 AI / LLM Providers

The system should support an external LLM provider through an isolated integration layer.

## 10.4 Vector Database / RAG Infrastructure

Where RAG is implemented, the system may integrate with a vector database or equivalent retrieval infrastructure.

## 10.5 Delivery Providers

External delivery providers may be integrated through an adapter-based integration layer.

---

# 11. Data Requirements

## 11.1 Core Data Categories

The system is expected to manage data related to:

- Users
- Roles
- Customers
- Employees
- Menu items
- Categories
- Orders
- Order items
- Payments
- Customer credit accounts
- Credit transactions
- Inventory items
- Stock movements
- Recipes
- Waste
- Suppliers
- Purchases
- Deliveries
- Notifications
- Complaints
- Assets
- Reports
- Audit logs
- AI interactions where appropriate

## 11.2 Data Integrity

Critical business data shall maintain referential and transactional integrity.

## 11.3 Data Ownership

Business domains should have clear ownership of the data and operations they are responsible for.

## 11.4 Data Retention

Retention periods for financial, customer, employee, audit, and operational data shall be defined according to business and legal requirements.

---

# 12. Security and Authorization Requirements

## 12.1 Authentication

The system shall require authentication for protected operations.

## 12.2 Authorization

Protected operations shall be controlled by role and permission rules.

## 12.3 Role Separation

The system should distinguish responsibilities between roles such as:

```text
Owner
Manager
Cashier
Waiter
Kitchen Staff
Delivery Rider
Customer
Administrator
```

Exact permissions shall be defined during authorization design.

## 12.4 Sensitive Data Protection

Sensitive customer, employee, authentication, and financial information shall be protected against unauthorized access.

## 12.5 Secrets

Application secrets, provider credentials, and cryptographic keys shall not be stored directly in source control.

## 12.6 Audit Security Events

Important security-related actions should be auditable.

---

# 13. Non-Functional Requirements

## 13.1 NFR-PERF-001 — Performance

The system should provide responsive interaction for normal cafe workflows.

Specific quantitative targets will be defined after technical design and performance validation.

## 13.2 NFR-REL-001 — Reliability

Critical operations such as order creation, payment recording, inventory movement, and credit transactions shall maintain consistent state.

## 13.3 NFR-AVAIL-001 — Availability

The system should remain available during normal cafe operating hours subject to the availability of required infrastructure and external providers.

## 13.4 NFR-MAIN-001 — Maintainability

The codebase shall use clear modular boundaries, documented architectural decisions, automated tests, and consistent development conventions.

## 13.5 NFR-EXT-001 — Extensibility

The architecture shall support adding:

- New departments
- New payment providers
- New communication channels
- New AI capabilities
- New delivery integrations
- Future business modules

without unnecessary redesign of unrelated functionality.

## 13.6 NFR-OBS-001 — Observability

Production environments should provide appropriate:

- Structured logs
- Health checks
- Metrics
- Error tracking
- Tracing where justified

---

# 14. Reliability, Backup, and Recovery

## 14.1 Data Persistence

Critical business information shall be stored in persistent storage rather than relying on local client devices or paper records.

## 14.2 Backup

The production system shall implement an appropriate backup strategy.

## 14.3 Recovery

The system shall have a documented recovery process for critical data loss or infrastructure failure.

## 14.4 Failure Handling

The system should safely handle failures involving:

- Payment providers
- Notification providers
- External AI services
- Delivery services
- Database connectivity

## 14.5 Idempotency

Critical operations that may be retried shall use appropriate idempotency mechanisms where necessary.

---

# 15. Auditability

The system should maintain audit records for important business actions.

Auditable actions may include:

- Payment changes
- Refunds
- Customer-credit adjustments
- Inventory adjustments
- Waste records
- Staff access changes
- Role changes
- Important administrative actions
- AI actions that cause meaningful system changes

Audit records should identify, where applicable:

- Actor
- Action
- Target entity
- Previous state
- New state
- Timestamp
- Relevant request/context identifier

---

# 16. MVP Scope

The MVP should provide the smallest useful operational platform while establishing strong engineering foundations.

## 16.1 MVP Functional Scope

### MUST

```text
Authentication and Authorization
Menu Management
Customer Management
Customer Ordering
Cashier / Waiter Order Workflow
Kitchen Display / Department Routing
Core Payment Management
Basic Customer Credit
Basic Inventory
Core Notifications
Basic Manager Dashboard
Audit of Critical Operations
```

## 16.2 MVP AI Scope

The initial AI implementation should prioritize capabilities with clear customer or operational value.

Recommended initial AI scope:

```text
AI Ordering Assistance
Basic Customer Support Assistance
Basic Manager Insights
```

More advanced AI functionality should follow after the underlying business system is reliable.

## 16.3 MVP Exclusions

The MVP should not attempt to implement all future capabilities simultaneously.

---

# 17. Future Scope

Potential future capabilities include:

- Advanced AI manager assistant
- Advanced inventory forecasting
- AI procurement planning
- RAG-based knowledge assistant
- Automated email responses
- Advanced customer support automation
- Loyalty and rewards
- Table reservations
- Expanded delivery integrations
- Mobile applications
- WhatsApp ordering
- Telegram ordering
- Multi-branch support
- Advanced staff/payroll management
- Advanced financial/accounting capabilities
- More sophisticated AI orchestration
- Advanced operational forecasting

Future features shall only be promoted into active development after appropriate requirements and feasibility review.

---

# 18. Constraints and Assumptions

## 18.1 Initial Business Scope

The initial product is designed primarily for a single cafe.

## 18.2 Technology Direction

The project will initially follow the selected technology direction:

```text
Monorepo: pnpm workspaces
Frontend: Next.js + TypeScript
Backend: NestJS + TypeScript
Database: PostgreSQL
ORM: Drizzle
Validation / Shared Schemas: Zod
Testing: Vitest
Code Quality: Biome
Local Infrastructure: Docker / Docker Compose
CI/CD: GitHub Actions
```

Specific technology choices remain subject to architectural review and ADRs.

## 18.3 External Service Dependency

Some capabilities depend on external providers.

Examples include:

- Payment providers
- Email providers
- SMS providers
- Messaging platforms
- LLM providers
- Delivery providers

The system shall isolate these dependencies through appropriate integration boundaries.

## 18.4 Legal and Regulatory Requirements

The final implementation shall consider applicable requirements related to:

- Payments
- Customer information
- Employee information
- Data protection
- Financial recordkeeping

Specific legal obligations shall be validated for the deployment environment before production release.

---

# 19. Architecture Direction

## 19.1 Architectural Style

The proposed initial architecture is:

> **Modular Monolith + Clean Architecture principles + Domain-oriented design + selective event-driven communication.**

## 19.2 Architectural Principles

The system should follow these principles:

1. Business rules should remain independent from infrastructure details where practical.
2. Business domains should be clearly separated.
3. Dependencies should point toward stable business abstractions.
4. External services should be isolated behind integration boundaries.
5. AI should interact with business capabilities through controlled tools/interfaces.
6. Events should be used where they improve decoupling and extensibility.
7. The system should avoid premature microservice decomposition.
8. Security and authorization should be enforced at the application boundary and domain-sensitive operations.
9. Critical operations should be transactional and auditable.
10. New functionality should be added without unnecessary modification of unrelated modules.

## 19.3 Provisional Module Boundaries

The initial domain/module structure is expected to include:

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

This is a logical domain decomposition and does not imply separate deployable services.

## 19.4 Clean Architecture Direction

Where appropriate, each major business module may be organized around:

```text
Presentation
    ↓
Application
    ↓
Domain

Infrastructure
    ↓
implements application/domain abstractions
```

The exact folder and dependency structure will be documented during architecture design.

## 19.5 Event-Driven Communication

Relevant business events may be used to decouple modules.

Examples:

```text
OrderCreated
PaymentConfirmed
OrderReady
OrderDelivered
LowStockDetected
ComplaintCreated
MonthlyStatementGenerated
```

Possible consumers include:

```text
Kitchen
Notifications
Analytics
Inventory
Customer Support
AI
```

## 19.6 Future Evolution

The architecture should allow a well-bounded module to be extracted into an independent service in the future if justified by actual scale, reliability, organizational, or operational requirements.

Microservices are not an initial requirement.

---

# 20. Requirements Traceability

Requirements should eventually be traceable across the engineering lifecycle.

The intended relationship is:

```text
SRS Requirement
      ↓
GitHub Issue
      ↓
Technical Design / ADR
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
Issue #XXX
    ↓
Order Design
    ↓
Implementation
    ↓
Unit + Integration Tests
    ↓
PR #XXX
    ↓
Release
```

This traceability will become part of the project's professional development workflow.

---

# 21. SRS Acceptance Criteria

The SRS shall be considered ready for approval as **v1.0** when:

- [ ] Product vision is clear.
- [ ] Problem statement is validated.
- [ ] Stakeholders and actors are identified.
- [ ] Major business domains are identified.
- [ ] Functional requirements are identified and uniquely numbered.
- [ ] Requirements have appropriate priorities.
- [ ] Core business rules are documented.
- [ ] Non-functional requirements are documented.
- [ ] Security requirements are documented.
- [ ] AI requirements and guardrails are documented.
- [ ] Notification requirements are documented.
- [ ] Integration requirements are documented.
- [ ] Data requirements are documented.
- [ ] MVP scope is explicitly defined.
- [ ] Future scope is separated from MVP.
- [ ] Major assumptions and constraints are documented.
- [ ] Architectural direction is documented at a high level.
- [ ] Requirements have been reviewed for ambiguity and contradiction.
- [ ] Outstanding requirements questions have been resolved or explicitly recorded.
- [ ] The document has been reviewed and approved.

---

# Appendix A — Initial Domain Map

```text
AI-POWERED CAFE MANAGEMENT SYSTEM
│
├── Customer Management
│   ├── Profiles
│   ├── Accounts
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
│   └── Customer Credit
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

| Priority | Meaning                                                    |
| -------- | ---------------------------------------------------------- |
| MUST     | Required for the defined release/MVP                       |
| SHOULD   | Important and planned, but can follow the MVP if necessary |
| COULD    | Useful optional capability                                 |
| WON'T    | Explicitly excluded from the current release               |

---

# Appendix C — Current SRS Status

**Current Version:** 0.2.0
**Current Status:** Refined Draft

The next step is requirements review and validation.

After successful review and resolution of outstanding requirements questions, this document may be promoted to:

> **SRS v1.0 — Approved Requirements Baseline**
