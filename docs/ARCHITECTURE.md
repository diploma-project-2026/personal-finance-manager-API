# ARCHITECTURE — Personal Finance Manager

## 1. Назначение документа

Этот файл описывает архитектуру дипломного проекта **Personal Finance Manager**:

- какие компоненты есть в системе;
- за что отвечает каждый компонент;
- как компоненты взаимодействуют;
- где хранится структурированная информация;
- где хранятся изображения чеков;
- как выполняется ML-обработка чеков;
- как проект будет запускаться и разворачиваться.

Главная цель архитектуры — сделать проект понятным до начала активной разработки.

---

## 2. Итоговая архитектура системы

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
         │   ┌───────────────────┐   │
         │   │     ML Model      │   │
         │   │   ML Inference    │   │
         │   └───────────────────┘   │
         └───────────────────────────┘
```

Главное архитектурное решение:

> **Spring Boot и Python ML Worker не общаются напрямую.**

Spring Boot создаёт задачу в PostgreSQL, а Python ML Worker асинхронно забирает её оттуда и записывает результат обратно.

Object Storage используется отдельно для файлов чеков: React загружает файлы, а Python ML Worker читает их для обработки.

---

## 3. Роль каждого компонента

### 3.1. React Frontend

Frontend — часть приложения, которую видит пользователь.

Основные задачи:

- регистрация и вход;
- dashboard;
- создание и просмотр транзакций;
- работа с категориями;
- управление бюджетами;
- управление финансовыми целями;
- отображение статистики;
- загрузка фотографий чеков;
- отображение статуса обработки чека;
- просмотр и подтверждение распознанных данных.

Frontend не должен содержать основную бизнес-логику.

Для чеков frontend также напрямую работает с Object Storage: загружает изображение и при необходимости получает его обратно. Структурированные данные и бизнес-операции по-прежнему идут через Spring Boot.

---

## 4. Spring Boot Backend

Spring Boot — главный backend-компонент системы.

Он отвечает за:

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
├── Database Access
└── Security
```

Backend:

- принимает запросы frontend;
- проверяет данные;
- проверяет права пользователя;
- выполняет бизнес-логику;
- работает с PostgreSQL;
- сохраняет в PostgreSQL запись о чеке и создаёт задачу на ML-обработку;
- получает уже обработанные результаты чеков из PostgreSQL;
- после подтверждения пользователя создаёт Transaction.

Spring Boot не запускает ML-модель и не вызывает Python напрямую.

---

## 5. PostgreSQL

PostgreSQL хранит структурированные данные приложения.

Основные таблицы:

```text
users
categories
transactions
budgets
financial_goals
goal_contributions
receipts
```

В таблице `receipts` хранятся:

- пользователь;
- ссылка на Transaction;
- storage key изображения;
- статус обработки;
- распознанный магазин;
- распознанная дата;
- распознанная сумма;
- даты создания и обработки.

Сами изображения чеков в PostgreSQL не хранятся.

---

## 6. Object Storage

Изображения чеков хранятся отдельно в S3-compatible Object Storage.

Согласно основной схеме, React Frontend загружает и получает файлы напрямую из Object Storage, а Python ML Worker читает файлы оттуда для обработки. Spring Boot не передаёт сами бинарные файлы чеков через себя.

Варианты:

```text
Development:
MinIO

Production:
Amazon S3
```

Пример ключа:

```text
receipts/42/125/receipt.jpg
```

В PostgreSQL хранится только:

```text
storage_key = receipts/42/125/receipt.jpg
```

Разделение:

```text
PostgreSQL
→ structured data

Object Storage
→ receipt images
```

---

## 7. Python ML Worker

Python работает как отдельный асинхронный worker.

Он отвечает только за обработку чеков.

Python Worker:

1. периодически проверяет PostgreSQL;
2. ищет чек со статусом `PENDING`;
3. меняет статус на `PROCESSING`;
4. получает `storage_key`;
5. скачивает изображение из Object Storage;
6. запускает preprocessing;
7. запускает ML-модель;
8. получает merchant, date и total;
9. записывает результат обратно в PostgreSQL;
10. меняет статус на `PROCESSED`;
11. при ошибке меняет статус на `FAILED`.

Python не создаёт Transaction и не выполняет основную бизнес-логику приложения.

---

## 8. Статусы чека

```text
PENDING
    │
    ↓
PROCESSING
    │
    ├────────→ FAILED
    │
    ↓
PROCESSED
    │
    ↓
CONFIRMED
```

Значение статусов:

```text
PENDING
→ задача создана и ожидает обработки

PROCESSING
→ Python Worker обрабатывает чек

PROCESSED
→ данные успешно распознаны

FAILED
→ обработка завершилась ошибкой

CONFIRMED
→ пользователь подтвердил данные и создана Transaction
```

