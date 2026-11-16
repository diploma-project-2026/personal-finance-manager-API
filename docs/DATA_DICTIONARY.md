# Database Data Dictionary

## Overview

**Project:** Personal Finance Manager API  
**Database:** PostgreSQL  
**Schema management:** Liquibase  
**Number of tables:** 10

The database structure is defined using version-controlled Liquibase migrations. Tables, foreign keys, indexes, and constraints are created automatically when migrations are executed.

### Legend

- **PK** — Primary Key
- **FK** — Foreign Key
- **UQ** — Unique constraint
- **NN** — NOT NULL
- **Nullable** — NULL values allowed
- **Auto Increment** — Automatically generated numeric identifier

## 1. currencies

Stores supported currencies.

| Column | Data Type | Constraints |
|---|---|---|
| code | VARCHAR(3) | PK, NN |
| name | VARCHAR(100) | NN |

## 2. users

Stores application users and their default currency.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| email | VARCHAR(255) | NN, UQ |
| password_hash | VARCHAR(255) | NN |
| default_currency_code | VARCHAR(3) | FK, NN |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- default_currency_code → currencies(code)

## 3. categories

Stores user-defined income and expense categories.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| name | VARCHAR(100) | NN |
| type | transaction_type | NN |
| is_active | BOOLEAN | NN, Default true |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- user_id → users(id)

**Unique constraint:**
- (user_id, name, type)

## 4. transactions

Stores financial income and expense transactions.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| amount | DECIMAL(19,2) | NN |
| currency_code | VARCHAR(3) | FK, NN |
| transaction_date | DATE | NN |
| description | VARCHAR(500) | Nullable |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- user_id → users(id)
- currency_code → currencies(code)

**Migration note:** The initial V1.0 schema also contains `category_id BIGINT NOT NULL`, referencing `categories(id)`. The V1.3 migration is named `remove-transaction-category`. The removal of this field and its foreign key must be verified against that migration.

## 5. transaction_conversions

Stores currency conversion information associated with financial transactions.

| Column | Data Type | Constraints |
|---|---|---|
| transaction_id | BIGINT | PK, FK, NN |
| target_currency_code | VARCHAR(3) | FK, NN |
| exchange_rate | DECIMAL(19,8) | NN |
| converted_at | TIMESTAMP | NN |

**Foreign Keys:**
- transaction_id → transactions(id)
- target_currency_code → currencies(code)

The `transaction_id` column serves as both the primary key and foreign key, establishing a one-to-one relationship.

## 6. budgets

Stores monthly spending limits assigned to categories.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| category_id | BIGINT | FK, NN |
| budget_month | DATE | NN |
| limit_amount | DECIMAL(19,2) | NN |
| currency_code | VARCHAR(3) | FK, NN |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- user_id → users(id)
- category_id → categories(id)
- currency_code → currencies(code)

**Unique constraint:**
- (user_id, category_id, budget_month)

## 7. financial_goals

Stores users' financial saving goals.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| name | VARCHAR(150) | NN |
| description | VARCHAR(500) | Nullable |
| target_amount | DECIMAL(19,2) | NN |
| currency_code | VARCHAR(3) | FK, NN |
| target_date | DATE | Nullable |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- user_id → users(id)
- currency_code → currencies(code)

## 8. goal_contributions

Stores financial contributions made towards saving goals.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| goal_id | BIGINT | FK, NN |
| amount | DECIMAL(19,2) | NN |
| contribution_date | DATE | NN |
| created_at | TIMESTAMP | NN |

**Foreign Keys:**
- goal_id → financial_goals(id)

## 9. receipts

Stores uploaded receipt images, recognition results, and associated transactions.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| transaction_id | BIGINT | FK, UQ, Nullable |
| image_path | VARCHAR(500) | NN |
| status | VARCHAR (see V1.1) | NN |
| recognized_merchant | VARCHAR(255) | Nullable |
| recognized_date | DATE | Nullable |
| recognized_total | DECIMAL(19,2) | Nullable |
| recognized_currency_code | VARCHAR(3) | FK, Nullable |
| created_at | TIMESTAMP | NN |
| processed_at | TIMESTAMP | Nullable |

**Foreign Keys:**
- user_id → users(id)
- transaction_id → transactions(id)
- recognized_currency_code → currencies(code)

**Migration note:** V1.0 originally defines `status` using the PostgreSQL `receipt_status` ENUM. V1.1 changes the status representation to VARCHAR. The exact VARCHAR length must be checked in the V1.1 migration.

## 10. line_items

Stores individual products or services recognized from uploaded receipts.

Each line item belongs to a receipt and can optionally be associated with a financial category.

**Created by:** `V1.2/add-line-items.yaml`

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| receipt_id | BIGINT | FK, NN |
| category_id | BIGINT | FK, Nullable |
| name | VARCHAR(255) | NN |
| quantity | DECIMAL(10,2) | Nullable |
| unit_price | DECIMAL(19,2) | Nullable |
| total_amount | DECIMAL(19,2) | Nullable |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- receipt_id → receipts(id), ON DELETE CASCADE
- category_id → categories(id)

**Indexes:**
- idx_line_items_receipt_id (receipt_id)
- idx_line_items_category_id (category_id)

**Relationship rules:**
- One receipt can contain multiple line items.
- Every line item must belong to an existing receipt.
- A line item may reference a category.
- Deleting a receipt cascades deletion to its associated line items.

## PostgreSQL Enum Types

### transaction_type

Defined in the initial migration.

Allowed values:
- INCOME
- EXPENSE

### receipt_status

Initially defined in V1.0 with the following values:
- UPLOADED
- PROCESSING
- PROCESSED
- FAILED
- CONFIRMED

V1.1 changes the receipt status column to VARCHAR. The initial ENUM definition is retained here for migration history; its continued existence or removal must be verified against V1.1.

## Database Relationships

| Parent Table | Child Table | Relationship |
|---|---|---|
| currencies | users | One-to-Many |
| currencies | transactions | One-to-Many |
| currencies | transaction_conversions | One-to-Many |
| currencies | budgets | One-to-Many |
| currencies | financial_goals | One-to-Many |
| currencies | receipts | One-to-Many |
| users | categories | One-to-Many |
| users | transactions | One-to-Many |
| users | budgets | One-to-Many |
| users | financial_goals | One-to-Many |
| users | receipts | One-to-Many |
| categories | budgets | One-to-Many |
| categories | line_items | One-to-Many |
| transactions | transaction_conversions | One-to-One |
| transactions | receipts | One-to-One |
| financial_goals | goal_contributions | One-to-Many |
| receipts | line_items | One-to-Many |

The initial transaction-to-category relationship is subject to the V1.3 migration.

## Database Migrations

**Master changelog:**

`src/main/resources/database/changelog/db.changelog-master.yaml`

The master changelog includes the following migration directories:

| Version | Purpose |
|---|---|
| V1.0 | Initial database schema and constraints |
| V1.1 | Receipt status type modification |
| V1.2 | Creation of line_items table, foreign keys, and indexes |
| V1.3 | Transaction category modification |

All migration files are stored in Git.

The database structure is created automatically using Liquibase.

Only the empty PostgreSQL database needs to be created before application startup. Tables and relationships must not be created manually.

## Documentation

- [Database Architecture](architecture.md)
- [Logical Database Schema](LOGICAL_SCHEMA.md)
- [Current Database Diagram](DB_Scheme.png)
