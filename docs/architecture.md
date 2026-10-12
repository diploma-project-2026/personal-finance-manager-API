# ARCHITECTURE — Personal Finance Manager

## 1. Purpose of the Document

This document describes the architecture of the **Personal Finance Manager** diploma project:

- what components exist in the system;
- what each component is responsible for;
- how components interact;
- where structured data is stored;
- where receipt images are stored;
- how receipt processing works;
- how the two ML models work together;
- how processed receipt data is returned to the React frontend;
- how the project can be deployed and extended.

The main goal of the architecture is to keep responsibilities separated and make the system understandable before active implementation.

---

## 2. High-Level System Architecture

```text
┌───────────────────────────┐
│           User            │
└───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│       React Frontend      │
│        (Web Client)       │
└──────────┬─────────┬──────┘
           │         │
           │         │ upload / download files
           │         ▼
           │   ┌───────────────────────────┐
           │   │           MinIO           │
           │   │      Object Storage       │
           │   └───────────────────────────┘
           │                    ▲
 HTTP /    │                    │ read / write files
 REST API  │                    │
           ▼                    │
┌───────────────────────────┐   │
│    Spring Boot Backend    │   │
│        (REST API)         │   │
└─────────────┬─────────────┘   │
              │                 │
              │ JPA / SQL       │
              │ create job      │
              ▼                 │
┌───────────────────────────┐   │
│        PostgreSQL         │   │
│         Database          │   │
└─────────────▲─────────────┘   │
              │                 │
              │ poll PENDING    │
              │ jobs            │
              │                 │
              │ update          │
              │ status/result   │
              │                 │
              ▼                 │
         ┌───────────────────────────┐
         │     Python ML Worker      │
         │                           │
         │  ┌─────────────────────┐  │
         │  │     ML Model 1      │  │
         │  │ Receipt Recognition │  │
         │  └──────────┬──────────┘  │
         │             │             │
         │             ▼             │
         │  ┌─────────────────────┐  │
         │  │     ML Model 2      │  │
         │  │ Item Classification │  │
         │  └─────────────────────┘  │
         └───────────────────────────┘
```

Main architectural rule:

> **Spring Boot and Python ML Worker do not call each other directly.**

Spring Boot creates and manages receipt records in PostgreSQL. Python ML Worker asynchronously finds receipts that need processing, processes them, and writes the results back to PostgreSQL.

Object Storage is used for receipt image files. React uploads/downloads receipt images there, and Python ML Worker accesses Object Storage directly to read and, if needed, write receipt files.

---

## 3. Component Responsibilities

### 3.1. React Frontend

React is the user-facing part of the system.

Main responsibilities:

- registration and login;
- dashboard;
- creating and viewing transactions;
- working with categories;
- managing budgets;
- managing financial goals;
- displaying analytics;
- uploading receipt images;
- displaying receipt processing status;
- displaying recognized receipt data;
- displaying line items and their categories;
- allowing the user to correct recognized data;
- confirming receipt processing results.

Frontend should not contain the main business logic.

React does not access PostgreSQL or Python ML Worker directly.

Structured data and business operations go through Spring Boot REST API.

Receipt image files are uploaded to and downloaded from Object Storage. Python ML Worker also accesses Object Storage directly when it needs to read a receipt image for ML processing.

---

## 4. Spring Boot Backend

Spring Boot is the main backend component.

It is responsible for:

```text
Spring Boot
│
├── Authentication
├── Users
├── Transactions
├── Categories
├── Budgets
├── Financial Goals
├── Goal Contributions
├── Analytics
├── Receipt Management
├── Line Item Management
├── Database Access
└── Security
```

Backend responsibilities:

- receives requests from React;
- validates input data;
- checks user permissions;
- executes business logic;
- works with PostgreSQL;
- creates receipt records;
- returns receipt IDs to the frontend;
- provides receipt processing status;
- returns processed receipt data with line items;
- accepts user corrections;
- creates a Transaction after user confirmation;
- links a confirmed Receipt to a Transaction.

Spring Boot does not run ML models and does not call Python directly.

---

## 5. PostgreSQL

PostgreSQL stores structured application data.

Main tables:

