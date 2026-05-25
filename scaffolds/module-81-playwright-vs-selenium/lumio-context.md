# Lumio Context: M81

## Migration scenario

Lumio's engineering team inherited a 180-test Selenium (Python) suite from the previous contractor. The suite tests the admin panel and auth flows. The team is evaluating whether to migrate to Playwright or maintain the existing suite.

## What would be harder in Selenium

| Lumio feature | Playwright approach | Selenium equivalent |
|---|---|---|
| Multi-tab task links | `context.waitForEvent('page')` | `driver.getWindowHandles()` iteration |
| WebSocket notification delivery | `page.on('websocket')` | No built-in; requires proxy |
| Real-time API mocking | `page.route()` | BrowserMob Proxy setup |
| Shadow DOM in TipTap | `frameLocator().locator()` | `executeScript('shadowRoot...')` |
| Parallel browser contexts | One `test.describe` | Separate WebDriver instances |
| Network performance metrics | Navigation Timing via `evaluate()` | Same — no difference |
| GitHub Actions matrix for browsers | `projects` config | Selenium Grid or manual matrix |

## Migration cost estimate for Lumio

- **180 tests** across admin and auth
- **All locators** need rewrites (Selenium uses CSS/XPath; many use internal class names)
- **All explicit waits** (`WebDriverWait`, `time.sleep()`) must be removed
- **conftest.py** (Python fixtures) → `fixtures.ts`
- **Page objects** port relatively cleanly — method names change but structure survives
- **Estimated effort:** 3 weeks for one senior engineer

## When Selenium remains appropriate for Lumio

The existing Selenium suite covers a regression surface that would cost more to migrate than to maintain. For new test coverage of features added after M80, Playwright is used exclusively. The Selenium suite is in maintenance mode — no new tests are written in Selenium.

This is the most common enterprise decision: run both tools in parallel, add new coverage in the modern tool, and migrate legacy tests opportunistically when features change.
