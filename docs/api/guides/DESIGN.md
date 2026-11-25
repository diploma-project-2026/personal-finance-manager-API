# Security, errors and API design

## Authentication and authorization

Current behavior: `SecurityConfig` disables CSRF and permits every request. BCrypt is registered as a bean; the user service accepts an already hashed password, but there is no HTTP registration/login endpoint or token/session authentication. The transaction service checks that the transaction belongs to the supplied user ID, not that the caller owns that ID. Receipt completion does not authenticate the caller. Treat this as an insecure local prototype, not a production finance API. Do not expose it over the internet. Use synthetic data. Cloudinary upload signatures authorize a particular upload, not API identity. Never disclose Cloudinary API secrets; the returned public API key and signature are temporary upload parameters.

Proposed next version: authenticated registration/login with BCrypt password hashing, short-lived credentials or secure sessions, ownership checks derived from authenticated principal, TLS, appropriate CSRF policy for cookie sessions, and consistent 401/403 responses. These are not current features.

## Error taxonomy

| Status | Current source behavior | Recovery |
| --- | --- | --- |
| 400 | Invalid amount/date/currency input, malformed request, reversed date range | Correct input; retry only after correction |
| 404 | Transaction or user/currency lookup in transaction service fails; mismatched transaction user ID | Check identifiers; do not assume authorization |
| 500 | Unmapped user/receipt exceptions or persistence failures | Inspect local logs; avoid exposing stack traces; check whether the operation succeeded before retrying |

Spring's default error representation is used; `message` is not guaranteed to be included. Exact serialization and statuses have not been confirmed by live HTTP calls. User and receipt services currently throw unmapped exceptions; future work should map missing resources to 404, duplicates to 409 and invalid input to 400 using a centralized error handler. No custom error codes or RFC 9457 contract are implemented.

## Pagination and filtering

History is an unbounded array ordered by date descending; recent is limited to five. Equal dates have no guaranteed secondary ordering. Range filtering is inclusive; category filtering and description search are not HTTP features yet. Proposed pagination: stable `(transactionDate,id)` order, bounded page size, cursor or page metadata. Do not send unsupported page parameters expecting them to work.

## Rate limiting and retries

No application rate limiter is implemented. Proposed: per-user quota with HTTP 429 and Retry-After, especially for uploads. Provider quotas are separate. Retry reads with bounded backoff on transient failures; never assume POST retries are safe.

## Idempotency

POST transaction and upload-init create new records on each successful call. No idempotency key is implemented. Repeated upload-complete is rejected after the state changes, but is not a stable replay response. PUT targets a known ID and replaces transaction fields; user PUT updates only nonblank supplied fields. DELETE may return a different status on repetition. Proposed: store a caller-scoped idempotency key and request hash for creation, replay the original response for identical requests, reject mismatched payloads.

## Versioning

Current URLs use `/api`, with no URL version segment. OpenAPI `info.version` tracks the backend development contract (0.0.1), not an active `/v1` route. Maintain backward-compatible additions in minor releases, fixes in patches and breaking changes in a new major version; introduce `/api/v1` when publishing a stable contract. Announce deprecations and migration guides before removal. See [changelog](../CHANGELOG.md).
