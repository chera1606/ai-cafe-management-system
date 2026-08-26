# ADR-001: Initial System Architecture

**Status:** Proposed
**Date:** 2026-08-26
**Decision:** Modular Monolith with Clean Architecture Principles
**Related:** SRS v1.0

---

## 1. Context

The AI-Powered Cafe Management System contains multiple business domains, including:

- Customer Management
- Menu Management
- Order Management
- Kitchen Operations
- Payments
- Customer Credit
- Inventory
- Procurement
- Staff Management
- Delivery
- Notifications
- Customer Support
- Analytics
- Asset Management
- AI

The system must remain maintainable, testable, secure, and extensible while supporting future capabilities such as additional AI agents, payment providers, notification channels, and delivery integrations.

The architecture must also avoid unnecessary operational complexity during the initial development stage.

---

## 2. Options Considered

### Option A — Traditional Layered Monolith

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

#### Advantages

- Simple to start.
- Easy to understand.
- Low infrastructure complexity.

#### Disadvantages

- Business domains can become tightly coupled.
- Large services can accumulate unrelated responsibilities.
- Domain boundaries can become unclear as the system grows.

---

### Option B — Microservices

```text
Orders Service
Inventory Service
Payments Service
Kitchen Service
AI Service
...
```

#### Advantages

- Independent deployment.
- Independent scaling.
- Strong service boundaries.

#### Disadvantages

- Distributed-system complexity.
- Network failures.
- Distributed transactions.
- More infrastructure.
- More complicated local development.
- More complicated deployment and observability.
- Premature complexity for the initial system.

---

### Option C — Modular Monolith with Clean Architecture

```text
NestJS Application
│
├── Orders
├── Inventory
├── Payments
├── Kitchen
├── Customers
├── Staff
├── Notifications
├── Delivery
├── Support
├── Analytics
└── AI
```

Each business module maintains clear responsibilities and applies Clean Architecture principles where appropriate.

#### Advantages

- Strong domain separation.
- Easier testing.
- Clear dependency boundaries.
- Simple initial deployment.
- Lower operational complexity than microservices.
- Easier future extraction of well-bounded modules.
- Appropriate for the initial system.

#### Disadvantages

- Requires discipline to maintain module boundaries.
- Does not provide independent deployment of modules.
- Poorly enforced boundaries could still result in a tightly coupled monolith.

---

## 3. Decision

The system will initially use:

> **A Modular Monolith with Clean Architecture principles and domain-oriented module boundaries.**

The backend will initially remain a single deployable application.

Major business domains will be represented as independent modules with clear responsibilities.

Clean Architecture principles will be used to separate:

```text
Presentation
    ↓
Application
    ↓
Domain

Infrastructure
    ↓
implements required abstractions
```

Domain or application events may be used where they improve decoupling between modules.

---

## 4. Architectural Principles

### 4.1 Domain Separation

Each major business domain shall have a clearly defined responsibility.

### 4.2 Dependency Direction

Business logic should remain independent from infrastructure implementations where practical.

### 4.3 Single Responsibility

Modules and components should have focused responsibilities.

### 4.4 Explicit Boundaries

Modules should communicate through defined application interfaces, commands, queries, or events rather than accessing another module's internal implementation.

### 4.5 Infrastructure Isolation

External systems and infrastructure technologies should be isolated behind appropriate interfaces or adapters.

### 4.6 Testability

Business logic should be independently testable without requiring external infrastructure wherever practical.

### 4.7 Security by Design

Security and authorization requirements shall be considered when defining module boundaries and workflows.

### 4.8 Extensibility

New payment providers, notification channels, AI capabilities, departments, and integrations should be addable without unnecessary modification of unrelated modules.

### 4.9 Avoid Premature Distributed Complexity

The system shall not introduce microservices unless actual scale, reliability, operational, or organizational requirements justify the transition.

---

## 5. Initial Module Boundaries

The proposed logical modules are:

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

These are logical modules within the monolith and are not separate deployable services.

---

## 6. Module Communication

Modules should communicate through well-defined interfaces.

### Synchronous Communication

Used when an immediate result is required.

Example:

```text
Order
  ↓
Menu
  ↓
Check item availability
```

### Event-Driven Communication

Used when another module needs to react to a completed business event.

Example:

```text
OrderCreated
    ├──→ Kitchen
    ├──→ Notifications
    └──→ Analytics
```

---

## 7. AI Architecture Principle

AI capabilities shall not directly access or modify the database.

The preferred interaction model is:

```text
AI Agent
    ↓
Authorized Tool / Application Interface
    ↓
Business Rules
    ↓
Application / Domain Layer
    ↓
Infrastructure
    ↓
Database
```

AI actions must remain subject to normal validation and authorization.

---

## 8. External Integration Principle

External providers shall be isolated behind integration boundaries.

Potential integrations include:

- Payment providers
- Email providers
- SMS providers
- WhatsApp / Telegram
- Delivery providers
- LLM providers
- Vector databases

The internal business domains should not become tightly coupled to a specific provider.

---

## 9. Future Evolution

If a specific module later develops independent scaling, deployment, reliability, or organizational requirements, it may be considered for extraction into an independent service.

The preferred evolution path is:

```text
Modular Monolith
      ↓
Identify stable boundary
      ↓
Introduce explicit interface
      ↓
Introduce integration/event boundary
      ↓
Extract module if justified
```

Microservices are therefore considered a possible future evolution, not an initial requirement.

---

## 10. Consequences

### Positive Consequences

- Clear business boundaries.
- Lower deployment complexity.
- Improved testability.
- Improved maintainability.
- Better domain understanding.
- Strong foundation for AI and integrations.
- Possible future service extraction.

### Negative Consequences

- Requires discipline to preserve module boundaries.
- Developers must understand dependency direction.
- The application remains a single deployable backend.
- Some distributed-system concepts will be introduced later rather than immediately.

---

## 11. Decision Review

This ADR should be reviewed if:

- System scale changes significantly.
- Independent deployment becomes necessary.
- A module develops substantially different operational requirements.
- Organizational structure changes.
- Reliability or scaling requirements justify service decomposition.