```text
users
currencies
categories
transactions
receipts
line_items
budgets
financial_goals
goal_contributions
transaction_conversions
```

Receipt images themselves are not stored in PostgreSQL.

Only the Object Storage key is stored in the database.

Example:

```text
storage_key = receipts/42/123/receipt.jpg
```

---

## 6. Receipt Entity

`Receipt` represents one receipt document as a whole.

Example:

```text
Receipt #123

merchant = Lidl
date = 2026-10-11
total = 52.40 EUR
status = PROCESSED
storage_key = receipts/42/123/receipt.jpg
```

Typical receipt fields:

```text
id
user_id
transaction_id
storage_key
status
recognized_merchant
recognized_date
recognized_total
recognized_currency_code
created_at
processed_at
```

A Receipt can contain many LineItems.

---

## 7. Line Items

`LineItem` represents one individual product or purchase position from a receipt.

Example receipt:

```text
Lidl

Milk        2.20
Bread       1.50
T-Shirt    19.90
LEGO       28.80
```

Database representation:

```text
Receipt #123
 │
 ├── LineItem: Milk
 ├── LineItem: Bread
 ├── LineItem: T-Shirt
 └── LineItem: LEGO
```

Each LineItem contains fields such as:

```text
id
receipt_id
category_id
name
quantity
unit_price
total_amount
created_at
updated_at
```

The important rule is:

> **Category belongs to a LineItem, not to the whole Receipt and not to the whole Transaction.**

Example:

```text
Milk       → Food
Bread      → Food
T-Shirt    → Clothing
LEGO       → Toys
```

This allows one receipt to contain purchases from multiple categories.

---

## 8. Transaction Entity

`Transaction` represents the overall financial operation.

Example:

```text
Transaction #500

amount = 52.40 EUR
date = 2026-10-11
description = Lidl
```

The transaction stores the total amount of money spent.

The detailed breakdown is stored through:

```text
Transaction
    │
    ▼
Receipt
    │
    ▼
LineItems
    │
    ▼
Categories
```

Example:

```text
Transaction #500
52.40 EUR
      │
      ▼
Receipt #123
      │
      ├── Milk       2.20  → Food
      ├── Bread      1.50  → Food
      ├── T-Shirt   19.90  → Clothing
      └── LEGO      28.80  → Toys
```

This makes analytics more accurate because expenses can be calculated by individual line-item categories.

---

## 9. Object Storage

Receipt images are stored separately in S3-compatible Object Storage.

Possible environments:

```text
Development:
MinIO

Production:
Amazon S3
```

Example object key:

```text
receipts/42/123/receipt.jpg
```

PostgreSQL stores only the key:

```text
storage_key = receipts/42/123/receipt.jpg
```

Separation:

```text
PostgreSQL
→ structured data

Object Storage
→ receipt image files
```

---

## 10. Python ML Worker

Python works as an independent asynchronous worker.

Its responsibility is receipt processing only.

High-level flow:

```text
find receipt
↓
download image
↓
ML Model 1
↓
ML Model 2
↓
save result
```

Detailed flow:

1. periodically checks PostgreSQL;
2. finds a Receipt waiting for processing;
3. atomically changes its status to `PROCESSING`;
4. obtains the `storage_key`;
5. downloads the image from Object Storage;
6. performs preprocessing if needed;
7. sends the image to ML Model 1;
8. receives merchant, date, total, and line items;
9. sends recognized line items to ML Model 2;
10. receives a category for each line item;
11. writes Receipt data to PostgreSQL;
12. writes LineItems and categories to PostgreSQL;
13. changes receipt status to `PROCESSED`;
14. on error changes the status to `FAILED`.

Python Worker does not create Transactions and does not execute the main application business logic.

---

## 11. ML Model 1 — Receipt Recognition

The first model works with the receipt image.

Input:

```text
receipt.jpg
```

Output:

```text
merchant
date
total
lineItems
```

Example:

```json
{
  "merchant": "Lidl",
  "date": "2026-10-11",
  "total": 52.40,
  "lineItems": [
    {
      "name": "Milk",
      "quantity": 1,
      "totalAmount": 2.20
    },
    {
      "name": "T-Shirt",
      "quantity": 1,
      "totalAmount": 19.90
    }
  ]
}
```

