
# Database Data Dictionary

## Overview

Database: PostgreSQL

Schema management: Liquibase

The database contains 9 tables. All tables are created automatically using version-controlled Liquibase migrations.

**Legend:**
- PK — Primary Key
- FK — Foreign Key
- UQ — Unique constraint
- NN — NOT NULL
- Nullable — NULL values allowed

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

**Unique constraint:** (user_id, name, type)

## 4. transactions

Stores financial transactions.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| category_id | BIGINT | FK, NN |
| amount | DECIMAL(19,2) | NN |
| currency_code | VARCHAR(3) | FK, NN |
| transaction_date | DATE | NN |
| description | VARCHAR(500) | Nullable |
| created_at | TIMESTAMP | NN |
| updated_at | TIMESTAMP | NN |

**Foreign Keys:**
- user_id → users(id)
- category_id → categories(id)
- currency_code → currencies(code)

## 5. transaction_conversions

Stores currency conversion information for transactions.

| Column | Data Type | Constraints |
|---|---|---|
| transaction_id | BIGINT | PK, FK, NN |
| target_currency_code | VARCHAR(3) | FK, NN |
| exchange_rate | DECIMAL(19,8) | NN |
| converted_at | TIMESTAMP | NN |

**Foreign Keys:**
- transaction_id → transactions(id)
- target_currency_code → currencies(code)

## 6. budgets

Stores monthly spending limits for categories.

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

**Unique constraint:** (user_id, category_id, budget_month)

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

Stores contributions made towards financial goals.

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

Stores receipt image references and recognition results.

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | PK, NN, Auto Increment |
| user_id | BIGINT | FK, NN |
| transaction_id | BIGINT | FK, UQ, Nullable |
| image_path | VARCHAR(500) | NN |
| status | receipt_status | NN |
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

## PostgreSQL Enum Types

### transaction_type

Allowed values:
- INCOME
- EXPENSE

### receipt_status

Allowed values:
- UPLOADED
- PROCESSING
- PROCESSED
- FAILED
- CONFIRMED

## Database Migrations

Master changelog:

`src/main/resources/database/changelog/db.changelog-master.yaml`

Initial migration:

`src/main/resources/database/changelog/V1.0/init-scheme.yaml`

The database schema is created automatically by Liquibase.

No manual table creation is required.

## Notes

This document describes the database structure currently defined in Liquibase migrations.

Future features and tables, such as receipt line items, are not included in the implemented schema.
