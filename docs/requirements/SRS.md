AI-Powered Cafe Management System

Software Requirements Specification — Draft v0.1

Document Status: Draft
Version: 0.1.0
Last Updated: 2026-08-25
Product Type: Cafe Operations, Ordering, Customer Management, and AI-Assisted Management Platform

1. Introduction

1.1 Purpose

The AI-Powered Cafe Management System is intended to provide a centralized digital platform for managing the day-to-day operations of a modern cafe.

The system will replace or reduce several manual processes currently performed through paper records, verbal communication, and disconnected tools. It will support customer ordering, kitchen operations, inventory management, payments, customer accounts and credit, staff management, delivery, notifications, customer support, reporting, and AI-assisted decision-making.

The system is intended not only to digitize existing cafe processes but also to improve operational efficiency, data accuracy, customer experience, management visibility, and decision-making.

2. Product Vision

The product vision is:

To provide a reliable, modern, extensible cafe management platform that connects customers, cafe employees, kitchen operations, inventory, payments, communication, and management into one system, while using AI where intelligent assistance can provide meaningful business value.

The system should enable a cafe to move from fragmented/manual workflows to a centralized digital operating environment.

The platform should also be designed for future expansion so that new business capabilities, communication channels, AI capabilities, and integrations can be introduced without requiring major redesign of the entire system.

3. Problem Statement

3.1 Customer Ordering

Customers may need to physically visit the cafe to view the menu and place an order.

This creates inconvenience and limits the cafe's ability to accept orders remotely.

The proposed system will allow customers to:

Browse the menu remotely.

Search and discover available items.

Place orders without physically visiting the cafe.

Receive assistance from an AI ordering interface.

Track order progress.

3.2 Manual Customer Records and Credit

Some cafe customers may consume products throughout the month and pay at the end of the month.

In a manual process, the cafe may record daily consumption in exercise books or other paper records and calculate the customer's total manually at the end of the month.

This creates risks such as:

Lost records.

Damaged records.

Calculation errors.

Difficult historical lookup.

Lack of transparency.

Difficulty tracking outstanding balances.

Difficulty auditing customer transactions.

The system will provide a digital customer account and credit-management capability that can record daily transactions, calculate outstanding balances automatically, maintain payment history, and generate monthly statements.

3.3 Kitchen and Order Communication

Orders may be communicated to kitchen workers through paper, verbal communication, or other informal methods.

This can result in:

Lost orders.

Incorrect preparation.

Misunderstood quantities.

Forgotten special instructions.

Delays.

Poor visibility of current workload.

The system will provide a digital kitchen workflow and Kitchen Display System (KDS) that presents incoming orders and their preparation status to the relevant kitchen department.

3.4 Department-Specific Preparation

The cafe may operate separate preparation areas such as:

Coffee / Hot Drinks

Food

An order may contain items belonging to different preparation departments.

The system should therefore support routing order items to their appropriate department rather than presenting every order as an undifferentiated kitchen task.

Example:

Order #1024

Coffee / Hot Drinks

- 2 × Macchiato
- 1 × Cappuccino

Food

- 1 × Sandwich
- 1 × Cake

The system should allow departments/stations to be configurable so that additional departments can be introduced in the future.

4. Target Users and Actors

4.1 Customer

Customers should be able to:

Browse the menu.

Search and filter menu items.

Place orders.

Use AI-assisted ordering.

Receive recommendations.

Select available payment methods.

Request delivery or pickup.

Track order status.

View order history.

View account balances and payment history.

Participate in approved monthly-credit arrangements.

Submit complaints and feedback.

Receive notifications.

4.2 Cashier

The cashier will primarily manage front-of-house transaction and order operations.

Responsibilities may include:

Creating orders for customers.

Modifying eligible orders.

Confirming payments.

Recording supported payment methods.

Managing customer credit transactions where authorized.

Issuing receipts.

Viewing order status.

Communicating order information to customers.

Handling permitted cancellations and refund workflows.

Managing cashier shift information.

4.3 Waiter

The waiter will support customer-facing cafe operations.

Responsibilities may include:

Creating customer orders.

Associating orders with tables/customers where applicable.

Sending orders to preparation departments.

Viewing order status.

Communicating order status to customers.

Recording relevant customer requests.

Supporting dine-in service.

Exact waiter permissions will be defined separately through a role/permission model.

4.4 Kitchen Staff / Cook

Kitchen personnel will use the system primarily for food preparation.

The system should provide:

Incoming order queue.

Department-specific order routing.

Order details.

Item quantities.

Preparation instructions.

Order timestamps.

Preparation status.

Real-time notification of new orders.

