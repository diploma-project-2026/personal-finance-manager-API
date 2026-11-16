
# Personal Finance Manager API

## Project Description

Personal Finance Manager is a diploma project for managing personal finances.

The application is built using Java and Spring Boot. It uses PostgreSQL for data storage and Liquibase for database schema migrations.

## Technologies

- Java 21
- Spring Boot 4.1.1
- PostgreSQL
- Spring Data JPA / Hibernate
- Liquibase
- Maven

## Database

The PostgreSQL database consists of 9 tables:

1. currencies
2. users
3. categories
4. transactions
5. transaction_conversions
6. budgets
7. financial_goals
8. goal_contributions
9. receipts

Database schema is managed by Liquibase migrations.

## How to Run

### Prerequisites

- Java 21
- PostgreSQL
- Maven (or included Maven Wrapper)

### Step 1: Create Database

Start PostgreSQL and create an empty database:

```sql
CREATE DATABASE personal_finance_manager;
```

The tables do not need to be created manually.

### Step 2: Configure Environment Variables

Set the following environment variables in IntelliJ IDEA Run Configuration:

```text
DB_URL=jdbc:postgresql://localhost:5432/personal_finance_manager
DB_USERNAME=postgres
DB_PASSWORD=your_local_password
```

The password must not be committed to Git.

### Step 3: Run Application

On Windows:

```bash
mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

Alternatively, run `Application.java` from IntelliJ IDEA.

Liquibase automatically creates the database structure on application startup.

## Database Documentation

- [Architecture](docs/architecture.md)
- [Data Dictionary](docs/DATA_DICTIONARY.md)
- [Logical Database Schema](docs/LOGICAL_SCHEMA.md)
- [Database Diagram](docs/DB_Scheme1.jpg)

## Database Migrations

Liquibase master changelog:

`src/main/resources/database/changelog/db.changelog-master.yaml`

Initial database migration:

`src/main/resources/database/changelog/V1.0/init-scheme.yaml`

The database structure is created using version-controlled migrations, not manually.

## Security

Database credentials and external service secrets are configured using environment variables and must not be stored in the repository.
