# M81 Hints

## TODO 1 — Auto-wait click

```typescript
await page.getByRole('button', { name: 'New task' }).click();
```

Playwright waits for the button to be visible, stable, and enabled before clicking. In Selenium, you'd write `WebDriverWait(driver, 10).until(EC.element_to_be_clickable(By.xpath(...)))` before every click. Playwright's auto-wait eliminates this boilerplate for all locator actions.

## TODO 2 — Empty state after mock

```typescript
await expect(page.getByText('No projects')).toBeVisible();
```

`page.route()` intercepts matching requests before they leave the browser — no external proxy process needed. In Selenium, network mocking requires BrowserMob Proxy (a separate Java server) or HAR replay. `'PLACEHOLDER'` finds no matching text.

## TODO 3 — context.waitForEvent('page')

```typescript
context.waitForEvent('page'),
```

`context.waitForEvent('page')` resolves when the browser opens a new tab or window. The new page is returned directly — no handle iteration needed. In Selenium, you'd collect `driver.getWindowHandles()` before the click, click, then find the new handle by set difference. `'request'` returns a `Request` object, not a `Page`.

## TODO 4 — Shadow DOM locator

```typescript
const themeButton = page.locator('theme-toggle button');
```

Playwright's CSS locator automatically pierces shadow root boundaries when chaining through custom elements (`theme-toggle` → shadow root → `button`). In Selenium, accessing shadow DOM requires `driver.executeScript("return arguments[0].shadowRoot", host).findElement(...)`. `'PLACEHOLDER'` finds no element.

## TODO 5 — Created response status 201

```typescript
expect(response.status()).toBe(201);
```

HTTP 201 Created is the standard response for a successful POST that creates a resource. The `request` fixture is a built-in Playwright feature — no extra library needed. In Selenium, you'd import `requests` (Python) or `RestAssured` (Java) as a separate dependency and make the HTTP call outside the WebDriver context.

## TODO 6 — Semantic button locator

```typescript
const createBtn = page.getByRole('button', { name: 'New task' });
```

`getByRole` is stable across CSS refactors, DOM restructuring, and element moves. Selenium defaults to CSS selectors and XPath because WebDriver has no semantic locator concept — those strategies require constant maintenance when the DOM changes. `'PLACEHOLDER'` finds no matching button.
