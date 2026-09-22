# ARCHITECTURE — Personal Finance Manager

## 1. Назначение документа

Этот файл описывает архитектуру дипломного проекта **Personal Finance Manager**:

- какие части есть в системе;
- за что отвечает каждая часть;
- как компоненты взаимодействуют между собой;
- какие данные куда идут;
- где находится основная бизнес-логика;
- где находится ML-логика;
- как проект будет запускаться и разворачиваться.

Главная цель архитектуры — сделать проект понятным до начала активной разработки.

---

## 2. Общая архитектура системы

На высоком уровне приложение состоит из четырёх основных компонентов:

```text
                    ┌──────────────────┐
                    │      User        │
                    │   Web Browser    │
                    └────────┬─────────┘
                             │
                             │ HTTPS
                             ↓
                    ┌──────────────────┐
                    │      React       │
                    │     Frontend     │
                    └────────┬─────────┘
                             │
                             │ REST API / JSON
                             ↓
                    ┌──────────────────┐
                    │   Spring Boot    │
                    │   Java Backend   │
                    └───────┬─────┬────┘
                            │     │
                       SQL  │     │ HTTP
                            │     │
                            ↓     ↓
                  ┌────────────┐  ┌──────────────────┐
                  │ PostgreSQL │  │ Python ML Service│
                  │  Database  │  │     FastAPI      │
                  └────────────┘  └────────┬─────────┘
                                           │
                                           ↓
                                  ┌──────────────────┐
                                  │   ML Model       │
                                  │ Receipt Analysis │
                                  └──────────────────┘
```

---

## 3. Роль каждого компонента

### 3.1. React Frontend

Frontend — это часть приложения, которую видит пользователь.

Основные задачи:

- регистрация и вход;
- отображение dashboard;
- формы для доходов и расходов;
- просмотр списка транзакций;
- работа с категориями;
- создание бюджетов;
- создание финансовых целей;
- отображение графиков и статистики;
- загрузка фотографии чека;
- отображение результата распознавания;
- подтверждение или исправление данных.

Frontend **не должен содержать основную бизнес-логику**.

Например frontend может показать:

```text
Budget: 300 EUR
Spent: 220 EUR
Remaining: 80 EUR
```

Но вычисление `Remaining` желательно выполнять на backend.

---

## 4. Spring Boot Backend

Spring Boot — главный компонент системы.

Именно backend отвечает за основную бизнес-логику.

Примерная ответственность:

```text
Spring Boot
│
├── Authentication
├── Users
├── Transactions
├── Categories
├── Budgets
├── Financial Goals
├── Analytics
├── Receipt Processing
├── Database Access
├── Security
└── Communication with ML Service
```

Backend:

- принимает запросы frontend;
- проверяет данные;
- проверяет права пользователя;
- выполняет бизнес-логику;
- читает и сохраняет данные в PostgreSQL;
- при необходимости отправляет чек в Python ML Service;
- возвращает результат frontend.

---

## 5. PostgreSQL

PostgreSQL хранит постоянные данные приложения.

Предварительно база будет содержать:

```text
users
categories
transactions
budgets
financial_goals
receipts
```

Возможны дополнительные таблицы после проектирования БД.

PostgreSQL отвечает только за хранение данных.

Бизнес-правила не должны находиться в базе без необходимости.

Например:

```text
"Пользователь не может получить транзакции другого пользователя"
```

это правило backend, а не PostgreSQL.

---

## 6. Python ML Service

Python-сервис существует отдельно от Java backend.

Его основная задача:

> обработать изображение чека и вернуть структурированные данные.

Пример:

```text
Input:
receipt.jpg

Output:
{
  "merchant": "LIDL",
  "date": "2026-09-21",
  "total": 24.73,
  "currency": "EUR"
}
```

Python Service:

- принимает изображение;
- выполняет preprocessing при необходимости;
- запускает ML-модель;
- преобразует результат модели в JSON;
- возвращает результат Spring Boot.

Python-сервис **не должен** заниматься:

- регистрацией пользователей;
- бюджетами;
- финансовыми целями;
- основными транзакциями;
- общей бизнес-логикой приложения.

Это остаётся в Java.

