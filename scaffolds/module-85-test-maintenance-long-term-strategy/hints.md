# M85 Hints

## TODO 1 — getByLabel with 'Email'

```typescript
const emailInput = page.getByLabel('Email');
```

`'PLACEHOLDER'` matches no label and times out. `getByLabel('Email')` targets the `<label>` element whose text is "Email" — this survives CSS renames, placeholder text changes, and HTML restructuring, because labels are semantic markup tied directly to their input. Compare: `getByPlaceholder('Enter email')` breaks the moment a designer edits the placeholder string.

## TODO 2 — Named button role with 'Sign in'

```typescript
const signInBtn = page.getByRole('button', { name: 'Sign in' });
```

`'PLACEHOLDER'` finds no button and times out. The accessible name `'Sign in'` is derived from the button's visible text or `aria-label`, which product teams treat as UX copy — far more stable than DOM position. `nth(0)` becomes `nth(1)` the moment a back-button or close-icon appears above the sign-in button.

## TODO 3 — Scoped link locator with 'Features'

```typescript
const featuresLink = nav.getByRole('link', { name: 'Features' });
```

`'PLACEHOLDER'` matches no link and times out. `'Features'` finds the nav link by accessible name. The key maintenance insight: scoping to `nav` means that even if a footer link named "Features" appears later, this locator won't produce a strict mode violation — it only searches within the navigation element.

## TODO 4 — Annotation type 'issue'

```typescript
testInfo.annotations.push({ type: 'issue', description: '...' });
```

`'PLACEHOLDER'` attaches an annotation with type `'PLACEHOLDER'`, so `.find(a => a.type === 'issue')` returns `undefined`, and `expect(undefined).not.toBeUndefined()` fails. The `'issue'` type is a Playwright convention rendered in HTML reports — it creates a clickable link to your issue tracker. Other built-in types: `'skip'`, `'fixme'`, `'fail'`.

## TODO 5 — Annotation type 'tag'

```typescript
testInfo.annotations.push({ type: 'tag', description: '@smoke' });
```

`'PLACEHOLDER'` causes `smokeAnnotation?.type` to be `'PLACEHOLDER'`, so `toBe('tag')` fails. The `'tag'` type is used by the HTML reporter to display coverage tiers alongside test results. Teams use this to filter the report by `@smoke`, `@sanity`, etc., giving visibility into which CI tier caught a regression.

## TODO 6 — Role 'navigation' for sidebar

```typescript
const sidebar = page.getByRole('navigation');
```

`'PLACEHOLDER'` is not a valid ARIA role and throws a `locator.getByRole` error immediately. `'navigation'` matches the `<nav>` element (or any element with `role="navigation"`), which is how Lumio's sidebar is structured. This is a behavioral assertion — the sidebar IS visible — not a CSS assertion about how it's styled.

## TODO 7 — Title regex /Lumio/

```typescript
await expect.soft(page).toHaveTitle(/Lumio/);
```

`/PLACEHOLDER/` does not match the page title (which contains "Lumio"), so the soft assertion fails. The test continues running (that's the point of `expect.soft`), and the heading assertion on the next line still executes. When the test finishes, the soft assertion failure is reported in `testInfo.errors` and marked in the HTML report — but execution was not interrupted mid-test.
