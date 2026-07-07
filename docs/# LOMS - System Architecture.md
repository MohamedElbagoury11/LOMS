# LOMS - System Architecture

Version: 1.0
Status: Approved

---

# 1. Purpose

This document defines the official architecture of the Legal Office Management System (LOMS).

It is the single source of truth for all architectural decisions.

Every developer, AI assistant, or contributor must follow this document.

If implementation conflicts with this document, this document takes precedence.

---

# 2. Architecture Style

The application follows a Modular Monolith architecture.

Each module is independent but runs inside a single NestJS application.

Future migration to Microservices should be possible without major business logic changes.

---

# 3. High Level Architecture

                    React Frontend
                           │
                           ▼
                    REST API (NestJS)
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼

 Authentication       Business Modules      Shared Services

         │                 │                  │

         ▼                 ▼                  ▼

      MySQL            File Storage        Notifications

---

# 4. System Modules

Infrastructure Modules

- Authentication
- Authorization
- Users
- Groups
- Permissions
- Settings

Business Modules

- Clients
- Powers Of Attorney
- Cases
- Case Sessions
- Opponents
- Documents
- Finance
- Reports
- Notifications

System Modules

- Master Data
- Audit Logs
- Backup
- Storage

---

# 5. Core Design Principles

The architecture follows:

- SOLID
- Clean Code
- Separation of Concerns
- Dependency Injection
- Feature-Based Modules
- Single Responsibility Principle

Controllers should only coordinate requests.

Services contain business logic.

Entities represent the database.

DTOs validate requests.

Repositories access persistence.

---

# 6. Core Domain

The business revolves around the Client.

Client
│
├── Powers Of Attorney
├── Cases
├── Documents
├── Financial Transactions
└── Reports

Cases contain:

- Sessions
- Opponents
- Documents
- Powers of Attorney

Sessions generate:

- Notifications
- Audit Logs

---

# 7. Module Communication

Modules should communicate through Services.

Never call repositories from another module.

Correct:

ClientService
    ↓
CaseService

Wrong:

CaseRepository → ClientRepository

---

# 8. File Storage

Files are NOT stored inside MySQL.

MySQL stores only:

- File metadata
- Storage path
- MIME type
- Size

Storage implementation should be replaceable.

Supported providers (future):

- Local Storage
- AWS S3
- Cloudflare R2
- MinIO
- Supabase Storage

---

# 9. Soft Delete Strategy

Business records are never permanently deleted.

Every important table contains:

createdAt
updatedAt
deletedAt

createdBy
updatedBy
deletedBy

Soft Delete is mandatory.

---

# 10. Audit Strategy

Every important action generates an Audit Log.

Examples:

User Login

Create Client

Update Client

Archive Client

Create Case

Update Session

Upload Document

Financial Transaction

Generate Report

Backup

Audit records cannot be edited.

---

# 11. Notification Strategy

Notifications are event-driven.

Business Event
        │
        ▼
Notification Service
        │
        ▼
Notification Table
        │
        ▼
Frontend Bell Icon

Reminder timing is configurable.

Examples:

1 day

3 days

7 days

14 days

---

# 12. Search Strategy

Search should be available across:

Clients

Cases

Documents

Powers Of Attorney

Opponents

Search must support:

Partial Match

Pagination

Sorting

Filtering

Indexes should be created where necessary.

---

# 13. Database Philosophy

Database is designed for correctness.

UI is designed for usability.

Database design must never be dictated by UI layout.

---

# 14. API Philosophy

RESTful API.

Consistent response format.

Version-ready.

Swagger documented.

DTO validated.

Secure by default.

---

# 15. Error Handling

Centralized Exception Filter.

No raw SQL errors.

No stack traces returned to users.

Meaningful business messages only.

---

# 16. Security Principles

Passwords are hashed.

JWT authentication.

Permission-based authorization.

Input validation.

Output sanitization.

Rate limiting (future).

HTTPS in production.

---

# 17. Performance Principles

Use pagination.

Avoid N+1 queries.

Use indexes.

Lazy-load only when appropriate.

Optimize joins.

Never fetch unnecessary data.

---

# 18. Scalability

Architecture must support future:

- SaaS
- Multi-office
- Mobile App
- API integrations
- Background Jobs
- Queue System

without redesigning the business domain.

---

# 19. V1 Scope

Included

Authentication

Users

Groups

Permissions

Clients

Powers Of Attorney

Cases

Sessions

Documents

Finance

Notifications

Reports

Settings

Master Data

Audit Logs

Excluded

Calendar

AI

OCR

WhatsApp

Email

Online Payments

Client Portal

Multi-Tenant

---

# 20. Final Rule

Architecture decisions are intentional.

Developers and AI assistants must not introduce new architectural patterns without approval.

When in doubt,

ASK.

Never assume.

End of Document.