# Backend API documentation

**Version 0.0.1 — development snapshot, 25 November 2026.**

The reference covers all 13 HTTP operations in UserController, TransactionController and ReceiptController. It describes the Java Spring Boot backend, not the independent front-end mock API.

## Navigation

- [Getting started](guides/GETTING_STARTED.md): local setup and development data.
- [Integration tutorial](guides/INTEGRATION.md): transaction lifecycle and receipt upload.
- [OpenAPI 3.0.3 specification](openapi.yaml): machine-readable contract and data models.
- [Endpoint reference](reference/ENDPOINTS.md): requests, responses, status codes and examples for every operation.
- [Architecture and service interactions](guides/ARCHITECTURE.md).
- [Security, errors and API design](guides/DESIGN.md).
- [Documentation strategy and validation](STRATEGY.md).
- [Changelog](CHANGELOG.md).
- [Postman collection](examples/postman_collection.json): import the collection and configure local resource identifiers. Deletion requests modify stored data.

## Scope and verification

The Java compilation and existing Maven tests passed locally on November 25, 2026.

A total of 16 tests passed, including 15 UserService tests and one placeholder application test.

The documentation was checked against the controller and service source code. Response examples are illustrative and have not been captured from live HTTP requests.

HTTP authentication is not implemented in the current development version. Do not expose this API publicly or use real financial data.

Registration, category HTTP operations, receipt status and result endpoints, and other planned resources are not documented as implemented features.

## Specification validation

The OpenAPI specification was successfully validated locally on November 25, 2026 using Redocly CLI.

Run the following command from the project root:

```bash
npx --yes @redocly/cli lint docs/api/openapi.yaml --extends minimal
```

### Validation results

| Metric | Result |
| --- | --- |
| OpenAPI version | 3.0.3 |
| Documented HTTP operations | 13 |
| Specification validity | PASS |
| Validation errors | 0 |
| Validation warnings | 1 |
| Validation duration | 140 ms |

The remaining warning concerns the localhost server URL. This address is intentional because the API is currently intended for local development.

An automated specification validation workflow is provided in `.github/workflows/api-documentation.yml`.

## Known limitations

- HTTP authentication and authorization are not yet implemented.
- Pagination, rate limiting and idempotency keys are not currently supported.
- Planned API improvements are described separately in the design guide.
- Live HTTP integration testing has not yet been completed.
- Execution of the documentation validation workflow on GitHub Actions has not yet been confirmed.

Specification validation confirms the validity of the API description but does not replace runtime integration testing.
