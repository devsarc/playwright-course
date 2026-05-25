# Playwright Learning Platform — Module Index

Modules appear here as they are unlocked. Each unlocked module contains:
- `exercise.spec.ts` — TODOs for the learner to complete
- `hints.md` — exact code answers for each TODO
- `lumio-context.md` — which Lumio features are tested and where to find them
- `README.md` — learning objectives, concept summary, and key takeaways

Pristine copies of all modules live in `scaffolds/`. CI copies the full module directory
here when you pass the current module's tests.

Run a module's tests:
```bash
npx playwright test tests/module-NN-slug --headed
```

---

## Module Table

| Module | Directory | Topic |
|--------|-----------|-------|
| M00 | `module-00-setup` | Setup & Project Structure |
| M01 | `module-01-how-playwright-works` | How Playwright Works Internally (awareness) |
| M02 | `module-02-locators` | Locators — Finding Elements |
| M03 | `module-03-actions` | Actions — Interacting with Elements |
| M04 | `module-04-assertions` | Assertions — Verifying State |
| M05 | `module-05-navigation` | Navigation & Page State |
| M06 | `module-06-test-runner` | Test Runner Fundamentals |
| M07 | `module-07-configuration` | Configuration Deep Dive |
| M08 | `module-08-fixtures` | Fixtures & Dependency Injection |
| M09 | `module-09-global-setup` | Global Setup & Teardown |
| M10 | `module-10-watch-mode` | Watch Mode & Developer Workflow |
| M11 | `module-11-retries` | Retries & Flakiness Management |
| M12 | `module-12-network-mocking` | Network Interception & Mocking |
| M13 | `module-13-advanced-network` | Advanced Network Patterns |
| M14 | `module-14-api-testing` | API Testing with request Fixture |
| M15 | `module-15-har-recording` | HAR Recording & Network Analysis |
| M16 | `module-16-auth-patterns` | Authentication Patterns |
| M17 | `module-17-oauth` | OAuth & SSO Flows |
| M18 | `module-18-session-management` | Cookie, Storage & Session Management |
| M19 | `module-19-security-workflows` | Security Workflow Testing |
| M20 | `module-20-form-automation` | Form Automation & Validation |
| M21 | `module-21-dialogs` | Dialog & Alert Handling |
| M22 | `module-22-file-upload-download-pdf` | File Upload, Download & PDF |
| M23 | `module-23-advanced-input-interactions` | Advanced Input & Interactions |
| M24 | `module-24-iframe-shadow-dom` | iFrame & Shadow DOM |
| M25 | `module-25-screenshot-testing` | Screenshot Testing |
| M26 | `module-26-visual-regression-testing` | Visual Regression Testing |
| M27 | `module-27-aria-snapshots` | ARIA Snapshot Testing |
| M28 | `module-28-accessibility-testing` | Accessibility Testing |
| M29 | `module-29-performance-testing-measurement` | Performance Testing & Measurement |
| M30 | `module-30-har-devtools` | HAR & DevTools Deep Analysis |
| M31 | `module-31-multi-tab-popup-management` | Multi-Tab & Popup Management |
| M32 | `module-32-websocket-sse-testing` | WebSocket & SSE Testing |
| M33 | `module-33-user-journeys` | User Journey Simulation |
| M34 | `module-34-cross-browser` | Cross-Browser Testing Strategy |
| M35 | `module-35-mobile-emulation` | Mobile Emulation & Responsive Testing |
| M36 | `module-36-geolocation-permissions` | Geolocation, Permissions & Device APIs |
| M37 | `module-37-offline-pwa-service-workers` | Offline, PWA & Service Workers |
| M38 | `module-38-parallel-execution` | Parallel Execution & Test Isolation |
| M39 | `module-39-sharding-large-suites` | Sharding for Large Suites |
| M40 | `module-40-ci-cd` | CI/CD Pipeline Setup |
| M41 | `module-41-webserver-config` | WebServer Config & Test Environment |
| M42 | `module-42-inspector-codegen` | Playwright Inspector & Codegen |
| M43 | `module-43-tracing-trace-viewer` | Tracing & Trace Viewer |
| M44 | `module-44-reporters-deep-dive` | Reporters Deep Dive |
| M45 | `module-45-debugging-strategies` | Debugging Strategies |
| M46 | `module-46-test-step-attachments` | test.step() & Runtime Attachments |
| M47 | `module-47-page-object-model` | Page Object Model |
| M48 | `module-48-advanced-fixture-patterns` | Advanced Fixture Patterns |
| M49 | `module-49-data-driven-testing` | Data-Driven Testing |
| M50 | `module-50-test-organization` | Test Organization & Suite Architecture |
| M51 | `module-51-component-testing-foundations` | Component Testing Foundations |
| M52 | `module-52-react-component-testing` | React Component Testing |
| M53 | `module-53-vue-component-testing` | Vue Component Testing |
| M54 | `module-54-network-mocking-component-tests` | Network Mocking in Component Tests |
| M55 | `module-55-web-scraping-fundamentals` | Web Scraping Fundamentals |
| M56 | `module-56-advanced-scraping-data-extraction` | Advanced Scraping & Data Extraction |
| M57 | `module-57-web-crawling-link-monitoring` | Web Crawling & Link Monitoring |
| M58 | `module-58-automated-form-filling-bots` | Automated Form Filling & Bots |
| M59 | `module-59-screenshot-demo-generation` | Screenshot & Demo Generation |
| M60 | `module-60-websocket-deep-dive` | WebSocket Deep Dive |
| M61 | `module-61-sse-streaming` | SSE & Streaming |
| M62 | `module-62-cdp-direct-access` | CDP Direct Access |
| M63 | `module-63-localization-i18n-testing` | Localization & i18n Testing |
| M64 | `module-64-feature-flag-ab-testing` | Feature Flag & A/B Testing |
| M65 | `module-65-security-workflow-testing` | Security Workflow Testing (Deep) |
| M66 | `module-66-oauth-sso-deep-dive` | OAuth & SSO Deep Dive |
| M67 | `module-67-chatbot-rich-ui-interaction` | Chatbot & Rich UI Interaction |
| M68 | `module-68-cms-admin-panel-automation` | CMS & Admin Panel Automation |
| M69 | `module-69-seo-meta-verification` | SEO & Meta Verification |
| M70 | `module-70-broken-link-navigation-monitoring` | Broken Link & Navigation Monitoring |
| M71 | `module-71-browser-extension-testing` | Browser Extension Testing |
| M72 | `module-72-electron-app-testing` | Electron App Testing |
| M73 | `module-73-android-device-automation` | Android Device Automation (awareness) |
| M74 | `module-74-synthetic-monitoring-fundamentals` | Synthetic Monitoring Fundamentals |
| M75 | `module-75-scheduled-bots-cron-tasks` | Scheduled Bots & Cron Tasks |
| M76 | `module-76-uptime-performance-monitoring` | Uptime & Performance Monitoring |
| M77 | `module-77-ai-test-planning` | AI Test Planning |
| M78 | `module-78-ai-test-code-generation` | AI Test Code Generation |
| M79 | `module-79-ai-test-healing` | AI Test Healing |
| M80 | `module-80-mcp-server-agent-integration` | MCP Server & Agent Integration |
| M81 | `module-81-playwright-vs-selenium` | Playwright vs Selenium |
| M82 | `module-82-playwright-vs-cypress` | Playwright vs Cypress |
| M83 | `module-83-playwright-vs-puppeteer-others` | Playwright vs Puppeteer & Others |
| M84 | `module-84-flakiness-root-cause-analysis` | Flakiness Root Cause Analysis |
| M85 | `module-85-test-maintenance-long-term-strategy` | Test Maintenance & Long-term Strategy |
| M86 | `module-86-cicd-pipeline-optimization` | CI/CD Pipeline Optimization |
| M87 | `module-87-secrets-security-in-tests` | Secrets & Security in Tests |
| M88 | `module-88-test-health-observability` | Test Health Observability |
| M89 | `module-89-smoke-suite-for-lumio` | Smoke Suite for Lumio |
| M90 | `module-90-full-regression-suite-organization` | Full Regression Suite Organization |
| M91 | `module-91-production-incident-reproduction` | Production Incident Reproduction |
| M92 | `module-92-end-to-end-review-capstone` | End-to-End Review & Capstone |

---

## Shared Infrastructure

- `tests/fixtures/fixtures.ts` — extended test/expect with project-wide fixtures
- `playwright.config.ts` — main config (baseURL, projects, webServer)
- `playwright-ct.config.ts` — React Component Testing config (M51–M52, M54)
- `playwright-ct-vue.config.ts` — Vue Component Testing config (M53)
- `.github/workflows/playwright.yml` — CI workflow with sharding (M40)
