# Hints — M90: Full Regression Suite Organization

## TODO 1 — Push '@smoke' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** `'@smoke'` is the description value that the JSON reporter serializes. A post-processing script filters `annotations.find(a => a.description === '@smoke')` to count smoke tests. `'PLACEHOLDER'` doesn't equal `'@smoke'`, so the `.find()` returns `undefined` and `undefined?.type !== 'tag'`, failing the assertion.

---

## TODO 2 — Push '@sanity' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@sanity',
});
```

**Why it works:** The sanity tier runs on every PR merge — it's faster than the nightly regression but more complete than smoke. Annotating with `'@sanity'` lets CI tooling select exactly this tier via `--grep "@sanity"`. With `'PLACEHOLDER'`, the `find(a => a.description === '@sanity')` returns `undefined`.

---

## TODO 3 — Push '@sanity' in the second annotation

```typescript
testInfo.annotations.push({ type: 'tag', description: '@sanity' });
```

**Why it works:** A test can belong to multiple tiers by pushing multiple annotations. `testInfo.annotations` is an array — pushing both `@smoke` and `@sanity` means the test appears in both `--grep "@smoke"` and `--grep "@smoke|@sanity"` runs. With `'PLACEHOLDER'`, `tags.toContain('@sanity')` fails because the array contains `'PLACEHOLDER'` instead.

---

## TODO 4 — No implementation needed (test.fixme)

`test.fixme()` marks the test body as an expected failure. Playwright skips the body entirely — the TODO inside the body is never executed. The learning goal is understanding the semantic: `fixme` means "this test represents real behavior that should work, but currently doesn't because of a tracked bug." It shows in the HTML report as orange (fixme), not red (failed), so CI remains green while the bug is being worked on.

---

## TODO 5 — Push '@regression' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@regression',
});
```

**Why it works:** The regression tier runs nightly. Tests in this tier can be slower and more thorough than smoke or sanity. `'@regression'` is the standard description value — the nightly CI job runs `npx playwright test` without a `--grep` filter, which runs all tests including regression-only ones. The annotation makes regression membership visible in the JSON report.

---

## TODO 6 — Use 'owner' as the annotation type

```typescript
testInfo.annotations.push({
  type: 'owner',
  description: 'platform-team',
});
```

**Why it works:** `'owner'` is a custom annotation type (not built-in to Playwright, but a team convention). The health dashboard reads `type === 'owner'` to route failure alerts to the right Slack channel. With `'PLACEHOLDER'` as the type, `find(a => a.type === 'owner')` returns `undefined` and `undefined?.description !== 'platform-team'`, failing the assertion.

---

## TODO 7 — Push '@slow' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@slow',
});
```

**Why it works:** `'@slow'` is the tag that enables exclusion via `--grep-invert "@slow"`. Any test with `@slow` in its title or annotation is skipped in the fast per-push and per-PR jobs. Visual regression tests, cross-browser runs, and i18n exhaustive checks are tagged slow because they take 30–60 seconds each and are not worth running on every push.
