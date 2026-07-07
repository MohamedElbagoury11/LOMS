# AGENTS.md

## Project

Legal Office Management System (LOMS)

This project is production software.

Do not treat it as a demo project.

---

## Read Documentation First

Before making any decision you MUST read all documentation inside the `/docs` directory.

Never assume business rules.

Never invent database tables.

Never modify architecture.

If something is unclear, ask.

---

## Technology Stack

Backend

- NestJS
- TypeScript (Strict)
- TypeORM
- MySQL 8

Frontend

- React
- TypeScript
- Vite

---

## Architecture

Follow Modular Monolith architecture.

Each module is independent.

Controllers contain no business logic.

Services contain business logic.

Repositories access the database.

---

## Database

Always use UUID.

Always use migrations.

Never use synchronize:true.

Never hard delete business data.

Soft delete only.

---

## Validation

Every endpoint must use DTOs.

Use class-validator.

Never validate manually.

---

## Documentation

Swagger is mandatory.

Every endpoint must be documented.

---

## Coding Rules

Never use "any".

Never duplicate code.

Never use magic strings.

Prefer enums.

Prefer reusable utilities.

Prefer dependency injection.

---

## Security

Hash passwords.

Never expose stack traces.

Never trust frontend validation.

Always validate backend requests.

---

## AI Rules

Never create features outside Version 1 scope.

Never create tables without approval.

Never change architecture.

Never rename existing entities.

Always ask before making architectural decisions.

Your job is implementation, not architecture.

---

## Development Process

Read documentation.

Understand the task.

Implement only the requested module.

Wait for review.

Never continue automatically to the next module.