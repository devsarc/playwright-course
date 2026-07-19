# Playwright Learning Platform — Module Index

Modules appear here as they are unlocked. Each unlocked module contains:
- `exercise.spec.ts` — TODOs for the learner to complete
- `hints.md` — exact code answers for each TODO
- `lumio-context.md` — which Lumio features are tested and where to find them
- `README.md` — learning objectives, concept summary, and key takeaways

Pristine copies of all modules live in `scaffolds/`. CI copies the full module directory
here when you pass the current module's tests. Each lesson merges several of the original
93-module curriculum's topics into numbered Parts (see each lesson's README for the Part
breakdown).

Run a module's tests:
```bash
npx playwright test tests/module-NN-slug --headed
```

---

## Module Table

| Lesson | Directory | Topic |
|--------|-----------|-------|
| M00 | `module-00-foundations` | Foundations: Environment, Locators, Actions & Navigation |
| M01 | `module-01-test-runner-organization` | Test Runner & Organization |
| M02 | `module-02-network-and-apis` | Network & API Testing |
| M03 | `module-03-auth-and-sessions` | Authentication & Session Management |
| M04 | `module-04-forms-and-interactions` | Forms, Dialogs & Advanced Interactions |
| M05 | `module-05-visual-a11y-performance` | Visual, Accessibility & Performance Testing |
| M06 | `module-06-realtime-and-user-flows` | Multi-Tab, Real-Time & Complex User Flows |
| M07 | `module-07-cross-browser-and-mobile` | Cross-Browser & Mobile Testing |
| M08 | `module-08-scale-and-cicd` | Scale, Parallelism & CI/CD |
| M09 | `module-09-debugging-and-reporting` | Debugging, Tracing & Reporting |
| M10 | `module-10-architecture-and-patterns` | Test Architecture & Design Patterns |
| M11 | `module-11-component-testing` | Component Testing: React & Vue |
| M12 | `module-12-specialized-automation` | Specialized Automation: Scraping, Crawling & Bots |
| M13 | `module-13-realtime-protocols-and-cdp` | WebSocket, SSE & CDP Deep Dive |
| M14 | `module-14-specialized-testing-types` | Specialized Testing Types: i18n, Flags, Security, Chat & CMS |
| M15 | `module-15-platform-specific-testing` | Platform-Specific Testing: Extensions, Electron & Android |
| M16 | `module-16-monitoring-and-synthetic` | Synthetic Monitoring & Scheduled Bots |
| M17 | `module-17-ai-and-modern-tooling` | AI-Assisted Testing & MCP Integration |
| M18 | `module-18-decision-making-and-patterns` | Decision-Making & Real-World Patterns |
| M19 | `module-19-capstone` | Capstone: Full Suite Organization & Review |

---

## Shared Infrastructure

- `tests/fixtures/fixtures.ts` — extended test/expect with project-wide fixtures
- `playwright.config.ts` — main config (baseURL, projects, webServer)
- `playwright-ct.config.ts` — React Component Testing config (Lesson 11, Parts 1/2/4)
- `playwright-ct-vue.config.ts` — Vue Component Testing config (Lesson 11, Part 3)
- `.github/workflows/playwright.yml` — CI workflow with sharding (Lesson 08, Part 3)
