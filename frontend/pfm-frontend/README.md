# Personal Finance Manager — Front-end

Stage 3 front-end review. React SPA based on the Business Analysis Appendix B mockups (B.5–B.9). English UI with synthetic demo data.

## Quick start

Requirements: Node.js 20+ and npm.

Run the following commands from the front-end directory:

```bash
npm ci
npm run dev
```

Open http://localhost:5173 and select **Explore demo**.

No external backend, credentials or external services are required. Registration and login are also available for testing.

Use fictional credentials only. Data is kept in server memory and resets when the server restarts. Do not deploy this mock server as a production finance application.

## Build and preview

```bash
npm run build
npm run preview
```

The Vite development and preview servers both mount the mock HTTP API. A static-only host will not support it.

For the front-end review, local execution is sufficient. Public deployment is not included.

## Testing and code quality

Run the following commands from the front-end directory:

```bash
npm run test
npm run test:api
npx playwright install chromium
npm run test:e2e
npm run lint
npx prettier --check .
```

To automatically format the source code:

```bash
npm run format
```

## Technology stack

| Technology            | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| React                 | Component-based single-page application                  |
| TypeScript            | Static typing and maintainable application models        |
| Vite                  | Development server and production bundling               |
| React Router          | Client-side routing and navigation                       |
| Redux Toolkit         | Centralized state management and asynchronous operations |
| CSS                   | Responsive layouts, themes and reusable styles           |
| Vitest                | Automated unit and component testing                     |
| React Testing Library | Testing component behavior                               |
| Playwright            | End-to-end browser testing                               |
| ESLint                | Static code analysis                                     |
| Prettier              | Consistent code formatting                               |
| Mock HTTP API         | Independent front-end development and testing            |

Detailed technology justification and architectural decisions are available in the [architecture documentation](docs/ARCHITECTURE.md).

## Review guide

| Criterion                 | Location / demonstration                                                                |
| ------------------------- | --------------------------------------------------------------------------------------- |
| SPA, bundler and routing  | `src/main.tsx`, `vite.config.js`; eight lazy-loaded routes                              |
| Component architecture    | `src/components`, `src/pages`, `src/models`, `src/services`, `src/store`, `src/styles`  |
| Local and global state    | Controlled form inputs, Redux Toolkit slice and async thunks                            |
| API integration           | `src/services/api.ts`, `server/mock.mjs`, [Mock API contract](docs/API.md)              |
| Forms and validation      | Record Expense, Budgets, Goals, Categories and Auth                                     |
| Lists and filtering       | Transactions: search, category, month and sorting                                       |
| Error handling            | ErrorBoundary, request wrapper, Redux error toast and Settings simulation buttons       |
| Loading states            | Global request indicator, Suspense, pending form states and receipt status polling      |
| Responsive layout         | CSS Grid, 1050/720 px breakpoints, mobile navigation, keyboard focus and reduced motion |
| Unit tests                | `src/components/*.test.tsx` (3 components, 5 test cases)                                |
| End-to-end tests          | `e2e/finance.spec.ts` (2 scenarios)                                                     |
| Advanced architecture     | Lazy-loaded routes and separation of responsibilities                                   |
| Advanced state management | Redux Toolkit and asynchronous thunks                                                   |
| Performance               | Route-based code splitting                                                              |
| Advanced UI/UX            | Dark/light theme, SVG chart and reusable UI components                                  |

## Main application features

- User registration and authentication.
- Demo mode with synthetic financial data.
- Financial overview.
- Manual income and expense recording.
- Transaction history, editing, deletion, search and filtering.
- Income and expense category management.
- Monthly budget management and progress tracking.
- Financial goals and savings progress.
- Receipt upload and simulated recognition workflow.
- Light and dark themes.
- Responsive navigation.
- Global API error handling and loading states.

## Documentation

- [Architecture, technology justification and user flows](docs/ARCHITECTURE.md)
- [Mock API documentation](docs/API.md)
- [Verification and testing results](docs/VERIFICATION.md)

## Scope and limitations

The mock server deliberately stands in for the Spring Boot REST API and Python ML worker, allowing the front-end to be reviewed independently.

The receipt image is displayed, but OCR is simulated using explicitly labeled sample fields. No claim of real recognition accuracy is made.

The mock server supports EUR only and stores data in memory. Production currency conversion, persistent storage, full receipt lifecycle integration and production authentication hardening are not included in this front-end review version.

Demo sessions are separate and cookies are HTTP-only.

The mock API contract is provisional and is not guaranteed to match the existing Java endpoints. Integration with the production backend is outside the scope of this front-end review version.

Do not use real financial data.

The optional payment method and tags shown in the Business Analysis wireframes are not implemented.

Full accessibility compliance and Lighthouse scores have not been measured.

## Verification status

The front-end was successfully built and tested locally on Windows on November 25, 2026.

| Verification                  | Result                               |
| ----------------------------- | ------------------------------------ |
| Dependency installation       | PASS                                 |
| TypeScript type checking      | PASS                                 |
| Vite production build         | PASS                                 |
| ESLint                        | PASS — 0 errors, 0 warnings          |
| Prettier                      | PASS                                 |
| Unit tests (Vitest)           | PASS — 5/5 tests across 3 components |
| Mock API smoke tests          | PASS                                 |
| End-to-end tests (Playwright) | PASS — 2/2 tests                     |
| Mobile budget workflow        | PASS                                 |
| Route-based code splitting    | Verified                             |

## Production build metrics

| Metric                        | Result       |
| ----------------------------- | ------------ |
| Build duration                | 2.75 seconds |
| Transformed modules           | 1,613        |
| Main JavaScript bundle        | 209.87 kB    |
| Main JavaScript bundle (gzip) | 69.15 kB     |
| Main CSS bundle               | 8.10 kB      |
| Main CSS bundle (gzip)        | 2.59 kB      |

Separate JavaScript chunks are generated for lazy-loaded pages.

Build timings are environment-dependent and do not represent browser loading times.

See the [verification log](docs/VERIFICATION.md) for detailed test results and reproduction steps.
