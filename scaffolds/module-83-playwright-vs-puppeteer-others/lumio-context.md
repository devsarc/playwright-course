# Lumio Context: M83

## Where Lumio uses Puppeteer alongside Playwright

Lumio's codebase uses two automation tools:

| Usage | Tool | Why |
|---|---|---|
| Test suite (this repo) | Playwright | Multi-browser, auto-wait, built-in test isolation |
| Server-side PDF export | Puppeteer | Chrome-only, embedded in Next.js API route, no test framework needed |
| Screenshot capture (server) | Puppeteer | Same: Chrome-only, embedded Node.js script |

The PDF export at `/api/export/pdf` uses `puppeteer` in headless mode on the server to render the task list and produce a PDF. This is a focused, Chrome-only task — no multi-browser, no auto-wait needed. Replacing it with Playwright would add unnecessary overhead.

## Tool comparison for Lumio's specific needs

| Requirement | Playwright | Puppeteer | Cypress | WDIO |
|---|---|---|---|---|
| Firefox/WebKit tests | ✅ | ❌ | Firefox only | ✅ |
| Multi-tab | ✅ | ✅ | ❌ | ✅ |
| Cross-origin OAuth | ✅ | ✅ | ❌ | ✅ |
| Extension testing | ✅ | ✅ | ❌ | ❌ |
| Electron testing | ✅ | ❌ | ❌ | ❌ |
| Built-in test isolation | ✅ | ❌ | ✅ | ❌ |
| Server-side PDF | ✅ (Chromium) | ✅ | ❌ | ❌ |
| Auto-waiting | ✅ | ❌ | ✅ | Partial |

## Polyglot team scenario

Lumio's QA team uses TypeScript (Playwright). A backend team writing integration tests in Python could use `playwright` (PyPI) against the same Lumio dev server — same locator patterns, same API. A Java team could use `com.microsoft.playwright:playwright`. All three teams run their tests against the same Next.js dev server defined in `playwright.config.ts`, collaborating on a shared test infrastructure without sharing language.
