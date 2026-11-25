# Getting started

Use an isolated disposable PostgreSQL database, Java 21, the Maven wrapper and a local terminal. Follow the [project README](../../../readme.md) for environment variables and startup. Cloudinary properties are required by the current configuration; obtain your own development values for real uploads. For transaction-only exploration, placeholders may suffice for bean initialization but cannot authorize uploads. Never commit credentials.

1. Create an empty PostgreSQL database named `personal_finance_manager_review`.
2. Set `DB_URL` to `jdbc:postgresql://localhost:5432/personal_finance_manager_review`, `DB_USERNAME`, `DB_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in your local environment. Keep the server bound to loopback.
3. Start from repository root (PowerShell):

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.address=127.0.0.1"
```

4. Wait for Liquibase and Hibernate startup. If startup fails, inspect the logs before proceeding. No HTTP registration endpoint or automatic currency seed exists in this snapshot. In the disposable database only, use psql or IntelliJ Database console to create synthetic records:

```sql
INSERT INTO currencies(code, name) VALUES ('EUR', 'Euro') ON CONFLICT (code) DO NOTHING;
INSERT INTO users(email, password_hash, default_currency_code, created_at, updated_at)
VALUES ('review@example.test', 'DISABLED_DEMO_NOT_A_PASSWORD', 'EUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
SELECT id FROM users WHERE email = 'review@example.test';
```

5. Substitute the returned ID in the following PowerShell command:

```powershell
curl.exe -i http://localhost:8080/api/users/1
```

Expected status 200 and JSON fields `id`, `email`, `currencyCode`. The current security configuration permits requests without credentials: there is no login or token to obtain. The seed value is not a valid password hash and is not intended for login. This is a local development workaround, not production onboarding.

Continue with the [integration tutorial](INTEGRATION.md). Stop the server with Ctrl+C when done. Delete the disposable database only when no longer needed.
