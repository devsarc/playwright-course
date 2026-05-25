# M26: Visual Regression Testing

## Learning Objectives

- Take full-page and element-scoped screenshots with `toHaveScreenshot()`
- Understand the baseline creation workflow (first run writes, second run compares)
- Update baselines intentionally with `--update-snapshots`
- Tune thresholds to handle minor rendering differences
- Store baselines in per-platform directories so macOS and Linux CI don't overwrite each other's snapshots
- Mask dynamic content (timestamps, user avatars, random IDs) using the `mask` option to prevent false failures
- Resolve snapshot conflicts after a team member updates baselines on a different OS: use `--update-snapshots` locally with the correct platform flag

## Concept

Visual regression catches what functional tests can't:
- A button's background changed from blue to grey
- A grid's spacing shrank by 4px
- Dark mode colours leaked into light mode

`toHaveScreenshot()` does pixel-by-pixel comparison. The first run creates the
baseline; subsequent runs diff against it.

**Workflow:**
1. Write test → run → baseline created → test fails (expected — no baseline yet)
2. Review the new PNG in `__screenshots__/`
3. Re-run → test passes (baseline matches itself)
4. UI changes → test fails → inspect diff → update with `--update-snapshots`

**Per-platform snapshots:**
```typescript
// playwright.config.ts
snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{platform}{ext}',
```
This stores `dashboard-linux.png` and `dashboard-darwin.png` separately, so cross-platform CI doesn't fail on minor rendering differences.

**Masking dynamic regions:**
```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.getByTestId('timestamp'), page.getByTestId('user-avatar')],
});
```
Masked regions are replaced with a solid colour before comparison — they never cause false failures.

## Key Takeaways

1. Scope screenshots to elements, not full pages, for more stable tests.
2. Commit baseline PNGs to git — CI needs them.
3. `--update-snapshots` is intentional; don't run it blindly.
4. `maxDiffPixelRatio` handles anti-aliasing differences across OS/GPU.

## Going Deeper

- [Playwright docs: Screenshots](https://playwright.dev/docs/screenshots)
- [Playwright docs: Visual comparisons](https://playwright.dev/docs/test-snapshots)
- M25 (Screenshot Testing) covers `page.screenshot()` and `locator.screenshot()` as general-purpose capture tools (docs, debugging, CI artifacts). M26 (this module) is specifically about comparison-based regression detection using `toHaveScreenshot()`.
