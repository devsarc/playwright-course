# M82 Hints

## TODO 1 — context.waitForEvent('page')

```typescript
context.waitForEvent('page'),
```

`context.waitForEvent('page')` resolves with the `Page` object when the browser opens a new tab. In Cypress, there is no equivalent — multi-tab testing is listed in Cypress's [trade-offs documentation](https://docs.cypress.io/guides/references/trade-offs#Multiple-tabs) as an unsupported scenario. `'request'` resolves with a `Request` object, not a `Page`.

## TODO 2 — Documentation title regex

```typescript
await expect(page).toHaveTitle(/Documentation/);
```

`/PLACEHOLDER/` won't match the docs title. In Cypress with default settings, navigating to a different origin mid-test throws: "Cypress detected that you are trying to run a cross-origin test." Playwright has no such restriction — `page.goto()` works for any URL.

## TODO 3 — browserName regex

```typescript
expect(browserName).toMatch(/chromium|firefox|webkit/);
```

`/PLACEHOLDER/` won't match any browser engine name. Playwright surfaces `browserName` as a built-in fixture, enabling browser-conditional logic. Cypress supports Chromium (Chrome, Edge, Electron) and Firefox — WebKit (Safari) is not available in Cypress, making this test category unreachable.

## TODO 4 — Mocked stats count

```typescript
await expect(page.getByText('99')).toBeVisible();
```

`'PLACEHOLDER'` finds no matching text. Both Playwright (`page.route()`) and Cypress (`cy.intercept()`) support network interception, but with different APIs. The mocked response returns `{ tasks: 99, members: 5 }`, and the dashboard renders the task count as "99".

## TODO 5 — toBeVisible() assertion

```typescript
await expect(btn).toBeVisible();
```

The default `toBeHidden()` fails because the "New task" button IS visible on the kanban board. The key Cypress → Playwright migration difference in this test: Cypress uses `.should('be.visible')` on a chainable object; Playwright uses `await expect(locator).toBeVisible()` — explicit async/await.

## TODO 6 — Export CSV button name

```typescript
page.getByRole('button', { name: 'Export CSV' }).click(),
```

`'PLACEHOLDER'` finds no button. The download event fires when the browser starts downloading a file. Playwright captures it with `page.waitForEvent('download')` before the click triggers it. In Cypress, there is no download event API — teams typically intercept the XHR response and read the content as a blob.
