# M59: Screenshot & Demo Generation

## Learning Objectives

- Script a Playwright flow that captures per-step screenshots for a product walkthrough
- Record a video of a scripted browser interaction using Playwright's built-in video recording
- Understand Playwright as a visual documentation and demo generation tool
- Assemble a demo walkthrough from sequentially named screenshots

## Concept

Playwright is typically used to verify that software works. But the same browser automation that drives tests can drive demo recordings — scripted flows that produce screenshots and videos for product documentation, marketing materials, and onboarding content. The key difference from testing: the goal is producing a compelling visual artifact, not asserting a boolean result.

**Per-step screenshots.** The pattern: perform an action, take a screenshot, name it sequentially, repeat. The sequential naming produces a folder of images that assembles into a slideshow or animated GIF:

```typescript
let step = 0;
const capture = async (label: string) => {
  await page.screenshot({ path: `demo/step-${String(++step).padStart(2, '0')}-${label}.png` });
};

await page.goto('/dashboard');
await capture('dashboard-initial');

await page.getByRole('button', { name: 'Add task' }).first().click();
await capture('add-task-dialog-open');

await page.getByTestId('task-title-input').fill('Launch new feature');
await capture('task-title-filled');
```

The `padStart(2, '0')` zero-pads the step number so `01`, `02`, `10` sort correctly in file explorers.

**Video recording.** Playwright records video at the browser context level. Configure it in `newContext()`:

```typescript
const context = await browser.newContext({
  recordVideo: {
    dir: 'demo-videos/',
    size: { width: 1280, height: 720 },
  },
});
```

After the context closes, the video file appears in `demo-videos/`. The video captures everything that happens in the browser — use `slowMo` to slow down interactions for readability:

```typescript
const context = await browser.newContext({
  recordVideo: { dir: 'demo-videos/' },
  slowMo: 500, // 500ms delay between each Playwright action
});
```

**Playwright as a documentation tool.** Every module of this curriculum was designed partly with this use case in mind. A product that releases a new feature can use Playwright to: automatically generate onboarding screenshots when the feature is deployed, record a 60-second demo video of the feature's happy path, regenerate both when the UI changes. The screenshots are always accurate because they're produced from the live app, not hand-crafted in design tools.

**`page.screenshot()` options.** The screenshot API has options that matter for demo generation:
- `{ fullPage: true }` — captures the full scrollable page, not just the viewport
- `{ clip: { x, y, width, height } }` — captures a specific region (useful for highlighting one component)
- `{ mask: [locator] }` — masks sensitive areas with a colored box (useful for obscuring test credentials in demo screenshots)
- `{ animations: 'disabled' }` — disables CSS animations for cleaner, consistent screenshots

**Scripting for demos vs. scripting for tests.** Demo scripts don't need assertions — a failed assertion stops the flow before the demo completes. Instead, use `await page.waitForLoadState('networkidle')` to ensure the page is stable before capturing. Demo scripts also benefit from explicit `waitForSelector()` calls to ensure elements are visible before capturing.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-59-screenshot-demo-generation
```

## Key Takeaways

1. Per-step screenshots use sequential naming (`01-step`, `02-step`) for correct sort order.
2. Video recording is configured on `browser.newContext()` with `recordVideo: { dir }`.
3. `slowMo` on the context slows all interactions for more readable video output.
4. `page.screenshot({ mask: [locator] })` obscures sensitive content in demo screenshots.
5. Demo scripts omit assertions — use `waitForLoadState` and `waitForSelector` for stability instead.

## Going Deeper

- [Playwright docs: page.screenshot()](https://playwright.dev/docs/api/class-page#page-screenshot)
- [Playwright docs: Video recording](https://playwright.dev/docs/videos)
- [Playwright docs: slowMo](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-slow-mo)
