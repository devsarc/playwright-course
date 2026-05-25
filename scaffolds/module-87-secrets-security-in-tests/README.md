# M87: Secrets & Security in Tests

## Learning Objectives

- Manage credentials via environment variables rather than hardcoded strings
- Mask sensitive values so they do not appear in HTML reports or Trace Viewer
- Verify that secrets are never written to test artifacts
- Isolate the test environment from production data sources
- Audit an existing test suite for common credential-exposure patterns

## Concept

A Playwright test suite that stores a real password in a string literal has already failed a security audit before the first test runs. The problem is not theoretical: CI logs are visible to anyone with repo access, HTML report artifacts are uploaded and shared, and Trace Viewer files include network request headers — all of which can expose credentials if the suite is not written defensively.

**Environment variables are the minimum bar.**

Never hardcode credentials in test files. Load them from `process.env` at runtime:

```typescript
const password = process.env.TEST_PASSWORD ?? '';
```

In local development, store them in a `.env.test` file that is listed in `.gitignore`. In CI, inject them as repository secrets via GitHub Actions, Azure Key Vault, or AWS Secrets Manager — never in the workflow YAML file in plain text.

**`.env.test` must be in `.gitignore`.**

A `.env.test` file that leaks into the repo is equivalent to committing a password. The pattern:

```
# .gitignore
.env.test
.env*.local
```

**Masking secrets in reports and traces.**

Even when credentials come from env vars, they can leak into artifacts. A Trace Viewer capture includes network request payloads. An HTML report includes test step labels. Masking strategies:

1. **Redact in step labels.** Do not include raw secret values in `test.step()` descriptions.
2. **Network request masking.** For requests that carry credentials (Authorization header, form POST with password), use `page.route()` to intercept and redact the value before it reaches the trace.
3. **Screenshot masking.** `page.screenshot({ mask: [locator] })` and `toHaveScreenshot({ mask: [locator] })` blur the matched element in the captured image — use this for password fields, API keys displayed in the UI, and user PII.
4. **Attachment metadata.** When attaching trace files, do not include the secret value in the attachment name.

**Test environment isolation.**

The test database must be completely separate from production. Patterns:

- `.env.test` points to `DATABASE_URL=postgresql://localhost:5432/lumio_test` — never the production URL.
- The `globalSetup` script seeds from `prisma db seed` against the test DB, not production.
- If your CI runner has access to the real cloud DB (even via read replica), you have a blast-radius problem. Fix it with a dedicated test account and schema, not trust.

**API key scoping.**

Test API keys must be read-only where possible, scoped to the test workspace only, and rotated when a team member leaves. Never use a production admin API key in tests.

**Auditing an existing suite.**

When auditing a test codebase for credential exposure, grep for:
- String literals that look like passwords, tokens, or keys
- Hardcoded email addresses that match production accounts
- `Authorization: Bearer` headers constructed from string interpolation with a literal value
- `DATABASE_URL` values pointing at non-`localhost` hosts

Playwright provides `testInfo.annotations` as a way to attach structured metadata to test runs without exposing the values in the HTML report title.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-87-secrets-security-in-tests
```

## Key Takeaways

1. Credentials belong in environment variables, not source code — `.env.test` is for local dev and must be gitignored.
2. `page.screenshot({ mask: [locator] })` hides sensitive UI values from captured images without skipping the screenshot.
3. Traces capture network request headers — routes that carry Authorization headers should be audited for leakage.
4. Test database URLs must point at an isolated instance; production and test data must never share a schema.
5. Use `process.env.SECRET ?? ''` with a clear fail-fast check (`if (!secret) throw`) rather than silently using an empty string.

## Going Deeper

- [Playwright docs: Mask secrets in screenshots](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask)
- [GitHub Actions: Encrypted secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
- [OWASP: Secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Playwright docs: Environment variables](https://playwright.dev/docs/test-parameterize#passing-environment-variables)
