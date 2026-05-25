# Lumio Context: M82

## The comparison scenario

Lumio's dashboard is a React SPA — exactly the type of app where Cypress was initially designed to excel. The comparison is not hypothetical: the team evaluated both tools during M82's feature planning.

## Where Cypress would work fine for Lumio

| Lumio feature | Cypress compatible? |
|---|---|
| Dashboard charts and widgets | ✅ Single-origin SPA |
| Task creation form | ✅ Standard form interaction |
| Admin user table | ✅ Standard data table |
| Network mocking for API tests | ✅ `cy.intercept()` equivalent |
| Component testing (Button, TaskCard) | ✅ Cypress CT supported |
| Auth cookie/session management | ✅ `cy.session()` equivalent |

## Where Playwright is necessary for Lumio

| Lumio feature | Cypress compatible? |
|---|---|
| GitHub OAuth (cross-origin redirect) | ❌ Different origin mid-test |
| Open task in new tab | ❌ No multi-tab API |
| WebKit-specific date input bug | ❌ No WebKit support |
| Extension popup testing | ❌ No persistent context API |
| Electron desktop client | ❌ Not supported |
| PDF export download | ⚠️ Workaround required |

## The team's decision

Lumio uses Playwright exclusively because:
1. The GitHub OAuth flow (cross-origin) is tested in M17 and M66
2. The WebKit date input bug (M34) would be missed in Cypress
3. The extension tests (M71) require `launchPersistentContext`
4. The Electron client (M72) is Playwright-only

If Lumio had no OAuth, no extension, no Electron client, and no WebKit requirement — Cypress would be a viable choice with a better interactive debugging experience.

## Cypress → Playwright command reference

| Cypress | Playwright |
|---|---|
| `cy.visit('/path')` | `await page.goto('/path')` |
| `cy.get('selector')` | `page.locator('selector')` |
| `cy.contains('text')` | `page.getByText('text')` |
| `.should('be.visible')` | `await expect(loc).toBeVisible()` |
| `cy.intercept()` | `page.route()` |
| `cy.session()` | `storageState` fixture |
| `beforeEach(fn)` | `test.beforeEach(async ({ page }) => fn)` |
