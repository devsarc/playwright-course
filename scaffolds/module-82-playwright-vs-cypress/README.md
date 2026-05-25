# M82: Playwright vs Cypress

## Learning Objectives

- Compare Playwright and Cypress for the Lumio SPA dashboard scenario across specific technical criteria
- Understand multi-browser, multi-tab, and multi-origin differences — the core architectural divergence
- Recognize when Cypress is the better choice: simpler SPA testing with a team that values DX over breadth
- Know the migration patterns when moving from Cypress to Playwright

## Concept

Cypress and Playwright are both modern browser automation tools with first-class JavaScript/TypeScript support, automatic waiting, and good developer experience. The tradeoffs are real but context-dependent — neither is universally better.

**Architecture.**

Both Cypress and Playwright run inside the browser (sort of). Cypress runs tests in an iframe alongside the app in the same browser tab. Playwright runs tests in a Node.js process and communicates with the browser via CDP/BiDi (same as with Selenium's CDP mode).

The iframe architecture gives Cypress real-time test execution visibility but also causes its most significant limitations:

**1. Same-origin restriction.**

Cypress cannot navigate between different origins in the same test by default (unless you set `chromeWebSecurity: false`, which has caveats). Playwright has no origin restriction.

Lumio example: testing the OAuth redirect to `github.com` and back requires multi-origin navigation. In Cypress, you must mock the OAuth provider. In Playwright, you can automate the actual OAuth redirect (or mock it — both are valid).

**2. Multi-tab.**

Cypress cannot access a second browser tab — there is no API for it. Playwright's `context.waitForEvent('page')` handles new tabs naturally.

Lumio example: opening a task in a new tab to compare two tasks side by side — testable in Playwright, untestable in Cypress without mocking.

**3. Multi-browser support.**

Cypress supports Chromium-based browsers (Chrome, Edge, Electron) and Firefox. It does not support WebKit (Safari). Playwright supports Chromium, Firefox, and WebKit — including iOS Safari simulation.

Lumio example: WebKit-specific date input bugs (M34) — only discoverable in Playwright's WebKit.

**4. Developer experience.**

Cypress has a better interactive test runner UI for debugging: real-time test execution, time-travel debugging (snapshots for every command), and a polished dashboard. Playwright's UI Mode (`--ui`) is comparable but newer and less mature.

If a team's primary goal is fast, pleasant test writing for a simple React SPA with no multi-tab, multi-origin, or WebKit requirements — Cypress is often the better experience.

**5. Component testing.**

Both support component testing. Cypress CT was the first to market and has a broader ecosystem (stories, design system testing). Playwright CT (`@playwright/experimental-ct-react`) is newer but integrates with Playwright's full feature set (network mocking, multi-browser).

**When Cypress is the better choice.**

Choose Cypress when:
- The app is a single-origin SPA with no OAuth redirects or multi-tab flows
- The team prioritizes DX and the interactive runner UI over browser coverage
- WebKit/Safari testing is not required (iOS Safari is tested separately via device farm)
- The team already has Cypress expertise and a large existing test suite
- You need the Cypress Dashboard (analytics, flakiness detection) without building your own

**Migration from Cypress to Playwright.**

Key differences:
- `cy.visit(url)` → `await page.goto(url)`
- `cy.get('selector')` → `await page.locator('selector')` (add `await`)
- `cy.contains('text')` → `page.getByText('text')`
- `cy.intercept()` → `page.route()`
- `.should('be.visible')` → `await expect(locator).toBeVisible()`
- `beforeEach(()` → `test.beforeEach(async ({ page }) =>`

The main mental shift: Cypress commands are synchronous (chainable, auto-queued); Playwright commands are async/await.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-82-playwright-vs-cypress
```

## Key Takeaways

1. Cypress same-origin restriction: cannot navigate between origins in one test; Playwright has no restriction.
2. Cypress multi-tab: not supported; Playwright's `context.waitForEvent('page')` handles it natively.
3. Cypress browser support: Chromium + Firefox; Playwright adds WebKit — critical for Safari-specific bugs.
4. Cypress DX advantage: time-travel debugger and interactive runner are excellent for simple SPA teams.
5. Migration: `cy.get()` → `locator()`, `.should('be.visible')` → `await expect().toBeVisible()`, add `await` everywhere.

## Going Deeper

- [Playwright vs Cypress official comparison](https://playwright.dev/docs/why-playwright)
- [Cypress docs: multiple origins](https://docs.cypress.io/guides/guides/web-security#Same-superdomain-per-test)
- [Cypress: multiple tabs limitation](https://docs.cypress.io/guides/references/trade-offs#Multiple-tabs)
