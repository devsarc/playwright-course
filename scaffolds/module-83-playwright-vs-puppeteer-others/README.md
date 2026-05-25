# M83: Playwright vs Puppeteer & Others

## Learning Objectives

- Distinguish Playwright from Puppeteer: same CDP foundation, very different scope
- Know when Puppeteer is the right tool for Chrome-only automation tasks (scraping, PDF generation)
- Understand the decision framework for WebdriverIO, TestCafe, and Nightwatch in specific contexts
- Apply multi-language binding awareness: choose the right Playwright binding for your team's language

## Concept

**Playwright vs Puppeteer.**

Puppeteer and Playwright share a creator (the Playwright team left Google to build Playwright) and both use CDP under the hood. The key differences:

| Dimension | Playwright | Puppeteer |
|---|---|---|
| Browsers | Chromium, Firefox, WebKit | Chromium only (Firefox experimental) |
| Languages | JS/TS, Python, Java, C# | JS/TS only |
| Testing framework | Built-in (`@playwright/test`) | Requires external (Jest, Mocha) |
| Auto-waiting | Yes (built into locators) | No (must use `page.waitForSelector`) |
| Network mocking | `page.route()` | `page.setRequestInterception()` |
| Test isolation | `BrowserContext` per test | Manual context management |
| Maintained by | Microsoft | Google |

For scraping and automation scripts where you control the environment, Puppeteer is simpler and lighter. For test suites requiring Firefox/WebKit, built-in test isolation, and auto-waiting, Playwright is the clear choice.

**Puppeteer's sweet spot.**

Puppeteer excels at:
- Chrome-only server-side tasks: PDF generation, screenshot services, headless scraping
- Embedding in existing Node.js apps that already have a test framework
- Tight Chrome version control (Puppeteer pins a specific Chromium revision)

Playwright replaced Puppeteer for Lumio's test suite, but Lumio's server-side PDF generation still uses Puppeteer (via the `puppeteer` package in the Next.js server) because it's a focused Chrome-only task with no multi-browser requirement.

**WebdriverIO.**

WebdriverIO (WDIO) bridges WebDriver and CDP — it supports both Selenium Grid targets and direct Chrome CDP. It has a rich plugin ecosystem and a built-in test runner. Choose WDIO when:
- The team needs Selenium Grid integration with a modern JS API
- The app requires AppiumDriver for mobile native testing alongside web
- The organization has existing WDIO configuration and scripts
- You need fine-grained control over WebDriver capabilities

**TestCafe.**

TestCafe uses a proxy-based approach — no WebDriver, no CDP. Tests run as injected scripts. Advantages: zero browser driver installation, works with any browser that can run JavaScript. Choose TestCafe when the team wants the simplest possible CI setup (no playwright install, no chromedriver, no geckodriver) and the feature set is sufficient.

**Nightwatch.**

Nightwatch uses WebDriver under the hood but provides a simpler fluent API. It has first-class support for cloud grids (BrowserStack, Sauce Labs). Choose Nightwatch when: the team needs a simple WebDriver wrapper with cloud grid integration and no desire to switch to Playwright's CDP model.

**Multi-language Playwright bindings.**

Playwright provides official clients for:

| Language | Package | Maintained by |
|---|---|---|
| JavaScript/TypeScript | `@playwright/test` | Microsoft |
| Python | `playwright` (PyPI) | Microsoft |
| Java | `com.microsoft.playwright:playwright` | Microsoft |
| C# | `Microsoft.Playwright` | Microsoft |

All four bindings provide the same core API surface — page, context, locators, network interception. For a polyglot team, different Playwright bindings can test the same application from different languages, all against the same Lumio dev server.

**Decision framework.**

```
Need Firefox/WebKit? → Playwright (Puppeteer is out)
Need mobile native (iOS/Android)?  → Appium
Chrome-only, no test framework needed? → Puppeteer or Playwright
Java team, Selenium Grid investment? → WebdriverIO or Playwright Java
Simple setup, no CDP? → TestCafe
Existing Nightwatch + cloud grid? → Nightwatch
Default (new project, modern team) → Playwright
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-83-playwright-vs-puppeteer-others
```

## Key Takeaways

1. Playwright and Puppeteer both use CDP for Chromium — the difference is Firefox/WebKit support, auto-waiting, and built-in test isolation.
2. Puppeteer remains the right choice for Chrome-only server-side tasks (PDF, screenshot services) that don't need multi-browser.
3. WebdriverIO bridges WebDriver and CDP — choose it when Selenium Grid integration is required alongside modern JS.
4. Playwright's multi-language bindings (Python, Java, C#) let polyglot teams use one tool across language boundaries.
5. Default to Playwright for new projects — migrate away only when a specific binding, platform, or ecosystem constraint forces it.

## Going Deeper

- [Puppeteer docs](https://pptr.dev/)
- [WebdriverIO docs](https://webdriver.io/docs/gettingstarted)
- [TestCafe docs](https://testcafe.io/documentation/402635/getting-started)
- [Playwright Python docs](https://playwright.dev/python/docs/intro)
- [Playwright Java docs](https://playwright.dev/java/docs/intro)
