# Documentation strategy (written report section)

The documentation is maintained with the source code using OpenAPI 3.0.3 and Markdown. The API specification is the machine-readable reference; conceptual guides explain workflows, security and design tradeoffs. The `reference`, `guides` and `examples` folders separate lookup material from tutorials. JSON properties follow Java record camelCase names, resource paths retain the controller mappings, dates use ISO 8601 and operation IDs are unique verbs. Code examples use synthetic data and identify external prerequisites.

For each controller change, update the specification, reference, examples, guides and changelog together in the same pull request. Compare routes, verbs, status annotations, request/response records and service exceptions; run specification lint and live contract checks against a disposable database before release. Version changes according to the strategy in DESIGN.md. Markdown is the developer-accessible publication format; the specification can also be imported into Swagger Editor locally or a trusted environment without real credentials.

## Validation

Run from repository root (Node.js required):

```powershell
npx --yes @redocly/cli lint docs/api/openapi.yaml --extends minimal
```

Alternatively use Swagger Editor to load the YAML and inspect validation errors. A workflow is supplied to run Redocly on pushes and pull requests. Do not claim the lint passed until actual output is available. Local structural checks were performed during documentation preparation; the external validator was unavailable in that environment. The examples are derived from the source, not captured live responses. The existing Java compile and unit test runs succeeded separately; those are not API contract tests.

## Known gaps

Authentication/login is not implemented; the tutorial uses local synthetic database records. Error shape is not standardized or runtime-verified. Pagination, rate limiting and idempotency are design proposals. Category endpoints, receipt result/status endpoints and production front-end integration are not implemented in this snapshot. No live Cloudinary upload, Python worker integration or full HTTP contract test was performed. The collection is provided for manual exploration, not a passing automated contract test. These gaps should be addressed before publishing a production API.