---

## 7. Почему ML вынесен отдельно

ML часть отделяется от Java backend по нескольким причинам.

### Причина 1 — Python ecosystem

Большинство библиотек для ML проще использовать в Python:

```text
PyTorch
Transformers
Hugging Face
FastAPI
```

### Причина 2 — независимость компонентов

Spring Boot может развиваться независимо от ML-модели.

### Причина 3 — отдельное масштабирование

В будущем можно отдельно масштабировать ML Service.

### Причина 4 — архитектурная ясность

Java отвечает за бизнес-логику.

Python отвечает за ML.

---

## 8. Взаимодействие компонентов

### Обычный запрос

Например пользователь хочет получить список своих расходов.

```text
React
  │
  │ GET /api/transactions
  ↓
Spring Boot
  │
  │ SQL query
  ↓
PostgreSQL
  │
  │ rows
  ↑
Spring Boot
  │
  │ JSON
  ↑
React
```

---

## 9. Сценарий: добавление расхода вручную

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

Пример запроса:

```json
{
  "type": "EXPENSE",
  "amount": 15.60,
  "categoryId": 3,
  "date": "2026-09-21",
  "description": "Lunch"
}
```

---

## 10. Сценарий: загрузка чека

Это один из наиболее важных сценариев проекта.

```text
User
 ↓
React
 ↓
POST /api/receipts
 ↓
Spring Boot
 ↓
Python ML Service
 ↓
ML Model
 ↓
Python ML Service
 ↓
Spring Boot
 ↓
React
 ↓
User confirms data
 ↓
Spring Boot
 ↓
PostgreSQL
```

Подробно:

1. Пользователь загружает фото.
2. React отправляет файл Spring Boot.
3. Spring Boot проверяет файл.
4. Spring Boot отправляет его Python Service.
5. Python Service запускает ML-модель.
6. ML-модель возвращает найденные поля.
7. Python формирует JSON.
8. Spring Boot получает результат.
9. React показывает результат пользователю.
10. Пользователь исправляет данные при необходимости.
11. После подтверждения Spring Boot создаёт Transaction.
12. Данные сохраняются в PostgreSQL.

---

## 11. Почему не сохранять распознанный чек автоматически

ML-модель может ошибаться.

Поэтому лучше использовать схему:

```text
Recognition
   ↓
Preview
   ↓
User confirmation
   ↓
Save
```

Это позволяет избежать ошибочных транзакций.

---

## 12. Backend layering

Внутри Spring Boot проект желательно разделить на слои.

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
DELETE /api/transactions/{id}
```

Controller не должен содержать сложную бизнес-логику.

### Service

Главное место бизнес-логики.

Пример:

```text
TransactionService
BudgetService
GoalService
ReceiptService
AnalyticsService
```

Именно Service решает:

- можно ли выполнить действие;
- что нужно посчитать;
- какие данные сохранить;
- какие другие сервисы вызвать.

### Repository

Работает с базой данных.

Пример:

```text
UserRepository
TransactionRepository
CategoryRepository
BudgetRepository
GoalRepository
ReceiptRepository
```

Repository не решает бизнес-задачи.

Он предоставляет доступ к данным.

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
        │       └── client/
        │
        └── resources/
            ├── application.yml
            └── db/
                └── migration/
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

Пример страниц:

```text
LoginPage
RegisterPage
DashboardPage
TransactionsPage
CategoriesPage
BudgetsPage
GoalsPage
AnalyticsPage
ReceiptUploadPage
```

---

## 15. Предварительная структура ML Service

```text
ml-service/
├── app/
│   ├── main.py
│   ├── api/
│   ├── service/
│   ├── model/
│   └── schemas/
│
├── training/
│   ├── dataset/
│   ├── scripts/
│   └── notebooks/
│
├── requirements.txt
└── Dockerfile
```

Логически ML-проект можно разделить на две части:

```text
training/
```

для fine-tuning,

и:

```text
app/
```

для запуска уже обученной модели.

---

## 16. API между frontend и backend

Frontend общается только с Spring Boot.

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

React **не должен напрямую обращаться к PostgreSQL**.

React также желательно **не должен напрямую обращаться к Python ML Service**.

Правильный путь:

```text
React
 ↓
