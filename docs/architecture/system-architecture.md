# System Architecture

**Version:** 0.1.0  
**Status:** Proposed  
**Related:** SRS v1.0, ADR-001

---

## 1. Overview

The AI-Powered Cafe Management System will initially use a modular monolith architecture.

The backend will be organized into domain-oriented modules with Clean Architecture principles applied within major modules.

---

## 2. High-Level Architecture

```text
                         ┌───────────────────┐
                         │     Customers     │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     Next.js Web   │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     NestJS API    │
                         │  Modular Monolith │
                         └─────────┬─────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
     Orders                    Inventory                  Payments
        │                          │                          │
        ▼                          ▼                          ▼
     Kitchen                   Procurement             Customer Credit
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              Notifications       AI          Analytics
                    │              │
                    │        ┌─────┼─────┐
                    │        ▼     ▼     ▼
                    │      Tools  RAG  Agents
                    │
                    ▼
             External Channels
          Email / SMS / Messaging

                                   │
                                   ▼
                              PostgreSQL
```

---

## 3. Backend Module Structure

```text
apps/api/
└── src/
    └── modules/
        ├── auth/
        ├── users/
        ├── customers/
        ├── menu/
        ├── orders/
        ├── kitchen/
        ├── payments/
        ├── customer-credit/
        ├── inventory/
        ├── procurement/
        ├── staff/
        ├── delivery/
        ├── notifications/
        ├── support/
        ├── analytics/
        ├── assets/
        ├── ai/
        └── audit/
```

---

## 4. Internal Module Architecture

A major business module may follow:

```text
orders/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

### Domain

Contains business concepts and rules.

### Application

Contains use cases and application workflows.

### Infrastructure

Contains database implementations, external services, and framework-specific infrastructure.

### Presentation

Contains HTTP/API-facing components and request/response handling.

---

## 5. Dependency Direction

The preferred dependency direction is:

```text
Presentation
      ↓
Application
      ↓
Domain

Infrastructure
      ↓
implements abstractions required by Application / Domain
```

Business rules should remain independent from infrastructure as reasonably practical.

---

## 6. Module Communication

Modules should avoid direct access to another module's internal implementation.

Preferred mechanisms are:

```text
Synchronous
    ↓
Public application interface

Asynchronous
    ↓
Domain / Application event
```

Example:

```text
OrderCreated
    ├──→ Kitchen
    ├──→ Notifications
    └──→ Analytics
```

---

## 7. External Systems

External systems will be accessed through dedicated integration boundaries.

```text
Application
    ↓
Integration Interface
    ↓
Provider Adapter
    ↓
External Service
```

Examples:

```text
PaymentProvider
EmailProvider
SmsProvider
MessagingProvider
DeliveryProvider
LLMProvider
VectorStore
```

---

## 8. AI Boundary

AI agents shall interact with the application through controlled tools.

```text
Customer / Manager
        ↓
AI Interface
        ↓
Agent / Orchestrator
        ↓
Authorized Tool
        ↓
Application Use Case
        ↓
Domain Rules
        ↓
Database / External Provider
```

AI shall not bypass normal authorization or business rules.

---

## 9. Notification Flow

```text
Business Event
      ↓
Notification Service
      ↓
Channel Adapter
      ├──→ In-App
      ├──→ Email
      ├──→ SMS
      └──→ Messaging Platform
```

---

## 10. Architectural Goals

The architecture should provide:

- Clear domain boundaries.
- Maintainability.
- Testability.
- Security.
- Extensibility.
- Reliable business workflows.
- Controlled AI integration.
- Isolated external dependencies.
- Simple initial deployment.
- A future path toward service extraction when justified.