Ability to mark orders as accepted, preparing, ready, and completed where appropriate.

Exception reporting when an item cannot be prepared.

4.5 Manager

The manager is a major operational user.

The manager should be able to manage:

Menu items.

Inventory.

Suppliers and procurement.

Customer accounts.

Customer credit/debt.

Staff.

Operational financial information.

Assets and equipment.

Reports and analytics.

Complaints and support escalation.

Business configuration.

AI-assisted management insights.

4.6 Owner

The owner may have higher-level access to:

Business performance.

Financial summaries.

Operational analytics.

Staff and management oversight.

Strategic insights.

AI-generated business reports.

Exact owner/manager permissions will be defined later.

4.7 Delivery Personnel

Where the cafe provides or integrates delivery services, delivery personnel should receive appropriate delivery information and update delivery status.

4.8 AI Agents

AI capabilities will act as controlled software agents/services rather than unrestricted system users.

Candidate AI capabilities include:

Ordering Assistant.

Customer Support Assistant.

Manager Assistant.

Inventory and Procurement Assistant.

Insights/Analytics Assistant.

Email Assistant.

Notification/communication assistance.

AI orchestration.

AI capabilities should interact with authorized system services/tools rather than directly manipulating the database.

5. Core Business Domains

The initial system is expected to contain the following major domains:

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
Notification & Communication
Customer Support
Reporting & Analytics
Asset Management
AI Platform
Security & Audit

These are logical business domains, not necessarily separate applications or microservices.

6. Customer Ordering

The system should support multiple ordering experiences.

6.1 Standard Ordering

Customer
→ Menu
→ Select items
→ Review order
→ Choose fulfilment
→ Payment
→ Order confirmation

6.2 AI-Assisted Ordering

Customers should be able to describe their intent naturally.

Example:

"I want something inexpensive without meat."

The AI assistant should use current menu information and business rules to recommend suitable items.

Another example:

"Give me two cappuccinos and a cake."

The system should translate the request into an order draft and require appropriate validation/confirmation before final submission.

The AI should never invent menu items, prices, or availability.

The authoritative source for such information should remain the application/database.

7. Payment Management

The system should support multiple payment mechanisms appropriate to the target environment.

Candidate methods include:

Telebirr.

CBE.

Chapa.

Cash.

Customer credit.

Other supported methods added in the future.

Payments should have explicit states such as:

Pending
Processing
Paid
Failed
Cancelled
Partially Paid
Refunded

The system should record payment information such as:

Order.

Amount.

Payment method.

Transaction reference.

Status.

Time.

User/process responsible for recording the payment.

Where payment providers support secure verification mechanisms, the system should use provider verification/webhooks rather than treating uploaded screenshots as authoritative proof of payment.

Manual payment evidence may be supported as an exception workflow where necessary, with appropriate authorization and auditability.

8. Customer Credit / Monthly Accounts

The system should support authorized customers who pay periodically rather than immediately.

The system should allow:

Customer
→ Daily consumption
→ Transaction recorded
→ Running balance
→ Monthly statement
→ Payment
→ Balance update

The system should support concepts such as:

Credit eligibility.

Credit limit.

Outstanding balance.

Daily transactions.

Partial payments.

Monthly statements.

Payment history.

Authorized adjustments.

Audit history.

Credit-related operations should be controlled through permissions and business rules.

9. Kitchen Management

The system should provide a Kitchen Display System.

A kitchen department should see:

NEW
↓
ACCEPTED
↓
PREPARING
↓
READY
↓
COMPLETED

The system should display:

Order number.

Relevant items.

Quantities.

Preparation instructions.

Order type.

Time received.

Current preparation state.

New orders should become available to the appropriate department without requiring manual page refresh where real-time capabilities are supported.

10. Department and Station Routing

Menu items should be associated with preparation departments/stations.

Example:

Coffee / Hot Drinks
Food
Bakery
Juice

The initial cafe configuration may use:

Coffee / Hot Drinks
Food

but the architecture should allow additional departments to be added without redesigning the core order system.

11. Inventory Management

Inventory management should go beyond simply storing current quantity.

The system should maintain a history of inventory movements.

Inventory transactions may include:

Purchase
Consumption
Waste
Adjustment In
Adjustment Out
Transfer

The system should track:

Item.

Quantity.

Unit of measurement.

Cost.

Supplier.

Purchase/receipt date.

Department.

Batch information where relevant.

Expiration date where relevant.

Current stock.

Stock movements.

Responsible user.

12. Inventory Consumption and Recipes

Menu items should optionally have recipes or ingredient definitions.

For example:

Cappuccino
→ Coffee beans
→ Milk
→ Optional sugar