The responsibility of Model 1 is:

> **image → structured receipt data**

Model 1 does not assign business categories to products.

---

## 12. ML Model 2 — Item Classification

The second model does not work with the receipt image directly.

It receives recognized line items from Model 1.

Example input:

```text
Milk
T-Shirt
LEGO
```

Example output:

```text
Milk    → Food
T-Shirt → Clothing
LEGO    → Toys
```

The responsibility of Model 2 is:

> **line item text/data → category**

After both models finish, Python Worker has a complete structured result.

Example:

```json
{
  "merchant": "Lidl",
  "date": "2026-10-11",
  "total": 52.40,
  "lineItems": [
    {
      "name": "Milk",
      "totalAmount": 2.20,
      "category": "Food"
    },
    {
      "name": "T-Shirt",
      "totalAmount": 19.90,
      "category": "Clothing"
    }
  ]
}
```

---

## 13. Receipt Processing Statuses

A simple status flow:

```text
PENDING
   │
   ▼
PROCESSING
   │
   ├────────→ FAILED
   │
   ▼
PROCESSED
   │
   ▼
CONFIRMED
```

Meaning:

```text
PENDING
→ receipt exists and waits for ML processing

PROCESSING
→ Python ML Worker is processing the receipt

PROCESSED
→ recognition and classification are finished

FAILED
→ processing failed

CONFIRMED
→ user confirmed the result and Transaction was created
```

If later needed, more detailed upload statuses can be added:

```text
PENDING_UPLOAD
UPLOADED
```

---

## 14. Scenario: Manual Transaction Creation

```text
User
 ↓
React Form
 ↓
POST /api/transactions
 ↓
Spring Boot
 ↓
Validation
 ↓
Business Logic
 ↓
PostgreSQL
 ↓
Response
 ↓
React
```

Example request:

```json
{
  "amount": 15.60,
  "date": "2026-09-21",
  "description": "Lunch"
}
```

Manual transaction categorization can be handled separately from receipt line-item categorization depending on the final business rules.

---

## 15. Scenario: Receipt Upload and Processing

### Stage 1 — Create Receipt

The user selects a receipt image in React.

React sends a request to Spring Boot:

```text
POST /api/receipts
```

Spring Boot creates a Receipt record in PostgreSQL.

Example:

```text
Receipt
id = 123
status = PENDING
```

Spring Boot returns the receipt ID to React:

```json
{
  "id": 123,
  "status": "PENDING"
}
```

React now knows:

```text
receiptId = 123
```

---

### Stage 2 — Upload Image

The image is uploaded to Object Storage.

Conceptually:

```text
React
 ↓
Object Storage

receipt.jpg
```

The corresponding Receipt stores the object key:

```text
storage_key = receipts/42/123/receipt.jpg
```

A presigned URL approach may be used so React can upload directly to Object Storage without exposing storage credentials.

---

### Stage 3 — Python Processing

Python Worker finds:

```text
Receipt #123
status = PENDING
```

Then it changes the status:

```text
PENDING
↓
PROCESSING
```

Processing pipeline:

```text
Object Storage
      ↓
receipt image
      ↓
Python Worker
      ↓
ML Model 1
      ↓
merchant / date / total / lineItems
      ↓
ML Model 2
      ↓
categories for lineItems
      ↓
PostgreSQL
```

After successful processing:

```text
Receipt #123
status = PROCESSED
```

PostgreSQL contains both:

```text
Receipt data
+
LineItems with categories
```

---

## 16. How Processed Data Returns to React

This is an important part of the architecture.

React does not receive the result directly from Python Worker.

Instead, React communicates only with Spring Boot.

After React receives:

```text
receiptId = 123
```

it temporarily polls the backend:

```text
GET /api/receipts/123
```

For example, every few seconds while processing is active.

This is not a queue. It is a normal HTTP GET request used to check the current state.

While processing is still running, Spring Boot may return:

```json
{
  "id": 123,
  "status": "PROCESSING"
}
```

React displays a loading state:

```text
Processing receipt...
```

React later sends the same request again:

```text
GET /api/receipts/123
```

