# Endpoint reference

Examples use a disposable seeded user and transaction. IDs, receipt signatures and timestamps must be replaced with actual values. Error payloads are illustrative default Spring responses, not captured HTTP responses. Service exception reasons are listed even when Spring hides the message. See [setup](../guides/GETTING_STARTED.md).

## GET `/api/users/{id}`

Get user by ID

```bash
curl -i -X GET 'http://localhost:8080/api/users/1'
```

**200** — Successful response

```json
{
  "id": 1,
  "email": "review@example.test",
  "currencyCode": "EUR"
}
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1"
}
```

**500** — User not found (unmapped UserNotFoundException) Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1"
}
```

## PUT `/api/users/{id}`

Update nonblank email and preferred currency

```bash
curl -i -X PUT 'http://localhost:8080/api/users/1' -H 'Content-Type: application/json' -d '{"email": "updated@example.test", "currencyCode": "EUR"}'
```

**200** — Successful response

```json
{
  "id": 1,
  "email": "updated@example.test",
  "currencyCode": "EUR"
}
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1"
}
```

**500** — User not found; currency not found; or user already exists with this email Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1"
}
```

## DELETE `/api/users/{id}`

Delete user; foreign key constraints may prevent deletion

```bash
curl -i -X DELETE 'http://localhost:8080/api/users/1'
```

**204** — No content

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1"
}
```

## POST `/api/users/{userId}/transactions`

Create a positive-amount transaction

```bash
curl -i -X POST 'http://localhost:8080/api/users/1/transactions' -H 'Content-Type: application/json' -d '{"amount": 15.25, "currencyCode": "EUR", "transactionDate": "2026-11-25", "description": "Groceries"}'
```

**201** — Created

```json
{
  "id": 1,
  "userId": 1,
  "amount": 15.25,
  "currencyCode": "EUR",
  "transactionDate": "2026-11-25",
  "description": "Groceries"
}
```

**400** — Amount must be positive; transaction date is required; currency code is required; or malformed request Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions"
}
```

**404** — User not found or currency not found Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 404,
  "error": "Not Found",
  "path": "/api/users/1/transactions"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions"
}
```

## GET `/api/users/{userId}/transactions`

List transactions ordered by transaction date descending; unknown user returns empty array

```bash
curl -i -X GET 'http://localhost:8080/api/users/1/transactions'
```

**200** — Successful response

```json
[
  {
    "id": 1,
    "userId": 1,
    "amount": 15.25,
    "currencyCode": "EUR",
    "transactionDate": "2026-11-25",
    "description": "Groceries"
  }
]
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions"
}
```

## GET `/api/users/{userId}/transactions/recent`

Return up to five transactions by date descending

```bash
curl -i -X GET 'http://localhost:8080/api/users/1/transactions/recent'
```

**200** — Successful response

```json
[
  {
    "id": 1,
    "userId": 1,
    "amount": 15.25,
    "currencyCode": "EUR",
    "transactionDate": "2026-11-25",
    "description": "Groceries"
  }
]
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions/recent"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions/recent"
}
```

## GET `/api/users/{userId}/transactions/date/{date}`

List transactions for an ISO calendar date

```bash
curl -i -X GET 'http://localhost:8080/api/users/1/transactions/date/2026-11-25'
```

**200** — Successful response

```json
[
  {
    "id": 1,
    "userId": 1,
    "amount": 15.25,
    "currencyCode": "EUR",
    "transactionDate": "2026-11-25",
    "description": "Groceries"
  }
]
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions/date/2026-11-25"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions/date/2026-11-25"
}
```

## GET `/api/users/{userId}/transactions/filter`

List transactions in inclusive date range, ordered by date descending

```bash
curl -i -X GET 'http://localhost:8080/api/users/1/transactions/filter?from=2026-11-25&to=2026-11-25'
```

**200** — Successful response

```json
[
  {
    "id": 1,
    "userId": 1,
    "amount": 15.25,
    "currencyCode": "EUR",
    "transactionDate": "2026-11-25",
    "description": "Groceries"
  }
]
```

**400** — Invalid date range or missing/malformed date parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions/filter"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions/filter"
}
```

## GET `/api/users/{userId}/transactions/{transactionId}`

Get transaction belonging to supplied user ID

```bash
curl -i -X GET 'http://localhost:8080/api/users/1/transactions/1'
```

**200** — Successful response

```json
{
  "id": 1,
  "userId": 1,
  "amount": 15.25,
  "currencyCode": "EUR",
  "transactionDate": "2026-11-25",
  "description": "Groceries"
}
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions/1"
}
```

**404** — Transaction not found (including mismatched user ID) Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 404,
  "error": "Not Found",
  "path": "/api/users/1/transactions/1"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions/1"
}
```

## PUT `/api/users/{userId}/transactions/{transactionId}`

Replace transaction amount, currency, date and description

```bash
curl -i -X PUT 'http://localhost:8080/api/users/1/transactions/1' -H 'Content-Type: application/json' -d '{"amount": 20, "currencyCode": "EUR", "transactionDate": "2026-11-25", "description": "Groceries"}'
```

**200** — Successful response

```json
{
  "id": 1,
  "userId": 1,
  "amount": 20,
  "currencyCode": "EUR",
  "transactionDate": "2026-11-25",
  "description": "Groceries"
}
```

**400** — Amount must be positive; transaction date is required; currency code is required; or malformed request Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions/1"
}
```

**404** — Transaction not found or currency not found Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 404,
  "error": "Not Found",
  "path": "/api/users/1/transactions/1"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions/1"
}
```

## DELETE `/api/users/{userId}/transactions/{transactionId}`

Delete transaction belonging to supplied user ID

```bash
curl -i -X DELETE 'http://localhost:8080/api/users/1/transactions/1'
```

**204** — No content

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/users/1/transactions/1"
}
```

**404** — Transaction not found (including mismatched user ID) Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 404,
  "error": "Not Found",
  "path": "/api/users/1/transactions/1"
}
```

**500** — Unhandled service or persistence exception Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users/1/transactions/1"
}
```

## POST `/api/receipts/upload-init`

Create pending receipt and signed Cloudinary upload parameters

```bash
curl -i -X POST 'http://localhost:8080/api/receipts/upload-init?userId=1'
```

**200** — Successful response

```json
{
  "receiptId": 1,
  "status": "PENDING_UPLOAD",
  "uploadUrl": "https://api.cloudinary.com/v1_1/example/image/upload",
  "cloudName": "example",
  "apiKey": "EXAMPLE_KEY",
  "timestamp": 1795620000,
  "publicId": "receipts/1/example-uuid",
  "signature": "EXAMPLE_SIGNATURE"
}
```

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/receipts/upload-init"
}
```

**500** — User not found or upload signing/persistence failure Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/receipts/upload-init"
}
```

## POST `/api/receipts/{receiptId}/upload-complete`

Validate public ID and Cloudinary URL prefix and mark receipt UPLOADED

```bash
curl -i -X POST 'http://localhost:8080/api/receipts/1/upload-complete' -H 'Content-Type: application/json' -d '{"publicId": "receipts/1/example-uuid", "secureUrl": "https://res.cloudinary.com/example/image/upload/example.jpg"}'
```

**200** — Successful response

**400** — Malformed request or invalid parameter Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/receipts/1/upload-complete"
}
```

**500** — Receipt not found; receipt is not waiting for upload; invalid Cloudinary public id; missing or invalid Cloudinary URL Default Spring error response; message visibility depends on configuration.

```json
{
  "timestamp": "2026-11-25T20:00:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/receipts/1/upload-complete"
}
```
