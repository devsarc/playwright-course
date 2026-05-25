# Hints — M87: Secrets & Security in Tests

## TODO 1 — Load password from environment variable

```typescript
const password = process.env.TEST_PASSWORD ?? 'password123';
```

**Why it works:** `process.env.TEST_PASSWORD` is read at runtime from the environment, not from source code. The `?? 'password123'` fallback is safe here because `password123` is a seed-only test account credential that only exists in the isolated test database. In CI, set `TEST_PASSWORD` as an encrypted repository secret — it will override the fallback.

---

## TODO 2 — Assert env var is not an empty string

```typescript
expect(email).not.toBe('');
```

**Why it works:** An empty string that passes silently is worse than an explicit failure. If `TEST_EMAIL` is unset and the auth system accepts blank credentials, your tests will produce false positives. The pattern `not.toBe('')` fails fast with a clear message so you know the environment is misconfigured before wasting CI time.

---

## TODO 3 — Mask the password field in screenshots

```typescript
const maskedField = page.getByLabel('Password');
```

**Why it works:** `page.screenshot({ mask: [locator] })` replaces the matched element's bounding box with a magenta overlay in the captured PNG. The password field value never appears in the artifact. Apply the same pattern to API key display fields, credit card inputs, and any PII shown in the UI during tests.

---

## TODO 4 — Annotate presence without exposing the key value

```typescript
testInfo.annotations.push({
  type: 'security',
  description: 'api-key-present',
});
```

**Why it works:** The annotation confirms the API key was provided for this test run without writing the key itself into the report. The HTML reporter renders annotation descriptions directly in the test result — if you wrote `description: apiKey`, the key would appear in every CI artifact. "Present/absent" flags communicate the intent without the exposure risk.

---

## TODO 5 — Assert DATABASE_URL matches a safe pattern

```typescript
expect(dbUrl).toMatch(/localhost|127\.0\.0\.1|lumio_test/);
```

**Why it works:** The regex matches three valid patterns for a test database URL: a localhost hostname, the loopback IP, or a database name containing `lumio_test`. If someone accidentally sets `DATABASE_URL` to the production connection string, this assertion fails immediately before any destructive test operations run. Fail-fast beats discovering the problem after the seed script drops the prod database.

---

## TODO 6 — Assert authHeaderFound is true

```typescript
expect(authHeaderFound).toBe(true);
```

**Why it works:** After a successful login, Lumio's dashboard page makes authenticated API requests. The route interceptor checks for the `Authorization` header presence without logging its value. The boolean `authHeaderFound` tells you whether auth is wired up correctly — the header value never enters the test output.

---

## TODO 7 — Assert outputDir contains 'test-results'

```typescript
expect(testInfo.outputDir).toContain('test-results');
```

**Why it works:** `testInfo.outputDir` is the per-test artifact directory. It should always be under the project's `test-results/` folder, not a shared network path, a cloud mount, or a production log directory. If your CI configuration misconfigures the output path, this assertion catches it before sensitive artifacts (traces with auth headers) are written to an unintended location.
