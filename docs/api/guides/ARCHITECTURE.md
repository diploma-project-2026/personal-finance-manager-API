# Architecture and interactions

```mermaid
flowchart LR
  Client[API client] -->|JSON HTTP| API[Spring Boot REST controllers]
  API --> Service[User / Transaction / Receipt services]
  Service --> JPA[Spring Data JPA]
  JPA --> DB[(PostgreSQL)]
  Service -->|Sign upload parameters locally| Sign[Cloudinary SDK]
  Client -->|Signed multipart upload| Cloud[Cloudinary]
  Worker[Python ML worker] -->|Poll and update receipts / line items| DB
  Worker -->|Download image| Cloud
```

The React review version currently uses its own mock API, not the Java API. PostgreSQL is the shared contract between the Java application and Python worker. Liquibase owns schema changes; the worker must agree on column names and receipt status values. User and transaction controllers map data to response records rather than expose password hashes or persistence entities directly.

## Transaction lifecycle

```mermaid
sequenceDiagram
  participant C as Client
  participant A as TransactionController
  participant S as TransactionService
  participant D as PostgreSQL
  C->>A: POST /api/users/{userId}/transactions
  A->>S: amount, currencyCode, transactionDate, description
  S->>S: Validate amount and date
  S->>D: Find user and currency
  S->>D: Save transaction
  S-->>A: Transaction
  A-->>C: 201 JSON response
```

## Receipt lifecycle

```mermaid
sequenceDiagram
  participant C as Client
  participant A as Java API
  participant D as PostgreSQL
  participant O as Cloudinary
  participant W as Python worker
  C->>A: POST upload-init
  A->>D: Insert PENDING_UPLOAD with public ID
  A-->>C: Signed upload parameters
  C->>O: Upload image
  O-->>C: public_id and secure_url
  C->>A: POST upload-complete
  A->>D: Save URL and UPLOADED
  A-->>C: 200 empty body
  W->>D: Claim UPLOADED receipt
  W->>O: Download image
  W->>D: Store result / line items and DONE or FAILED
```

The worker lifecycle is a source-level description, not an end-to-end verified contract. There is no implemented status/result read API. The API does not independently confirm that Cloudinary uploaded the file; it checks the supplied public ID and URL prefix.
