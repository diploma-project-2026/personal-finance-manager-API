# Personal Finance Manager API

## Project Description

Personal Finance Manager is a diploma project designed to help users manage their personal finances.

The application provides functionality for managing income and expenses, financial categories, budgets, savings goals, currency conversions, and receipt processing.

The backend is built with Java and Spring Boot. PostgreSQL is used for relational data storage, and Liquibase manages database schema migrations.

## Technologies

- Java 21
- Spring Boot 4.1.1
- PostgreSQL
- Spring Data JPA / Hibernate
- Liquibase
- Maven
- Cloudinary — image storage
- Python — receipt processing and ML worker

## Database

The PostgreSQL database schema contains 10 tables:

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

The database supports user-specific financial data, receipt recognition, item-level receipt details, and financial goal tracking.

All database tables, foreign keys, constraints, and indexes are managed through Liquibase migrations.

## How to Run

### Prerequisites

- Java 21
- PostgreSQL
- Maven or included Maven Wrapper
- IntelliJ IDEA or another compatible development environment

### Step 1: Create Database

Start the PostgreSQL server.

Create an empty database:

```sql
CREATE DATABASE personal_finance_manager;
```

Only the database itself must be created manually.

Do not manually create tables. Liquibase manages the database structure.

### Step 2: Configure Environment Variables

Database connection settings are configured through environment variables.

Set the following variables in IntelliJ IDEA under **Run → Edit Configurations → Environment variables**:

```text
DB_URL=jdbc:postgresql://localhost:5432/personal_finance_manager
DB_USERNAME=postgres
DB_PASSWORD=your_local_password
```

Replace `your_local_password` with your local PostgreSQL password.

For Cloudinary integration, also configure:

```text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never commit passwords, API keys, or other credentials to Git.

### Step 3: Run Application

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

Alternatively, run the main Spring Boot application class directly from IntelliJ IDEA.

### Step 4: Automatic Database Initialization

During application startup, Liquibase reads the master changelog and executes pending database migrations.

Liquibase automatically creates the database tables, foreign key relationships, constraints, and indexes.

The application uses version-controlled migration files rather than manually maintained database structures.

## Database Documentation

The database documentation is located in the `docs` directory.

- [Database Architecture](docs/architecture.md)
- [Data Dictionary](docs/DATA_DICTIONARY.md)
- [Logical Database Schema](docs/LOGICAL_SCHEMA.md)
- [Current Database Diagram](docs/DB_Scheme.png)
- [Earlier Database Diagram](docs/DB_Scheme1.jpg)

The Data Dictionary contains information about tables, fields, data types, primary keys, foreign keys, and constraints.

The Logical Database Schema describes the relationships between database entities.

## Database Migrations

Liquibase master changelog:

`src/main/resources/database/changelog/db.changelog-master.yaml`

Database migration directories:

| Version | Description |
|---|---|
| V1.0 | Initial database schema |
| V1.1 | Receipt status type modification |
| V1.2 | Creation of receipt line items |
| V1.3 | Transaction category modification |

Initial schema:

`src/main/resources/database/changelog/V1.0/init-scheme.yaml`

Receipt status migration:

`src/main/resources/database/changelog/V1.1/change-receipt-status-to-varchar.yaml`

Receipt line items migration:

`src/main/resources/database/changelog/V1.2/add-line-items.yaml`

Transaction category migration:

`src/main/resources/database/changelog/V1.3/remove-transaction-category.yaml`

The master changelog includes all four migration directories.

The database schema is created and updated automatically using Liquibase.

## Database Design

The database uses relational modeling with primary keys, foreign keys, unique constraints, and indexes.

The main entities include:

- Users and supported currencies
- Financial transactions
- Income and expense categories
- Monthly budgets
- Financial goals and contributions
- Receipts and receipt line items
- Currency conversion information

The `line_items` table is introduced by migration V1.2. It stores individual items associated with receipts.

Each line item belongs to a receipt and can optionally reference a category.

## Security

Database passwords, Cloudinary credentials, and other secrets are managed using environment variables.

Sensitive credentials must not be stored in Git or committed to the repository.

Local environment files such as `.env` should be excluded through `.gitignore`.

## Database Evaluation

This repository contains the source code and documentation required for the Database evaluation.

The materials include:

- Database architecture
- Data dictionary
- Logical database schema
- Database diagrams
- Liquibase schema migrations
- Instructions for configuring and running the application

The database structure is maintained using version-controlled Liquibase migration scripts.
