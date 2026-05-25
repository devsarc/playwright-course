# Hints — M88: Test Health Observability

## TODO 1 — Assert retry is 0

```typescript
expect(testInfo.retry).toBe(0);
```

**Why it works:** `testInfo.retry` is 0 on the first run attempt, 1 on the first retry, and so on. A stable test that passes without retries always has `retry === 0`. Asserting this in a known-stable test validates that your flakiness tracking baseline is correct: if this test ever reports a non-zero retry, it means the test or its environment has become unreliable.

---

## TODO 2 — Assert duration is >= 0

```typescript
expect(testInfo.duration).toBeGreaterThanOrEqual(0);
```

**Why it works:** Duration is measured in milliseconds from when the test starts. It is always non-negative, even at the start of the test body. In `afterEach` hooks, `testInfo.duration` reflects the complete test runtime — that's where you'd enforce a budget like `expect(testInfo.duration).toBeLessThan(10_000)`.

---

## TODO 3 — Push annotation with type 'tag'

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** `'tag'` is the conventional annotation type for coverage tier markers. The HTML reporter renders it visually alongside the test, and the JSON reporter serializes it so post-processing scripts can count tests by tier. With `'PLACEHOLDER'`, the find call returns `undefined` and `undefined?.type` does not equal `'tag'`, causing the assertion to fail.

---

## TODO 4 — Set flakiness-risk description to 'low'

```typescript
description: 'low',
```

**Why it works:** The `flakiness-risk` annotation is a custom type your health script reads from the JSON reporter output. Values like `'low'`, `'medium'`, and `'high'` let you prioritize which flaky tests to investigate first. `'PLACEHOLDER'` does not equal `'low'`, so the assertion fails. Tests that hit network-dependent assertions (WebSocket, SSE) should be tagged `'high'`.

---

## TODO 5 — Assert testId is not an empty string

```typescript
expect(testInfo.testId).not.toBe('');
```

**Why it works:** `testInfo.testId` is a stable hash derived from the test's file path, title, and project. It is the correct key for a metrics database because it remains consistent across runs for the same test. `not.toBe('definitely-not-empty')` is always true and does not verify the property — `not.toBe('')` verifies it is actually populated.

---

## TODO 6 — Assert title matches /@smoke/

```typescript
expect(testInfo.title).toMatch(/@smoke/);
```

**Why it works:** `testInfo.title` is the full test title string. Including `@smoke` in the test name is what makes `npx playwright test --grep "@smoke"` match it. The regex `/@smoke/` verifies the tag is present. `/PLACEHOLDER/` does not match any part of the title, so the assertion fails, signaling the learner that the tag is missing.

---

## TODO 7 — Set contentType to 'application/json'

```typescript
contentType: 'application/json',
```

**Why it works:** `testInfo.attach()` requires a `contentType` MIME type to tell report viewers how to render the attachment. `'application/json'` causes the HTML reporter to display the JSON as formatted text, and it allows downstream consumers to parse the attachment body. With `'PLACEHOLDER_CONTENT_TYPE'`, the attachment is registered but the assertion `expect(testInfo.attachments[0].contentType).toBe('application/json')` fails.
