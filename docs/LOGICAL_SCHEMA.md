# Logical Database Schema

## Overview

The Personal Finance Manager API uses PostgreSQL as its relational database management system.

The database structure is maintained using Liquibase migrations.

The current database model defines 10 tables:

1. currencies
2. users
3. categories
4. transactions
5. transaction_conversions
6. budgets
7. financial_goals
8. goal_contributions
9. receipts
10. line_items

## Current Database Diagram

The database diagram includes the receipt line items functionality introduced in migration V1.2.

![Current Database Schema](DB_Scheme.png)

An earlier database diagram, created before the introduction of receipt line items, is also available:

[Earlier Database Diagram](DB_Scheme1.jpg)

The Liquibase migration files are the authoritative source of the implemented database structure.

## Table Relationships

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

The V1.0 schema originally includes a relationship between categories and transactions. Migration V1.3 modifies transaction categorization; its final effect must be checked against the migration script.

## Receipt Line Items

The `line_items` table is introduced by the Liquibase migration:

`src/main/resources/database/changelog/V1.2/add-line-items.yaml`

It stores individual products or services extracted from receipts.

Each line item includes:

- A unique identifier
- A reference to its receipt
- An optional category reference
- Item name
- Quantity
- Unit price
- Total amount
- Creation timestamp
- Update timestamp

### Relationships

**receipts → line_items**

One-to-Many.

A single receipt can have multiple line items.

Each line item references exactly one receipt.

The foreign key `receipt_id` references `receipts(id)`.

Deleting a receipt automatically deletes its related line items through `ON DELETE CASCADE`.

**categories → line_items**

One-to-Many.

A category can be associated with multiple line items.

Each line item can optionally reference one category.

The foreign key `category_id` references `categories(id)`.

### Indexes

The following indexes are defined for the line_items table:

- idx_line_items_receipt_id
- idx_line_items_category_id

These indexes support efficient filtering and joining of receipt items with their parent receipts and categories.

## Primary Keys

Each table has a primary key that uniquely identifies its records.

Most tables use an auto-incrementing BIGINT identifier.

Exceptions:

- The currencies table uses a three-character currency code as its primary key.
- The transaction_conversions table uses transaction_id as both its primary key and foreign key.

The line_items table uses an auto-incrementing BIGINT primary key.

## Referential Integrity

The database uses foreign key constraints to enforce relationships between tables.

Foreign keys help ensure that references point to existing parent records.

For example:

- Each transaction belongs to an existing user.
- Each receipt belongs to an existing user.
- Each line item belongs to an existing receipt.
- Each goal contribution references an existing financial goal.
- Each budget references an existing user and category.

## Database Schema Creation

The database schema is created automatically using Liquibase migrations.

### Master Changelog

`src/main/resources/database/changelog/db.changelog-master.yaml`

The master changelog includes:

- V1.0 — Initial database schema
- V1.1 — Receipt status modification
- V1.2 — Receipt line items
- V1.3 — Transaction category modification

### Database Initialization

When the Spring Boot application starts, Liquibase reads the master changelog and applies pending changesets.

This process manages:

- Table creation
- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Schema changes

Database tables do not need to be created manually.

## Additional Documentation

- [Database Architecture](architecture.md)
- [Data Dictionary](DATA_DICTIONARY.md)
- [Current Database Diagram](DB_Scheme.png)
- [Earlier Database Diagram](DB_Scheme1.jpg)
