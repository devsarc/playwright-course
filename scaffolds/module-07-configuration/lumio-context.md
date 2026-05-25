# Lumio Context: M07

## What's tested

M07 tests the landing page (`/`) across multiple browser configurations.
The focus is on the config file, not Lumio features.

## Why multiple projects matter for Lumio

Lumio's navbar has responsive behavior:
- Desktop (> 768px viewport): full nav links are visible
- Mobile (≤ 768px viewport): nav links are hidden, a hamburger menu button appears

The `mobile-chrome` project using `devices['Pixel 5']` (393px wide) triggers
the mobile layout. Desktop Chrome (1280px) shows the full nav.

Testing both ensures the responsive behavior works across real device conditions,
not just CSS media query conditions in unit tests.

## Running with the M07 config

```bash
npx playwright test tests/module-07-configuration \
  --config=tests/module-07-configuration/playwright-m07.config.ts
```

This runs each test once per project (chromium, firefox, webkit, mobile-chrome)
after you've added the TODO projects. The HTML report shows each test × browser combination.