This enables the system to connect:

Customer Order
→ Menu Item
→ Recipe
→ Ingredient Consumption
→ Inventory

This can support more accurate stock tracking and cost analysis.

13. Waste Management

The system should record inventory waste separately from normal consumption.

Waste should include:

Item.

Quantity.

Estimated cost.

Department.

Date.

Reason.

Person recording it.

Possible waste reasons include:

Expired.

Spoiled.

Damaged.

Spillage.

Preparation error.

Overproduction.

Other.

The manager should be able to analyze waste separately for departments such as Coffee/Hot Drinks and Food.

14. Inventory Analytics

The system should provide visibility into:

Current inventory.

Inventory value.

Purchase cost.

Consumption.

Waste.

Low-stock items.

Expiring items.

Department-level inventory performance.

The system should be capable of answering questions such as:

How much was spent on coffee inventory this month?

How much food inventory was wasted?

Which department has the highest waste cost?

15. Suppliers and Procurement

The platform should support management of inventory procurement information, including:

Suppliers.

Purchases.

Purchase quantities.

Unit prices.

Total costs.

Purchase dates.

Received dates.

Supplier history.

Future AI capabilities may assist in identifying reorder trends and procurement opportunities.

16. Asset Management

The system may also track non-consumable physical resources such as:

Equipment

Coffee machines.

Ovens.

Refrigerators.

Freezers.

Blenders.

POS equipment.

Furniture

Chairs.

Tables.

Other furniture.

Operational Assets / Supplies

Printers.

Packaging equipment.

Other reusable resources.

Asset records may include:

Item name.

Category.

Quantity.

Purchase date.

Cost.

Location.

Condition.

Serial number where applicable.

Warranty.

Maintenance information.

Status.

This should remain distinct from consumable inventory.

17. Staff Management

The manager should be able to register and manage cafe workers, including:

Waiters.

Cashiers.

Kitchen staff.

Cooks.

Other authorized personnel.

Employee records may include:

Identity information.

Role.

Start date.

Employment status.

Compensation/salary information.

Relevant employment information.

The initial system should distinguish staff management from a full payroll/accounting system unless a later requirement explicitly expands the scope.

18. Delivery and Fulfilment

The system should support multiple fulfilment methods, potentially including:

Dine-in
Pickup
Cafe delivery
External delivery integration

For delivery orders, the system should support:

Delivery address.

Delivery status.

Delivery fee.

Assigned rider/service.

Pickup.

Out-for-delivery.

Delivered.

Delivery exceptions.

19. Notification and Communication System

Notifications should be implemented as a centralized platform capability rather than being embedded independently into individual modules.

Potential channels include:

In-app
Email
SMS
WhatsApp
Telegram

where supported.

Important events may trigger notifications, including:

Order created
Payment confirmed
Payment failed
Order accepted
Order preparing
Order ready
Order out for delivery
Order delivered
Low stock
Complaint created
Monthly statement generated
Other business events

Examples:

OrderCreated
→ Kitchen notification
→ Cashier notification
→ Customer confirmation

LowStock
→ Manager notification

OrderReady
→ Customer notification
→ Waiter/cashier notification

The notification system should be extensible so additional channels can be added later.

20. Customer Support and Complaints

Customers should be able to submit complaints, questions, and feedback.

The system should support:

Complaint creation.

Complaint categorization.

Association with an order.

Status tracking.

Staff assignment.

Resolution information.

Customer communication.

Audit history.

AI may assist by:

Categorizing messages.

Finding relevant order information.

Suggesting responses.

Answering common questions.

Escalating complex cases to staff.

Sensitive actions such as refunds or compensation should remain governed by explicit business rules and permissions.

21. AI Platform

AI will be incorporated where it provides measurable operational or customer value.

The initial AI capability areas may include:

21.1 Ordering Agent

Natural-language ordering and menu assistance.

21.2 Customer Support Agent

Automated responses, complaint classification, order-status assistance, and escalation.

21.3 Manager Assistant

Natural-language access to operational information and business insights.

21.4 Inventory & Procurement Assistant

Inventory analysis, reorder recommendations, waste analysis, and procurement assistance.

21.5 Insights Agent

Analysis and explanation of sales, operational, and inventory trends.

21.6 Email Assistant

Automated classification, drafting, and selected responses to customer/business emails.

21.7 AI Orchestrator

A controlled orchestration layer responsible for routing requests to appropriate AI capabilities and tools.

22. AI Safety and Control

AI should not be treated as the source of truth for transactional data.

The architecture should follow:

AI
↓
Authorized tool/API
↓
Business rules
↓
Database

rather than:

AI
↓
Direct database modification

AI should also distinguish between:

Autonomous Actions

Low-risk actions that can be safely automated.

Human-Approved Actions

Sensitive or financially significant actions that should require staff approval.

Examples that may require stronger control include:

Refunds.

Financial adjustments.

Credit-limit changes.

Employee information changes.

High-impact procurement actions.

23. RAG / Knowledge Base

The platform should support a shared knowledge layer for relatively stable business information.

Potential knowledge sources include:

Cafe policies.

Operating procedures.

Menu knowledge.

Customer-service guidelines.

Refund policies.

Internal documentation.

Other approved business knowledge.

The AI should use the knowledge base when appropriate while using live application APIs/tools for transactional information.

24. Analytics and Reporting

The system should provide deterministic reporting for core business metrics.

Examples include:

Revenue.

Order count.

Average order value.

Best-selling items.

Inventory consumption.

Inventory waste.

Payment summaries.

Customer balances.

Department performance.

AI may then interpret these results and provide insights, explanations, or recommendations.

This separation is important:

The system calculates facts; AI helps people understand and act on those facts.

25. Data Persistence and Reliability

Important business information must not depend on paper records or a single physical device.

The system should provide:

Persistent centralized storage.

Data backup.

Recovery capability.

Transactional consistency.

Access control.

Auditability.

Critical information includes:

Orders.

Payments.

Customer balances.

Inventory transactions.

Staff information.

Business records.

26. Security Requirements

The system should include appropriate security controls, including:

Authentication.

Authorization.

Role-based access control.

Least-privilege permissions.

Secure password storage.

Input validation.

Secure secrets management.

Audit logging.

Protection of financial and customer information.

Controlled access to AI tools and actions.

27. Non-Functional Requirements

The system should be designed for:

Reliability

Core transactions should not leave the system in an inconsistent state.

Performance

Common user operations should respond within acceptable latency targets.

Availability

Core cafe operations should remain available during normal operating conditions.

Maintainability

The system should use modular, well-documented architecture and automated testing.

Extensibility

New departments, payment providers, notification channels, AI capabilities, and integrations should be addable without major architectural redesign.

Observability

The production system should provide appropriate logs, metrics, health information, and tracing where justified.

28. Architectural Direction

At the requirements stage, the proposed architectural direction is:

Modular Monolith + Clean Architecture principles + Domain-oriented design + Event-driven integration where useful.

Conceptually:

                    Next.js
                       │
                       ▼
                 NestJS API
                       │
              Modular Monolith
                       │
     ┌─────────────────┼─────────────────┐
     ↓                 ↓                 ↓

Orders Inventory Payments
↓ ↓ ↓
Clean Clean Clean
Architecture Architecture Architecture
│ │ │
└─────────────────┼─────────────────┘
↓
Domain Events
│
┌────────────┼────────────┐
↓ ↓ ↓
Notifications AI Analytics
│
Tools / RAG
│
▼
PostgreSQL

This is a provisional architectural direction, not yet the final architecture document. After the SRS, this decision should be formally documented and justified in an Architecture Decision Record (ADR).

29. Extensibility Principle

The SRS should deliberately avoid locking the system to today's exact feature set.

The system should be designed so that future capabilities can be added, such as:

Loyalty programs.

Table reservation.

More delivery integrations.

Additional payment providers.

Mobile applications.

WhatsApp ordering.

Telegram ordering.

Advanced procurement.

Advanced payroll.

Additional AI agents.

New notification channels.

New cafe departments.

Multi-branch support.

These should not automatically be part of the MVP.

30. MVP Direction

We should not attempt to implement every capability immediately.

Based on the current product discovery, a sensible initial MVP candidate is:

Authentication & Authorization
↓
Menu
↓
Customer Ordering
↓
Payment
↓
Kitchen / Department Workflow
↓
Basic Inventory
↓
Basic Customer Accounts / Credit
↓
Core Notifications
↓
Basic Management Dashboard

The system can progressively introduce:

Delivery
Staff Management
Advanced Inventory
Procurement
Customer Support
AI Ordering
AI Manager Assistant
AI Analytics
RAG
Email Automation
Advanced Notifications
Asset Management

The final MVP boundary should be decided after evaluating business priority, implementation effort, dependencies, and risk.

31. Requirements Review Status

This document is currently a Draft v0.1.

Before it becomes SRS v1.0, the requirements should be reviewed for:

Completeness.

Ambiguity.

Contradictions.

Business priority.

MVP boundaries.

Security implications.

Integration dependencies.

Testability.

Operational feasibility.

Once the review is complete, the finalized requirements should be approved and versioned as SRS v1.0.
