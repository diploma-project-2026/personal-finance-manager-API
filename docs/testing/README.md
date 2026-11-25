# Automated Testing Strategy

## Objectives

Validate business logic, detect regressions, verify UI
behaviour and provide reproducible test execution.

## Tools

- JUnit 5 and Mockito: Java unit testing.
- Maven Surefire: backend test execution.
- JaCoCo: backend code coverage.
- Vitest and React Testing Library: UI component tests.
- Playwright: browser end-to-end testing.
- GitHub Actions: continuous integration.

## Test architecture

Backend tests are located under src/test/java.
Test classes follow the *Test.java naming convention.
External dependencies are isolated using Mockito.

Frontend tests are available in the frontend-submission
branch of the same repository.

## Running backend tests

From the repository root:

    ./mvnw clean test

On Windows:

    .\mvnw.cmd clean test

## Reports

- Coverage: target/site/jacoco/index.html
- Coverage XML: target/site/jacoco/jacoco.xml
- Test results: target/surefire-reports/

CI workflow: .github/workflows/automated-tests.yml

## Frontend verification

Frontend branch: frontend-submission
Follow the frontend README for installation and test commands.

Previously verified results:

- Component tests: 5 passed.
- Playwright E2E tests: 2 passed.
- Mock API smoke test: passed.

## Backend coverage baseline

Measured on November 25, 2026 using JaCoCo 0.8.13.

| Metric | Result |
| --- | --- |
| Instruction coverage | 9% |
| Branch coverage | 20% |
| Service instruction coverage | 14% |
| Exception instruction coverage | 100% |
| Required coverage target | 70% |

The required coverage target has not yet been achieved.

## Testing principles

Tests should follow the FIRST principles: Fast,
Independent, Repeatable, Self-Validating and Timely.

Prioritize meaningful assertions, common cases, boundary
conditions, invalid inputs and error handling.

## Known gaps

- Insufficient backend code coverage.
- Transaction and receipt services need additional tests.
- API and PostgreSQL integration tests are incomplete.
- Authentication and authorization are not implemented.
- External Cloudinary and ML worker integration is unverified.
- Frontend E2E tests use the mock API.
- Full CI execution has not yet been confirmed.

## Future improvements

1. Expand unit tests for transaction and receipt services.
2. Add MockMvc endpoint integration tests.
3. Add PostgreSQL Testcontainers integration tests.
4. Add authentication and authorization tests.
5. Increase coverage to at least 70%.
6. Add coverage quality gates and contract testing.

## Conclusion

The project provides an initial automated regression suite
and reproducible coverage measurement. Additional tests
are required to satisfy the complete coverage and
integration requirements.
