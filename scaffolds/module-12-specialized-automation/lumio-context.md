# Lumio Context: Lesson 12

## Part 1 — Web Scraping Fundamentals (formerly M55)

### What's in Lumio at this point

Lumio's dashboard (`/dashboard`) renders a Kanban board with task cards. Each card has:
- `data-testid="task-card"` — the card container
- `data-priority="high|medium|low"` — the task's priority level
- `h3` — the task title

The board also has column containers with `data-column="todo|in-progress|done"`. Scoping a `querySelectorAll` to a specific column extracts only that column's tasks.

### Public project directory

In a later module, Lumio will have a public project directory page — a list of public projects with names, descriptions, and member counts. That's the "public project directory" referenced in the spec's original M55 framing. For now, the Kanban board is the extraction target.

### Why scrape Lumio instead of an external site

Using Lumio as the scraping target means:
- The data structure is known and stable
- No external service dependency
- The scraping exercises work offline
- The `data-testid` attributes provide clean extraction hooks

In real-world scraping, the target site has no `data-testid` attributes — you'd rely on CSS classes, element structure, and text content. The principles are identical; the selectors are messier.

## Part 2 — Advanced Scraping & Data Extraction (formerly M56)

### What's in Lumio at this point

Lumio's dashboard requires authentication. The login flow: POST credentials to NextAuth → redirect to `/dashboard`. The browser context retains the session cookie automatically.

For scraping tasks behind auth, log in via the UI or restore a previously saved `storageState`. Once authenticated, navigate freely to any protected endpoint.

### Infinite scroll relevance

Lumio's Kanban columns don't use infinite scroll by default — tasks are all loaded at once. However, Lumio's activity feed (if visible) may paginate or stream. The infinite scroll pattern is taught here for real-world applicability — most production apps with large datasets use it.

### CSV output location

The exercise writes to `tests/module-12-specialized-automation/scraped-tasks.csv`. This file is cleaned up after the test. In a real scraping project, point the output to a dedicated `output/` directory and add it to `.gitignore`.

## Part 3 — Web Crawling & Link Monitoring (formerly M57)

### What's in Lumio at this point

Lumio's navigation includes: `/dashboard`, `/settings`, `/settings/profile`, `/settings/billing`, `/settings/team`. All are authenticated routes. Crawling begins after login.

### Expected links on the dashboard

The Lumio dashboard contains navigation links in the sidebar and header. A crawl from `/dashboard` might discover:
- `/dashboard` (self-link in logo)
- `/settings`
- `/notifications`
- Any project-specific URLs

### Site map output format

```json
[
  { "url": "/dashboard", "status": 200, "linksFound": 5 },
  { "url": "/settings", "status": 200, "linksFound": 3 }
]
```

Write with `JSON.stringify(siteMap, null, 2)` for readable output.

### robots.txt

Lumio's test environment doesn't have a `robots.txt` with disallowed paths. In production scraping, always check `${origin}/robots.txt` before crawling and skip any `Disallow:` paths.

## Part 4 — Automated Form Filling & Bots (formerly M58)

### What's in Lumio at this point

Lumio's task creation form accepts a required title. The form rejects empty titles and keeps the dialog open. This makes it a useful target for bot error handling — one bad row (empty title) fails, the rest succeed.

### CAPTCHA

Lumio's test environment has no CAPTCHA. The production Lumio would add reCAPTCHA or hCaptcha on login, not on internal task creation (which is behind authentication anyway).

### Bulk task import

The bot pattern in this module is a simplified version of a real product feature: bulk task import from CSV. Lumio's production roadmap includes a CSV import feature — the bot in this module demonstrates what that feature does under the hood, using the same form that users fill manually.

## Part 5 — Screenshot & Demo Generation (formerly M59)

### What's in Lumio at this point

Lumio's full feature set — Kanban board, task creation, drag-and-drop, notifications, settings — is the target for a product demo walkthrough. A well-scripted demo flow:

1. Open dashboard — show the empty board
2. Create a task — show the dialog and form fill
3. Submit — show the task card appear
4. Drag to In Progress — show the board update
5. Open task detail — show the full task view

Each step gets a screenshot; the entire sequence gets a video recording.

### Demo output organization

```
demo-output/
├── step-01-dashboard.png
├── step-02-dialog-open.png
├── step-03-title-filled.png
├── step-04-task-created.png
├── step-05-task-in-progress.png
└── demo-video.webm
```

The sequential naming ensures the screenshots sort correctly and can be assembled into a slideshow with any image viewer or presentation tool.

### Automation for marketing

This pattern — Playwright generating screenshots for documentation — is production-ready. Large SaaS products use it to:
- Keep help center screenshots in sync with UI changes (regenerate on deploy)
- Generate product comparison images for marketing pages
- Record release notes videos showing new features
