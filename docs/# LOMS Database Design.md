# LOMS Database Design

Version: 1.0

Status: Approved

---

# Database Engine

MySQL 8

Charset

utf8mb4

Collation

utf8mb4_unicode_ci

Primary Keys

UUID

Soft Delete

Mandatory

Timestamps

Mandatory

---

# Core Tables

Infrastructure

Users

Groups

Permissions

UserGroups

GroupPermissions

UserPermissionOverrides

AuditLogs

Notifications

MasterData

Business

Clients

Files

Documents

PowersOfAttorney

Cases

CaseClients

Opponents

CaseOpponents

CaseSessions

FinancialTransactions

---

# USERS

Purpose

System users.

Columns

id UUID PK

full_name

username

password_hash

is_active

last_login_at

created_at

updated_at

deleted_at

created_by

updated_by

deleted_by

Indexes

username UNIQUE

---

# GROUPS

Purpose

Permission Groups.

Columns

id

name

description

created_at

updated_at

deleted_at

---

# PERMISSIONS

Examples

clients.view

clients.create

clients.update

clients.archive

cases.view

cases.create

cases.update

finance.view

reports.export

settings.manage

---

# USER_GROUPS

Many-to-Many

Users ↔ Groups

---

# GROUP_PERMISSIONS

Many-to-Many

Groups ↔ Permissions

---

# USER_PERMISSION_OVERRIDES

Purpose

Grant or deny specific permissions to individual users.

---

# CLIENTS

Purpose

Stores all office clients.

Columns

id

type

name

national_id

primary_phone

secondary_phone

email

address

notes

created_at

updated_at

deleted_at

created_by

updated_by

deleted_by

Indexes

name

primary_phone

national_id

---

# FILES

Stores physical file metadata.

Columns

id

original_name

storage_name

storage_path

mime_type

extension

size

uploaded_by

uploaded_at

No business relation here.

---

# DOCUMENTS

Represents business documents.

Columns

id

title

description

entity_type

entity_id

file_id

created_at

created_by

Example

Client Document

Case Document

Session Attachment

Power Of Attorney Scan

---

# POWERS_OF_ATTORNEY

Purpose

Power of attorney information.

Columns

id

client_id

number

issue_date

notes

created_at

updated_at

deleted_at

Relationship

One Client

↓

Many Powers

---

# CASES

Columns

id

court_id

case_type_id

case_status_id

case_number

case_year

subject

next_session_date

notes

created_at

updated_at

deleted_at

No historical information here.

---

# CASE_CLIENTS

Purpose

Many Clients

↓

Many Cases

Columns

id

case_id

client_id

---

# OPPONENTS

Stores opponent information.

Columns

id

name

phone

address

notes

---

# CASE_OPPONENTS

Many Cases

↓

Many Opponents

Relationship Table

---

# CASE_SESSIONS

Purpose

Stores complete session history.

Columns

id

case_id

session_date

decision_type_id

decision_note

next_session_date

created_at

created_by

Business Rules

Creating a session:

↓

Update Case.nextSessionDate

↓

Generate Notification

↓

Create Audit Log

---

# FINANCIAL_TRANSACTIONS

Columns

id

client_id

case_id (nullable)

type

amount

transaction_date

description

created_by

created_at

Types

Income

Expense

Payment

Refund

---

# NOTIFICATIONS

Columns

id

user_id

title

body

notification_date

is_read

entity_type

entity_id

created_at

---

# AUDIT_LOGS

Columns

id

user_id

action

entity

entity_id

old_values

new_values

created_at

Immutable.

---

# MASTER_DATA

Stores editable lookup values.

Examples

Courts

Case Types

Case Statuses

Decision Types

Administrative Task Types

Opponent Roles

---

# RELATIONSHIPS

Users

↓

Groups

↓

Permissions

Clients

↓

Powers Of Attorney

↓

Cases

↓

Sessions

↓

Documents

Clients

↓

Financial Transactions

Cases

↓

Case Clients

↓

Clients

Cases

↓

Case Opponents

↓

Opponents

Files

↓

Documents

↓

Business Entity

---

# Database Rules

UUID for every PK

Soft Delete everywhere

No Hard Delete

No Cascade Delete

Indexes on searchable columns

Business logic never inside database triggers

Application controls business rules

---

End of Document