When Python Worker has finished and saved the result to PostgreSQL, Spring Boot reads the processed data and returns it to React.

Example response:

```json
{
  "id": 123,
  "status": "PROCESSED",
  "merchant": "Lidl",
  "date": "2026-10-11",
  "total": 52.40,
  "lineItems": [
    {
      "id": 1,
      "name": "Milk",
      "totalAmount": 2.20,
      "category": "Food"
    },
    {
      "id": 2,
      "name": "T-Shirt",
      "totalAmount": 19.90,
      "category": "Clothing"
    }
  ]
}
```

After receiving:

```text
status = PROCESSED
```

React stops polling and displays the recognized data to the user.

Complete return flow:

```text
Python Worker
      ↓
PostgreSQL
      ↑
Spring Boot
      ↑
GET /api/receipts/123
      ↑
React
```

React never calls Python Worker directly.

---

## 17. User Confirmation

After recognition, React displays a preview.

Example:

```text
Lidl
11 October 2026
Total: €52.40

Milk       €2.20   Food
Bread      €1.50   Food
T-Shirt   €19.90   Clothing
LEGO      €28.80   Toys
```

The user can correct:

- merchant;
- date;
- total;
- line-item name;
- quantity;
- price;
- category.

Then the user confirms the result.

Conceptual endpoint:

```text
POST /api/receipts/123/confirm
```

Spring Boot then:

```text
validates confirmed data
↓
creates Transaction
↓
links Receipt to Transaction
↓
changes receipt.status to CONFIRMED
```

---

## 18. Why Transaction Is Not Created Automatically

ML models can make mistakes.

Therefore the system uses this flow:

```text
Recognition
↓
Classification
↓
Preview
↓
User correction
↓
User confirmation
↓
Transaction creation
```

Python only performs recognition and classification.

Spring Boot creates the Transaction only after user confirmation.

---

## 19. Backend Layering

Spring Boot follows a layered structure:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

### Controller

Responsible for HTTP.

Examples:

```text
POST /api/transactions
GET /api/transactions
POST /api/receipts
GET /api/receipts/{id}
POST /api/receipts/{id}/confirm
```

### Service

Contains business logic.

Examples:

```text
TransactionService
CategoryService
BudgetService
GoalService
ReceiptService
LineItemService
AnalyticsService
```

### Repository

Works with PostgreSQL.

Examples:

```text
UserRepository
TransactionRepository
CategoryRepository
BudgetRepository
GoalRepository
ReceiptRepository
LineItemRepository
```

---

## 20. Preliminary Backend Structure

```text
backend/
└── src/
    └── main/
        ├── java/
        │   └── .../
        │       ├── controller/
        │       ├── service/
        │       ├── repository/
        │       ├── entity/
        │       ├── dto/
        │       ├── mapper/
        │       ├── config/
        │       ├── security/
        │       └── exception/
        │
        └── resources/
            ├── application.yml
            └── db/
                └── changelog/
```

---

## 21. Preliminary Frontend Structure

```text
frontend/
└── src/
    ├── pages/
    ├── components/
    ├── api/
    ├── hooks/
    ├── types/
    ├── utils/
    └── router/
```

Main pages may include:

```text
LoginPage
RegisterPage
DashboardPage
TransactionsPage
CategoriesPage
BudgetsPage
GoalsPage
ReceiptUploadPage
ReceiptReviewPage
```

---

## 22. Preliminary Python Worker Structure

```text
ml-worker/
├── app/
│   ├── worker.py
│   ├── database/
│   ├── storage/
│   ├── service/
│   └── model/
│       ├── receipt_recognition/
│       └── item_classification/
│
├── training/
│   ├── dataset/
│   ├── scripts/
│   └── notebooks/
│
├── requirements.txt
└── Dockerfile
```

`training/` is used for ML experiments and fine-tuning.

`app/` is used for production receipt processing.

FastAPI is not required because Spring Boot does not call Python directly.

---

## 23. API Between Frontend and Backend

For business operations and structured data, React communicates with Spring Boot.

Example API groups:

```text
/api/auth
/api/transactions
/api/categories
/api/budgets
/api/goals
/api/analytics
/api/receipts
```

React does not access directly:

```text
PostgreSQL
Python Worker
```

