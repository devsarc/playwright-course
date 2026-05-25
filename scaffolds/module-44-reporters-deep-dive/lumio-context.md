# Lumio Context: M44

## What's in Lumio at this point

Lumio is a full Next.js application. The exercises in this module focus primarily on Playwright configuration rather than app interaction — most TODOs read `playwright.config.ts` and assert structural properties.

The final test (TODO 10) navigates to the Lumio dashboard to confirm a real browser run happened, so the HTML report captures a live trace.

## Recommended playwright.config.ts changes

For this module to pass, add multiple reporters to your config:

```typescript
reporter: process.env.CI
  ? [
      ['github'],
      ['junit', { outputFile: 'results/junit.xml' }],
      ['blob', { outputDir: 'blob-results' }],
    ]
  : [
      ['list'],
      ['html', { outputFolder: 'playwright-report', open: 'never' }],
      ['junit', { outputFile: 'junit-results.xml' }],
    ],
```

The `process.env.CI` guard is standard practice: interactive reporters (html, list) locally; machine-readable reporters (github, junit, blob) in CI.

## Running the HTML report

```bash
npx playwright test tests/module-44-reporters-deep-dive
npx playwright show-report
```

The HTML report opens at `http://localhost:9323`. Click any test to see its trace, console output, and attached screenshots.
