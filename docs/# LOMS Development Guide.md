# LOMS Development Guide

Version: 1.0
Status: Approved

---

# 1. Purpose

This document defines the official development rules for the Legal Office Management System (LOMS).

Every contributor, whether human or AI, must follow these rules.

The goal is consistency, maintainability, and production-quality code.

---

# 2. Tech Stack

Backend

- NestJS (Latest LTS)
- TypeScript (Strict Mode)
- TypeORM
- MySQL 8
- Passport
- JWT
- bcrypt
- class-validator
- class-transformer
- Swagger

Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Material UI
- React Hook Form
- Zod

---

# 3. Backend Folder Structure

src/

config/

common/

database/

modules/

shared/

storage/

Every feature belongs inside its own module.

No business code is allowed outside modules.

---

# 4. Standard Module Structure

Example:

modules/clients/

client.entity.ts

client.controller.ts

client.service.ts

client.module.ts

dto/

interfaces/

enums/

validators/

Every module should remain isolated.

---

# 5. Controller Rules

Controllers are responsible only for:

- Receiving requests
- Calling services
- Returning responses

Controllers MUST NOT:

Contain business logic

Access repositories directly

Validate manually

Execute SQL

---

# 6. Service Rules

Services contain business logic.

Responsibilities:

Validation of business rules

Calling repositories

Calling other services

Transactions

Notifications

Audit Logs

Controllers should never duplicate service logic.

---

# 7. DTO Rules

Every endpoint must use DTOs.

Create DTO

Update DTO

Response DTO (when appropriate)

Validation is mandatory.

---

# 8. Validation Rules

Use class-validator.

Never validate manually.

Never trust frontend validation.

Always validate on the backend.

---

# 9. Database Rules

Use UUID primary keys.

Use TypeORM Migrations.

Never use synchronize:true.

Every entity includes:

createdAt

updatedAt

deletedAt

createdBy

updatedBy

deletedBy

Soft Delete is mandatory.

---

# 10. Naming Conventions

Classes:

PascalCase

Example:

ClientService

Variables:

camelCase

Example:

clientName

Database Tables:

snake_case

Example:

case_sessions

Columns:

snake_case

Example:

created_at

API Routes:

kebab-case

Example:

/case-sessions

---

# 11. Response Standard

Success

{
  "success": true,
  "message": "...",
  "data": {}
}

Error

{
  "success": false,
  "message": "...",
  "errors": []
}

Never return raw database responses.

---

# 12. Exception Handling

Use a Global Exception Filter.

Never expose:

SQL Errors

Stack Traces

Internal Exceptions

Always return user-friendly messages.

---

# 13. Logging

Log important business actions only.

Examples:

Login

Logout

Create Client

Update Client

Archive Client

Create Case

Upload File

Create Financial Transaction

Generate Report

Backup

Avoid excessive logging.

---

# 14. Audit Logging

Every business action should generate an audit log.

Audit records include:

User

Action

Entity

Entity ID

Timestamp

Old Values

New Values

Audit logs are immutable.

---

# 15. Transactions

Use database transactions when multiple related operations must succeed together.

Examples:

Create Session

↓

Update Case

↓

Create Notification

↓

Create Audit Log

If any step fails, rollback.

---

# 16. File Upload Rules

Files are uploaded through a Storage Service.

Business modules never write files directly.

Storage implementation should be replaceable.

---

# 17. Security Rules

Passwords must be hashed.

Never store plaintext passwords.

JWT authentication.

Permission-based authorization.

Sanitize user input.

Validate every request.

---

# 18. Swagger Rules

Every endpoint must include:

Summary

Description

Request DTO

Response DTO

Authentication

Possible Errors

Swagger documentation is mandatory.

---

# 19. Git Workflow

Branches:

main

develop

feature/<module-name>

bugfix/<issue>

hotfix/<issue>

Never commit directly to main.

---

# 20. Code Quality Rules

Strict TypeScript only.

No "any".

No duplicated code.

Small methods.

Single Responsibility Principle.

Meaningful variable names.

Prefer composition over inheritance.

Prefer enums over magic strings.

---

# 21. AI Development Rules

AI assistants must:

Read project documentation first.

Never invent database tables.

Never invent business rules.

Never modify architecture.

Never skip validation.

Never skip Swagger.

Never skip migrations.

Ask questions when requirements are unclear.

---

# 22. Development Order

1. Project Bootstrap
2. Authentication
3. Users
4. Groups
5. Permissions
6. Authorization
7. Clients
8. Documents
9. Powers of Attorney
10. Cases
11. Sessions
12. Finance
13. Notifications
14. Reports
15. Settings

Modules should be completed one by one.

---

# 23. Definition of Done

A module is complete only when it includes:

✔ Entity

✔ Migration

✔ DTOs

✔ Validation

✔ Service

✔ Controller

✔ Swagger

✔ Unit Tests (where applicable)

✔ Integration with existing architecture

A CRUD alone is NOT considered complete.

---

# 24. Final Principle

Write code as if another developer will maintain it for the next 10 years.

Optimize for readability before cleverness.

When in doubt:

Choose the simpler solution that respects the architecture.

End of Document.