# M81: Playwright vs Selenium

## Learning Objectives

- Understand the architectural difference between WebDriver (Selenium) and CDP/BiDi (Playwright)
- Identify Lumio test scenarios where Playwright's architecture provides a concrete advantage
- Recognize when Selenium is the right choice: legacy enterprise environments and language breadth
- Evaluate the migration cost from a Selenium suite to Playwright

## Concept

Selenium and Playwright are both browser automation frameworks — but their underlying protocols differ fundamentally, and those differences manifest in real test authoring and maintenance tradeoffs.

**WebDriver vs CDP/BiDi.**

Selenium uses the W3C WebDriver protocol: the test sends HTTP commands to a browser driver (chromedriver, geckodriver), which translates them to browser instructions. Each command is a synchronous HTTP round-trip. This adds latency and requires explicit waiting because the driver doesn't know what the browser is about to do next.

Playwright uses Chrome DevTools Protocol (CDP) for Chromium and its own BiDirectional protocol for Firefox and WebKit. CDP is a direct bidirectional channel — Playwright and the browser communicate in real time, which enables auto-waiting: Playwright waits for the element to be ready before interacting.

| Dimension | Selenium | Playwright |
|---|---|---|
| Protocol | WebDriver (HTTP) | CDP / BiDi (WebSocket) |
| Auto-waiting | No (explicit waits required) | Yes (built into all locators) |
| Test speed | Slower (round-trip latency) | Faster (bidirectional channel) |
| Flakiness | Higher (explicit waits drift) | Lower (auto-wait eliminates timing waits) |
| Language support | Java, Python, JS, C#, Ruby, Kotlin | JS/TS, Python, Java, C# |
| Browser support | All major browsers + cloud grids | Chromium, Firefox, WebKit |
| Multi-tab | Complex (window handle switching) | Simple (context.waitForEvent) |
| Network mocking | Requires proxy (BrowserMob) | Built-in (page.route) |
| Shadow DOM | Via JavascriptExecutor | First-class (`:shadow` CSS) |

**When Selenium is the right choice.**

Choose Selenium when:
- The team uses Ruby or Kotlin (no Playwright bindings exist)
- The CI infrastructure is a Selenium Grid with dozens of physical browsers — migration cost is prohibitive
- The app targets Internet Explorer or old enterprise browsers not supported by Playwright
- The organization has existing Selenium frameworks (Page Object utilities, custom reporters) that would need to be rebuilt
- You need to integrate with a commercial Selenium-based cloud (BrowserStack, Sauce Labs have Playwright support too, but legacy pricing may favor Selenium)

**Migration cost from Selenium to Playwright.**

Migrating a Selenium suite is not a find-and-replace. The differences that require actual work:
- **Locators:** Selenium uses `By.id()`, `By.cssSelector()`, `By.xpath()` → Playwright uses `getByRole`, `getByLabel`, `locator()`. Most tests need locator rewrites.
- **Waits:** Remove all `WebDriverWait` and `ExpectedConditions` — Playwright handles them automatically.
- **POM structure:** The POM pattern transfers, but method implementations change (no `WebElement` type, no `driver.findElement()`).
- **Configuration:** `WebDriver` initialization → `playwright.config.ts`.
- A 200-test Selenium suite typically takes 2–4 weeks to migrate with one engineer.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-81-playwright-vs-selenium
```

## Key Takeaways

1. WebDriver = HTTP round-trip per command (slow, requires explicit waits); CDP/BiDi = bidirectional WebSocket (fast, enables auto-wait).
2. Playwright's auto-waiting is not a magic timer — it watches the element state (attached, visible, stable, enabled) before acting.
3. Multi-tab, network mocking, and shadow DOM are Playwright built-ins; in Selenium they require external libraries or hacks.
4. Choose Selenium when: Ruby/Kotlin team, existing Grid investment, IE/old enterprise browser requirements.
5. Migration cost: locator rewrites + wait removal + config rebuild — not a find-and-replace.

## Going Deeper

- [W3C WebDriver specification](https://www.w3.org/TR/webdriver2/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Playwright migration guide from Selenium](https://playwright.dev/docs/selenium-grid)
- [Selenium vs Playwright: architectural comparison](https://www.selenium.dev/documentation/overview/differences/)