---

## 9. Сценарий: добавление транзакции вручную

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

Пример:

```json
{
  "amount": 15.60,
  "categoryId": 3,
  "date": "2026-09-21",
  "description": "Lunch"
}
```

Все денежные значения хранятся в EUR.

---

## 10. Сценарий: загрузка и обработка чека

### Этап 1 — загрузка

```text
User
 ↓
React
 ├────────────→ MinIO / Object Storage
 │               upload image
 │               receive storage_key
 │
 └────────────→ Spring Boot
                 POST /api/receipts
                 storage_key + metadata
                         ↓
                     PostgreSQL
                     save receipt
                     status = PENDING
```

После создания записи Spring Boot больше не участвует в ML-обработке. Python Worker самостоятельно забирает ожидающую задачу из PostgreSQL.

### Этап 2 — обработка

```text
┌───────────────────────────┐
│        PostgreSQL         │
└─────────────▲─────────────┘
              │
              │ poll PENDING receipt
              │ get storage_key
              │ update status/result
              │
              ▼
     ┌───────────────────────────┐
     │     Python ML Worker      │
     │                           │
     │   ┌───────────────────┐   │
     │   │     ML Model      │   │
     │   │   ML Inference    │   │
     │   └───────────────────┘   │
     └─────────────┬─────────────┘
                   │
                   │ read image
                   ▼
          ┌───────────────────┐
          │  Object Storage   │
          └───────────────────┘
```

ML Model является частью Python ML Worker, а не отдельным сетевым сервисом.

### Этап 3 — подтверждение

```text
React
 ↓
GET /api/receipts/{id}
 ↓
Spring Boot
 ↓
PostgreSQL
 ↓
recognized data
 ↓
React
 ↓
User confirms / edits
 ↓
Spring Boot
 ↓
Create Transaction
 ↓
receipt.status = CONFIRMED
```

---

## 11. Почему чек не сохраняется автоматически как Transaction

ML-модель может ошибаться.

Поэтому используется схема:

```text
Recognition
   ↓
Preview
   ↓
User correction
   ↓
User confirmation
   ↓
Create Transaction
```

Python только распознаёт данные.

Spring Boot создаёт Transaction только после подтверждения пользователя.

---

## 12. Backend Layering

Spring Boot делится на слои:

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

Отвечает за HTTP.

Пример:

```text
POST /api/transactions
GET /api/transactions
POST /api/receipts
GET /api/receipts/{id}
```

### Service

Содержит бизнес-логику.

Пример:

```text
TransactionService
CategoryService
BudgetService
GoalService
ReceiptService
AnalyticsService
```

### Repository

Работает с PostgreSQL.

Пример:

```text
UserRepository
TransactionRepository
CategoryRepository
BudgetRepository
GoalRepository
ReceiptRepository
```

---

## 13. Предварительная структура backend

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
        │       ├── exception/
        │
        └── resources/
            ├── application.yml
            └── db/
                └── changelog/
```

---

## 14. Предварительная структура frontend

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

Основные страницы:

```text
LoginPage
RegisterPage
DashboardPage
TransactionsPage
CategoriesPage
BudgetsPage
GoalsPage
ReceiptUploadPage
```

---

## 15. Предварительная структура Python Worker

```text
ml-worker/
├── app/
│   ├── worker.py
│   ├── database/
│   ├── storage/
│   ├── service/
│   └── model/
│
├── training/
│   ├── dataset/
│   ├── scripts/
│   └── notebooks/
│
├── requirements.txt
└── Dockerfile
```

`training/` используется для fine-tuning.

`app/` используется для обработки чеков.

FastAPI не обязателен, так как Spring Boot напрямую Python не вызывает.

---

## 16. API между frontend и backend

Для бизнес-API и структурированных данных frontend общается со Spring Boot.

Пример:

```text
/api/auth
/api/transactions
/api/categories
/api/budgets
/api/goals
/api/analytics
/api/receipts
```

React не обращается напрямую к:

```text
PostgreSQL
Python Worker
```

React напрямую работает с Object Storage только для upload/download файлов. Все структурированные данные, статусы обработки и бизнес-операции проходят через Spring Boot.

---

## 17. Authentication и Security

Пользователь должен иметь доступ только к своим данным.

```text
Register
   ↓
Login
   ↓
Authentication
   ↓
Protected API
```

Spring Security должен предотвращать доступ пользователя к чужим:

```text
transactions
budgets
goals
receipts
custom categories
```

Receipt images также не должны быть публично доступны.

---

## 18. DTO

Frontend не работает напрямую с Entity.

```text
Entity
   ↓
DTO
   ↓