Spring Boot
 ↓
Python
```

Spring Boot остаётся единым входом в backend.

---

## 17. API между Java и Python

Spring Boot вызывает Python ML Service через HTTP.

Пример:

```text
POST /recognize
```

Input:

```text
multipart/form-data
file = receipt.jpg
```

Output:

```json
{
  "merchant": "LIDL",
  "date": "2026-09-21",
  "total": 24.73,
  "currency": "EUR"
}
```

В Spring Boot для этого позже можно использовать:

- RestClient;
- WebClient.

Выбор можно сделать позже.

---

## 18. Authentication и Security

Пользователь должен иметь доступ только к своим данным.

Общая схема:

```text
Register
   ↓
Login
   ↓
Authentication
   ↓
Protected API
```

Spring Security будет проверять пользователя перед доступом к защищённым endpoints.

Например:

```text
User A
```

не должен получить:

```text
transactions of User B
```

даже если вручную подставит чужой ID в запрос.

---

## 19. DTO

Frontend не должен напрямую работать с Entity из базы данных.

Для обмена данными будут использоваться DTO.

Пример:

```text
Transaction Entity
        ↓
TransactionResponse DTO
        ↓
JSON
        ↓
React
```

Это помогает:

- скрывать ненужные поля;
- контролировать формат API;
- отдельно валидировать входящие данные;
- не связывать структуру БД напрямую с frontend.

---

## 20. Database migrations

Структура базы будет контролироваться через Flyway.

```text
V1__init.sql
V2__add_receipts.sql
V3__add_indexes.sql
```

Процесс:

```text
Application start
      ↓
Flyway checks migrations
      ↓
Missing migrations are executed
      ↓
Database is updated
```

Это позволяет одинаково создавать структуру БД на разных компьютерах.

---

## 21. Containerization architecture

Позже каждый основной компонент можно запускать в отдельном Docker container.

```text
Docker Compose
│
├── frontend
├── backend
├── ml-service
└── postgres
```

Общая схема:

```text
┌──────────────── Docker Network ────────────────┐
│                                               │
│ React  ──────→ Spring Boot ──────→ PostgreSQL │
│                    │                          │
│                    └────────→ Python ML       │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 22. Почему отдельный container для каждого компонента

Так каждый компонент:

- имеет собственное окружение;
- может обновляться отдельно;
- имеет свои зависимости;
- не мешает другим компонентам;
- проще запускать на другой машине.

Например:

```text
backend container
→ Java

ml-service container
→ Python + PyTorch

postgres container
→ PostgreSQL
```

---

## 23. CI/CD architecture

GitHub Actions может использоваться для автоматизации.

Примерный pipeline:

```text
git push / pull request
        ↓
Backend build
        ↓
Backend tests
        ↓
Frontend build/tests
        ↓
ML Service checks
        ↓
Docker build
        ↓
Deployment
```

Если тесты не проходят:

```text
Tests FAILED
     ↓
Deployment STOPPED
```

Deployment можно добавить после того, как основное приложение будет готово.

---

## 24. Testing architecture

Тестирование будет находиться на нескольких уровнях.

### Unit tests

Проверка отдельных Java-классов.

Пример:

```text
BudgetServiceTest
TransactionServiceTest
```

### Integration tests

Проверка нескольких компонентов вместе.

Например:

```text
Spring Boot + PostgreSQL
```

### API tests

Проверка endpoints.

### ML evaluation

Отдельная оценка качества модели.

Например:

```text
Before fine-tuning
vs
After fine-tuning
```

---

## 25. Ошибки и обработка ошибок

Backend должен возвращать понятные HTTP status codes.

Пример:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

Например если Python ML Service недоступен:

```text
ReceiptService
   ↓
ML Service unavailable
   ↓
Spring handles error
   ↓
User sees:
"Не удалось распознать чек. Попробуйте позже."
```

Приложение не должно полностью падать из-за недоступности ML Service.

---

## 26. Архитектурный принцип: ML не должен быть обязательным для всей системы

Основной Personal Finance Manager должен работать даже без ML.

То есть:

