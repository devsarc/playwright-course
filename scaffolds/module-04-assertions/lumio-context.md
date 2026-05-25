# Lumio Context: M04

At M04, we're still testing the landing page. Key elements:

- Page `<title>`: "Lumio — Team Productivity"
- `<h1>` hero heading: visible
- 4 feature cards with `data-testid="feature-card"`
- 3 pricing cards with tier headings (Free, Pro, Enterprise) as `<h3>`
- "Get started free" `<a>` link with `href="/signup"`

The `expect.poll` test uses a JavaScript timer (not a DOM element) — this is
intentional to show that `expect.poll` handles non-Playwright values, whereas
`toBeVisible()` and other matchers handle Playwright locators.
