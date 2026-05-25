# M70: Broken Link & Navigation Monitoring

## Learning Objectives

- Monitor network responses during page load using `page.on('response')` to detect 404s in real time
- Check individual link health using the `request` fixture without loading full browser pages
- Collect links from the DOM using `locator.evaluateAll()` and validate each programmatically
- Follow redirect chains via `page.goto()` and assert the final destination URL
- Validate anchor fragment links (`#section`) by checking that the target element exists in the DOM

## Concept

Broken links and navigation failures are silent regressions. A user clicks a footer link and lands on a 404. An internal page reference points to a moved URL. An anchor link on a pricing page scrolls nowhere because the target element was renamed. None of these show up in unit tests or build failures — they require a browser-level scan.

Playwright provides two complementary tools for link health monitoring: passive response monitoring via event listeners, and active link checking via the `request` fixture.

**Passive monitoring with page.on('response').**

You can register a listener before navigation to capture every HTTP response the page triggers, including subresources:

```typescript
const found404s: string[] = [];
page.on('response', response => {
  if (response.status() === 404) found404s.push(response.url());
});
await page.goto('/');
await page.waitForLoadState('networkidle');
expect(found404s).toHaveLength(0);
```

This catches broken images, missing scripts, and failed API calls — not just broken navigation links. The `networkidle` load state waits until no more network requests fire for 500ms, giving lazy-loaded resources time to resolve.

**Active link checking with the request fixture.**

The `request` fixture sends HTTP requests without loading a browser page. This is ideal for checking many links in bulk:

```typescript
const links = ['/pricing', '/docs', '/blog'];
for (const link of links) {
  const response = await request.get(link);
  expect(response.status()).toBeLessThan(400);
}
```

Using `< 400` rather than `=== 200` allows valid redirects (301, 302) without treating them as failures.

**Collecting links from the DOM.**

To check all links on a page without hardcoding them, collect their `href` attributes:

```typescript
const hrefs = await page.locator('nav a[href^="/"]').evaluateAll(
  links => links.map(l => l.getAttribute('href')!)
);
for (const href of hrefs) {
  const response = await request.get(href);
  expect(response.status()).toBeLessThan(400);
}
```

`[href^="/"]` selects only internal links (those starting with `/`), excluding external links and `mailto:` addresses.

**Following redirect chains.**

`page.goto()` follows all redirects and returns the final `Response`. The response's `.url()` method gives the final URL after the full chain:

```typescript
const response = await page.goto('/dashboard'); // redirects to /login for unauthenticated users
expect(response!.url()).toContain('login');      // final URL after all redirects
await expect(page).toHaveURL(/login/);           // page.url() also reflects the final URL
```

Both approaches work; `response.url()` is useful when you want the final URL before any assertions on the page, `toHaveURL()` is more readable when you just need to assert the landed URL.

**Anchor fragment validation.**

An anchor link like `href="#faq"` navigates to the element with `id="faq"` on the same page. If that element is removed or renamed, the link silently fails — the user is scrolled nowhere. Test anchor links by checking that the target element is attached to the DOM:

```typescript
const anchorHrefs = await page.locator('a[href^="#"]').evaluateAll(
  links => links.map(l => l.getAttribute('href')!)
);
for (const href of anchorHrefs) {
  const fragment = href.slice(1); // strip the '#'
  await expect(page.locator(`#${fragment}`)).toBeAttached();
}
```

**Decision pattern — when to run link monitoring.**

Run link monitoring on a schedule (e.g., daily or after each deployment) rather than in the per-PR test suite. Checking every link blocks CI unnecessarily if the site has hundreds of pages. For critical navigation (header, footer, sidebar), integrate link checks into the smoke suite. For full-site crawl coverage, schedule a nightly job.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-70-broken-link-navigation-monitoring
```

## Key Takeaways

1. `page.on('response')` passively monitors all HTTP responses during page load — the broadest 404 net.
2. Use the `request` fixture for bulk link checks — no browser overhead, no JavaScript execution.
3. `toBeLessThan(400)` is more robust than `toBe(200)` for link health checks: it accepts valid redirects.
4. `page.goto()` returns the final `Response` after all redirects; use `response.url()` to read the final URL.
5. Anchor fragment links (`#target`) must be validated by checking that the target element is attached to the DOM.

## Going Deeper

- [Playwright docs: page.on('response')](https://playwright.dev/docs/api/class-page#page-event-response)
- [Playwright docs: request fixture](https://playwright.dev/docs/api/class-apirequestcontext)
- [Playwright docs: toBeAttached()](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-attached)
- [Playwright docs: waitForLoadState](https://playwright.dev/docs/api/class-page#page-wait-for-load-state)
