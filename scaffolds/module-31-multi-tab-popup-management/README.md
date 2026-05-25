# M31: Multi-Tab & Popup Management

## Learning Objectives

- Open multiple pages in one BrowserContext for same-user multi-tab scenarios
- Create independent BrowserContexts for different user sessions
- Test real-time collaboration features (card sync, presence)
- Clean up contexts explicitly to avoid resource leaks
- Wait for a popup window opened by a link click using `context.waitForEvent('page')`
- Handle OAuth login popups: wait for the popup page, fill credentials inside it, assert redirect back to the app
- Coordinate assertions across tabs: perform action in tab A and assert the result in tab B

## Concept

**Same user, two tabs — `context.newPage()`:**
```typescript
const pageA = await context.newPage();
const pageB = await context.newPage();
// pageA and pageB share cookies — same logged-in user
```

**Two users — `browser.newContext()`:**
```typescript
const ctxA = await browser.newContext({ storageState: 'user-a.json' });
const ctxB = await browser.newContext({ storageState: 'user-b.json' });
// Independent sessions — different users
```

**Popup window (link opens new tab):**
```typescript
const [popup] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open in new tab' }).click(),
]);
await popup.waitForLoadState();
await expect(popup).toHaveTitle('Expected Title');
```
`Promise.all` prevents a race: the popup may open before `waitForEvent` is registered if you `click()` first.

## Key Takeaways

1. `context.newPage()` = same user, new tab (shared cookies).
2. `browser.newContext()` = new user profile (isolated cookies, localStorage).
3. Always call `context.close()` in multi-context tests — Playwright doesn't auto-close manually created contexts.
4. Use unique card titles (`Date.now()`) to avoid test interference.

## Going Deeper

- [Playwright docs: BrowserContext](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Multi-page scenarios](https://playwright.dev/docs/pages)
- M33 (User Journey Simulation) covers multi-user collaboration flows in full: two independent contexts, real-time sync assertions, and multi-step orchestration across users.