All structured receipt data, processing statuses, line items, and business operations go through Spring Boot.

---

## 24. Authentication and Security

Each user must have access only to their own data.

```text
Register
   ↓
Login
   ↓
Authentication
   ↓
Protected API
```

Spring Security should prevent access to another user's:

```text
transactions
budgets
goals
receipts
line_items
custom categories
```

Receipt images must not be publicly accessible.

Presigned URLs can be used for secure temporary upload/download access to Object Storage.

---

## 25. DTOs

Frontend should not work directly with JPA entities.

```text
Entity
   ↓
DTO
   ↓
JSON
   ↓
React
```

DTOs allow the backend to:

- hide internal fields;
- control API format;
- validate input;
- avoid coupling frontend to database structure;
- return Receipt together with nested LineItems.

Example processed receipt DTO:

```json
{
  "id": 123,
  "status": "PROCESSED",
  "merchant": "Lidl",
  "date": "2026-10-11",
  "total": 52.40,
  "lineItems": [
    {
      "id": 1,
      "name": "Milk",
      "amount": 2.20,
      "category": "Food"
    }
  ]
}
```

---

## 26. Database Migrations

Database structure is controlled through Liquibase.

Example:

```text
db/changelog/
│
├── db.changelog-master.yaml
├── 001-create-users.yaml
├── 002-create-categories.yaml
├── 003-create-transactions.yaml
├── 004-create-receipts.yaml
├── 005-create-line-items.yaml
└── ...
```

---

## 27. Containerization Architecture

```text
Docker Compose
│
├── frontend
├── backend
├── ml-worker
├── postgres
└── minio
```

General structure:

```text
┌──────────────────── Docker Network ────────────────────┐
│                                                       │
│ React ─────→ Spring Boot ─────→ PostgreSQL            │
│   │                                  ↑                 │
│   │                                  │ poll/update     │
│   ↓                                  │                 │
│ MinIO ←──────────────┐               │                 │
│                      │               │                 │
│               ┌──────┴──────────────────────┐          │
│               │      Python ML Worker       │          │
│               │                             │          │
│               │  ML Model 1                 │          │
│               │  Receipt Recognition        │          │
│               │          ↓                  │          │
│               │  ML Model 2                 │          │
│               │  Item Classification        │          │
│               └─────────────────────────────┘          │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 28. CI/CD Architecture

GitHub Actions can automate the build and deployment process.

```text
git push / pull request
        ↓
Backend build
        ↓
Backend tests
        ↓
Frontend build/tests
        ↓
Python checks/tests
        ↓
Docker build
        ↓
Deployment
```

---

## 29. Testing Architecture

### Unit Tests

```text
TransactionServiceTest
BudgetServiceTest
ReceiptServiceTest
LineItemServiceTest
```

### Integration Tests

```text
Spring Boot + PostgreSQL
React upload/download + Object Storage
Python Worker + PostgreSQL
Python Worker + Object Storage
ML Model 1 output handling
ML Model 2 classification handling
```

### API Tests

REST endpoint validation.

### ML Evaluation

Each ML model should be evaluated separately.

```text
Model 1
Receipt Recognition
before fine-tuning
vs
after fine-tuning
```

```text
Model 2
Item Classification
before fine-tuning
vs
after fine-tuning
```

---

## 30. Error Handling

Backend returns standard HTTP status codes:

```text
200 OK
201 Created
202 Accepted
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

If Python Worker is temporarily unavailable:

```text
Receipt remains:
status = PENDING
```

When the worker starts again, it can continue processing pending receipts.

If ML processing fails:

```text
status = FAILED
```

The main application should continue working even when ML processing is unavailable.

---

## 31. ML Is Not Required for the Entire Application

Even if Python Worker is unavailable:

```text
Manual Transactions ✅
Categories          ✅
Budgets             ✅
Financial Goals     ✅
Analytics           ✅
Receipt Upload      ✅
Receipt Recognition ⏳
Item Classification ⏳
```

The rest of the Personal Finance Manager remains operational.

---

## 32. Main Entities

```text
User
Category
Transaction
Budget
FinancialGoal
GoalContribution
Receipt
LineItem
```

Main relationships:

```text
User
│
├── Custom Categories
├── Transactions
├── Budgets
├── Financial Goals
└── Receipts

Financial Goal
│
└── Goal Contributions

Transaction
│
└── optional Receipt

Receipt
│
└── LineItems

LineItem
│
└── Category
```

---

## 33. Main Business Logic

### Transaction

- belongs to a user;
- contains the total amount;
- has a date;
- may contain a description;
- participates in financial statistics;
- may be linked to a Receipt.

### Category

- may be a default category;
- may belong to a specific user;
- may represent expense or income classification;
- is assigned to individual LineItems for receipt-based expenses.

### Budget

- belongs to a user;
- is related to a category;
- has a monthly limit;
- is used to calculate spent and remaining values.

### Financial Goal

- belongs to a user;
- has a target amount;
- may have a target date;
- contains contributions.

### Receipt

- belongs to a user;
- stores the Object Storage key;
- has a processing status;
- stores recognized receipt-level data;
- contains multiple LineItems;
- after confirmation may be linked to a Transaction.

### LineItem

- belongs to a Receipt;
- represents one product or purchase position;
- contains name, quantity, price, and amount;
- has its own category;
- is used for detailed spending analytics.

---

## 34. Analytics with Line Items

LineItems allow more accurate category analytics.

Example receipt:

```text
Milk        2.20 → Food
Bread       1.50 → Food
T-Shirt    19.90 → Clothing
LEGO       28.80 → Toys
```

Analytics can calculate:

```text
Food
2.20 + 1.50 = 3.70

Clothing
19.90

Toys
28.80
```

Even though there is only one Transaction for the total amount:

```text
52.40 EUR
```

---

## 35. Possible Future Improvements

Possible future extensions:

```text
Automatic retry for FAILED receipts
Multiple Python workers
RabbitMQ / Kafka / SQS
Recurring payments
Spending anomaly detection
Spending forecast
Advanced category recommendations
Manual category correction feedback loop
```

A message broker is not required for the first version because PostgreSQL can act as the source of receipt-processing jobs.

If the system needs higher throughput later, processing can be migrated to a dedicated queue.

---

## 36. Development Order

```text
1. Database Design
       ↓
2. Spring Boot + PostgreSQL
       ↓
3. Authentication
       ↓
4. Transactions / Categories
       ↓
5. Budgets / Goals / Analytics
       ↓
6. React Frontend
       ↓
7. Object Storage
       ↓
8. Receipt Upload
       ↓
9. ML Model 1 Research / Training
       ↓
10. ML Model 2 Research / Training
       ↓
11. Python Worker
       ↓
12. Async Receipt Processing
       ↓
13. Receipt Review / Confirmation
       ↓
14. Docker Compose
       ↓
15. CI/CD
```

---

## 37. Decisions That Can Be Finalized Later

The following can remain flexible during early development:

- specific pretrained model for receipt recognition;
- specific item-classification model;
- training datasets;
- JWT or another authentication mechanism;
- MinIO or Amazon S3 for production;
- cloud provider;
- deployment platform;
- retry strategy;
- number of Python workers;
- whether a message broker is needed later;
- exact polling interval used by React;
- exact polling interval used by Python Worker.

---

## 38. Main Architectural Rule

Each component has one clear responsibility:

```text
React
→ UI and user actions

Spring Boot
→ business logic and main REST API

PostgreSQL
→ structured application data and processing state

Object Storage
→ receipt image files

Python Worker
→ asynchronous receipt-processing orchestration

ML Model 1
→ receipt image recognition and data extraction

ML Model 2
→ line-item category classification

Docker
→ runtime environment

CI/CD
→ build, tests, and deployment
```

Main interaction rule:

```text
React ─────────────→ Spring Boot ─────────────→ PostgreSQL
  │                                              ↑
  │                                              │ poll/update
  ▼                                              │
Object Storage ←──────────────────────── Python Worker
                                             │
                                             ├─ ML Model 1
                                             │
                                             └─ ML Model 2
```

Spring Boot and Python remain independent from each other.

Their asynchronous interaction goes through PostgreSQL, while shared access to receipt image files is provided through Object Storage.

Processed receipt data returns to React only through Spring Boot REST API.