```text
Manual transactions ✅
Budgets ✅
Goals ✅
Analytics ✅
```

могут работать независимо.

Если ML Service временно не работает:

```text
Receipt Recognition ❌
```

но остальная система продолжает работать.

Это важное архитектурное решение.

---

## 27. Основные сущности системы

Пока предполагаются следующие основные сущности:

```text
User
Category
Transaction
Budget
FinancialGoal
Receipt
```

Связи будут окончательно определены в `DATABASE.md`.

Предварительно:

```text
User
│
├── Categories
├── Transactions
├── Budgets
├── FinancialGoals
└── Receipts
```

---

## 28. Основная бизнес-логика

Примеры логики, которая будет находиться в Spring Boot:

### Transaction

- принадлежит конкретному пользователю;
- имеет тип income или expense;
- имеет сумму;
- может иметь категорию;
- входит в статистику.

### Budget

- относится к пользователю;
- может относиться к категории;
- имеет лимит;
- имеет период;
- рассчитывает использованную сумму.

### Financial Goal

- имеет целевую сумму;
- имеет текущий прогресс;
- принадлежит пользователю.

### Receipt

- относится к пользователю;
- содержит данные распознавания;
- может быть связан с Transaction.

---

## 29. Возможные дополнительные функции

Если основной проект окажется недостаточно сложным, архитектура должна позволять добавить:

### Recurring Payments

```text
Transaction History
        ↓
Analysis
        ↓
Recurring Payments
```

### Spending Anomaly Detection

```text
Historical Expenses
        ↓
Normal Spending Level
        ↓
Current Spending
        ↓
Alert
```

### Spending Forecast

```text
Previous Months
       ↓
Analysis / ML
       ↓
Future Expense Forecast
```

Эти функции не должны усложнять начальную версию проекта.

---

## 30. Что будет разрабатываться сначала

Архитектура предполагает следующий порядок:

```text
1. Database Design
       ↓
2. Spring Boot + PostgreSQL
       ↓
3. Core Backend
       ↓
4. Authentication
       ↓
5. Transactions / Categories
       ↓
6. Budgets / Goals / Analytics
       ↓
7. React Frontend
       ↓
8. ML Research
       ↓
9. Python Service
       ↓
10. Java + Python Integration
       ↓
11. Docker
       ↓
12. CI/CD
```

---

## 31. Что пока НЕ фиксируется окончательно

Следующие решения можно принять позже:

- конкретная pretrained ML-модель;
- конкретный dataset;
- JWT или другой механизм авторизации;
- RestClient или WebClient;
- библиотека графиков на frontend;
- способ deployment;
- cloud provider;
- точный формат хранения изображений чеков;
- будет ли Java backend multi-module Maven проектом.

Не нужно принимать все архитектурные решения заранее.

---

## 32. Итоговая схема проекта

```text
                         USER
                          │
                          ↓
                   ┌─────────────┐
                   │    React    │
                   │  Frontend   │
                   └──────┬──────┘
                          │
                       REST API
                          │
                          ↓
                   ┌─────────────┐
                   │ Spring Boot │
                   │   Backend   │
                   └───┬─────┬───┘
                       │     │
             JPA / SQL │     │ HTTP
                       │     │
                       ↓     ↓
                ┌──────────┐ ┌───────────────┐
                │PostgreSQL│ │ Python FastAPI│
                └──────────┘ └───────┬───────┘
                                     │
                                     ↓
                              ┌─────────────┐
                              │ Fine-tuned  │
                              │  ML Model   │
                              └─────────────┘


                   Infrastructure

               Docker + Docker Compose
                        │
                 GitHub Actions
                        │
                      CI/CD
```

---

## 33. Главное архитектурное правило проекта

У каждого компонента должна быть понятная ответственность:

```text
React
→ отображение и действия пользователя

Spring Boot
→ бизнес-логика и основной API

PostgreSQL
→ хранение данных

Python
→ ML inference

ML model
→ распознавание данных чека

Docker
→ запуск окружения

CI/CD
→ автоматизация сборки, тестирования и deployment
```

Если при разработке непонятно, куда должна относиться новая логика, сначала нужно определить, **какой компонент отвечает за эту задачу**, и только потом писать код.