JSON
   ↓
React
```

DTO позволяют:

- скрывать внутренние поля;
- контролировать формат API;
- валидировать входящие данные;
- не связывать frontend напрямую со структурой БД.

---

## 19. Database migrations

Структура базы контролируется через Liquibase.

Пример:

```text
db/changelog/
│
├── db.changelog-master.yaml
├── 001-create-users.yaml
├── 002-create-categories.yaml
├── 003-create-transactions.yaml
└── ...
```

---

## 20. Containerization Architecture

```text
Docker Compose
│
├── frontend
├── backend
├── ml-worker
├── postgres
└── minio
```

Общая схема:

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
│               │  ┌──────────────────────┐   │          │
│               │  │      ML Model        │   │          │
│               │  │    ML Inference      │   │          │
│               │  └──────────────────────┘   │          │
│               └─────────────────────────────┘          │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 21. CI/CD Architecture

GitHub Actions может использоваться для автоматизации.

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

## 22. Testing Architecture

### Unit Tests

```text
TransactionServiceTest
BudgetServiceTest
ReceiptServiceTest
```

### Integration Tests

```text
Spring Boot + PostgreSQL
React upload/download + MinIO
Python Worker + PostgreSQL
Python Worker + MinIO
```

### API Tests

Проверка REST endpoints.

### ML Evaluation

```text
Before fine-tuning
vs
After fine-tuning
```

---

## 23. Ошибки и обработка ошибок

Backend возвращает стандартные HTTP status codes:

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

Если Python Worker временно не работает:

```text
Receipt remains:
status = PENDING
```

Когда worker снова запустится, он сможет продолжить обработку.

---

## 24. ML не должен быть обязательным для всей системы

Даже если Python Worker не работает:

```text
Manual Transactions ✅
Categories          ✅
Budgets             ✅
Financial Goals     ✅
Analytics           ✅
Receipt Upload      ✅
Receipt Recognition ⏳
```

Основная часть Personal Finance Manager продолжает работать.

---

## 25. Основные сущности системы

```text
User
Category
Transaction
Budget
FinancialGoal
GoalContribution
Receipt
```

Предварительные связи:

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

Receipt
│
└── optional Transaction
```

---

## 26. Основная бизнес-логика

### Transaction

- принадлежит пользователю;
- содержит сумму;
- относится к категории;
- имеет дату;
- может иметь description;
- участвует в статистике.

### Category

- может быть default;
- может принадлежать конкретному пользователю;
- имеет тип INCOME или EXPENSE.

### Budget

- принадлежит пользователю;
- относится к категории;
- имеет месячный лимит;
- используется для расчёта spent и remaining.

### Financial Goal

- принадлежит пользователю;
- имеет target amount;
- может иметь target date;
- содержит contributions.

### Receipt

- принадлежит пользователю;
- содержит storage key;
- имеет processing status;
- содержит распознанные данные;
- после подтверждения может быть связан с Transaction.

---

## 27. Возможные дополнительные функции

Позже можно добавить:

```text
Automatic retry for FAILED receipts
Multiple Python workers
RabbitMQ / Kafka / SQS
Recurring payments
Spending anomaly detection
Spending forecast
```

Эти функции не нужны для первой версии проекта.

---

## 28. Порядок разработки

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
9. ML Research / Training
       ↓
10. Python Worker
       ↓
11. Async Receipt Processing
       ↓
12. Docker Compose
       ↓
13. CI/CD
```

---

## 29. Что пока не фиксируется окончательно

Можно решить позже:

- конкретную pretrained ML-модель;
- dataset;
- JWT или другой механизм авторизации;
- MinIO или Amazon S3 для production;
- cloud provider;
- deployment platform;
- retry strategy;
- количество Python workers;
- нужен ли в будущем message broker.

---

## 30. Главное архитектурное правило

У каждого компонента должна быть понятная ответственность:

```text
React
→ UI и действия пользователя

Spring Boot
→ бизнес-логика и основной API

PostgreSQL
→ структурированные данные и состояние обработки

Object Storage
→ изображения чеков

Python Worker
→ асинхронная обработка чеков

ML Model
→ распознавание данных чека

Docker
→ окружение

CI/CD
→ сборка, тестирование и deployment
```

Главное правило взаимодействия:

```text
React ─────────────→ Spring Boot ─────────────→ PostgreSQL
  │                                              ↑
  │                                              │ poll/update
  ▼                                              │
Object Storage ←──────────────────────── Python Worker
                                             │
                                             └─ ML Model
```

Spring Boot и Python не зависят друг от друга напрямую. Их асинхронное взаимодействие идёт через PostgreSQL, а общий доступ к файлам чеков обеспечивается через Object Storage.
