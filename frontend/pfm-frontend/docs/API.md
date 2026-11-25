# Mock HTTP API contract

Base URL `/api`. JSON bodies and responses; HTTP-only session cookie set by authentication. This is the front-end demonstration contract, not the confirmed Spring Boot API contract. All finance endpoints require an authenticated demo or registered session. Responses use camelCase fields. IDs are strings. Dates are ISO calendar dates, months `YYYY-MM`, monetary amounts EUR numbers.

| Method | Endpoint                                                          | Body                                                        | Response                                       |
| ------ | ----------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| POST   | `/demo`                                                           | none                                                        | User                                           |
| POST   | `/auth/register`                                                  | name, email, password (8+ chars)                            | User                                           |
| POST   | `/auth/login`                                                     | email, password                                             | User                                           |
| GET    | `/auth/me`                                                        | —                                                           | User                                           |
| POST   | `/auth/logout`                                                    | —                                                           | `{}`                                           |
| GET    | `/data`                                                           | —                                                           | Data snapshot                                  |
| GET    | `/transactions`, `/budgets`, `/goals`, `/categories`, `/receipts` | —                                                           | array                                          |
| GET    | `/{resource}/{id}`                                                | —                                                           | matching record                                |
| POST   | `/transactions`, `/budgets`, `/goals`, `/categories`              | resource fields without ID                                  | Data snapshot                                  |
| PATCH  | `/{resource}/{id}` (except receipts)                              | changed fields                                              | Data snapshot                                  |
| DELETE | `/{resource}/{id}`                                                | —                                                           | Data snapshot                                  |
| POST   | `/receipts`                                                       | fileName, image (base64 data URI), optional simulateFailure | Receipt                                        |
| POST   | `/receipts/{id}/confirm`                                          | reviewed expense fields                                     | Data snapshot; duplicate confirmation rejected |
| PATCH  | `/receipts/{id}`                                                  | merchant, date, amount, categoryId, items                   | Receipt                                        |
| GET    | `/simulate/{code}`                                                | —                                                           | simulated 401/403/404/500 error                |

## Schemas

See `src/models/index.ts` for authoritative client interfaces. `Data` contains currency, categories, transactions, budgets, goals and receipts arrays. `User` contains name/email only. `Category` has id/name/type (`income` or `expense`). `Transaction` has id/merchant/amount/date/categoryId/type/notes and optional items. `LineItem` has name/quantity/price. `Budget` has id/categoryId/month/limit. `Goal` has id/name/target/saved. `Receipt` has id/fileName/image/status/merchant/date/amount/categoryId/items.

### Example

```http
POST /api/transactions
Content-Type: application/json

{"merchant":"MAXIMA","amount":24.95,"date":"2026-11-25","categoryId":"food","type":"expense","notes":"","items":[]}
```

Successful response HTTP 200 (illustrative abbreviated snapshot; actual response includes all records):

```json
{
  "currency": "EUR",
  "categories": [{ "id": "food", "name": "Groceries", "type": "expense" }],
  "transactions": [
    {
      "id": "generated-id",
      "merchant": "MAXIMA",
      "amount": 24.95,
      "date": "2026-11-25",
      "categoryId": "food",
      "type": "expense",
      "notes": "",
      "items": []
    }
  ],
  "budgets": [],
  "goals": [],
  "receipts": []
}
```

Errors use `{"message":"..."}`. 400 invalid input; 401 unauthenticated/invalid login; 403 forbidden (simulation); 404 missing resource; 409 duplicate account or category in use; 500 unexpected failure. The client maps these to understandable messages, logs errors and provides retry controls. The mock receipt endpoint transitions PROCESSING → DONE after a short delay and returns fixed sample fields, not OCR results. The optional simulateFailure flag transitions to FAILED instead. Confirming a receipt creates a transaction and links it to the receipt in one server operation.
