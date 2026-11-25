# Personal Finance Manager — Front-end

Stage 3 front-end review. React SPA based on the Business Analysis Appendix B mockups (B.5–B.9). English UI, synthetic demo data.

## Quick start

Requirements: Node.js 20+ and npm. From this directory:

```bash
npm install
npm run dev
```

Open http://localhost:5173 and select **Explore demo**. No backend, credentials or external services are required. Registration/login are also available for testing. Use fictional credentials only. Data is kept in server memory and resets when the server restarts. Do not deploy this mock server as a production finance application.

```bash
npm run build
npm run preview
npm test
npm run test:api
npx playwright install chromium
npm run test:e2e
npm run lint
npm run format
```

The Vite development and preview servers both mount the mock HTTP API. A static-only host will not support it. For review, local execution is sufficient; deployment is not included.

## Review guide

| Criterion                | Location / demonstration                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| SPA, bundler and routing | `src/main.tsx`, `vite.config.js`; eight lazy-loaded routes                                       |
| Component architecture   | `src/components`, `src/pages`, `src/models`, `src/services`, `src/store`, `src/styles`           |
| Local/global state       | Controlled form inputs, Redux Toolkit slice and async thunks                                     |
| API                      | `src/services/api.ts`, `server/mock.mjs`, [API contract](docs/API.md)                            |
| Forms and validation     | Record Expense, Budgets, Goals, Categories, Auth                                                 |
| Lists and filtering      | Transactions: search, category, month, sort                                                      |
| Error handling           | ErrorBoundary, request wrapper, Redux error toast, Settings simulation buttons                   |
| Loading                  | Global request indicator, Suspense, pending form states, receipt status polling                  |
| Responsive layout        | CSS grid, breakpoints 1050/720 px, mobile menu; keyboard focus and reduced motion                |
| Unit tests               | `src/components/*.test.tsx` (3 components, 5 cases)                                              |
| E2E tests                | `e2e/finance.spec.ts` (2 flows)                                                                  |
| Advanced directions      | Lazy route splitting; Redux Toolkit state; dark/light theme, SVG chart, custom component library |

[Architecture and navigation](docs/ARCHITECTURE.md) · [API documentation](docs/API.md)

## Scope and limitations

The mock server deliberately stands in for the planned Spring Boot REST API and Python ML worker. The receipt image is displayed, but OCR is simulated using explicitly labeled sample fields; no claim of real recognition accuracy is made. The mock server supports EUR only, and stores data in memory; production currency conversion, persistent storage, full receipt lifecycle integration, and production authentication hardening are not included. Demo sessions are separate and cookies are HTTP-only. The API contract is provisional and not guaranteed to match the existing Java endpoints. Do not use real financial data. The optional payment method/tags shown in the BA wireframe are not implemented. Accessibility and Lighthouse scores have not been independently measured.

## Verification status

The source was prepared in an environment without access to npm registry. Dependency installation, TypeScript build, React rendering, Vitest and Playwright must be run locally before submission. Do not represent the supplied tests as passing until they have been executed. See [verification log](docs/VERIFICATION.md).
