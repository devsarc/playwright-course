# Curriculum Reorganization — Phase 1B: M22–M28 Range Renames (7 Modules)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the remaining 7 module folders (currently at M22–M28) to their spec-correct positions. These moves all target numbers within the M22–M32 range and have ordering constraints — each destination is vacated by a preceding task. Complete tasks **strictly in order**.

**Architecture:** Same approach as Phase 1A — one `git mv` per folder + README content alignment + one commit per task.

**Tech Stack:** Git (PowerShell), Markdown

---

> **PREREQUISITE:** Phase 1A must be fully complete before starting Phase 1B.
> Verify with:
> ```powershell
> $gone = @(20,21,29,30,31,32,33,34,35) | ForEach-Object { Test-Path "tests/module-$_*" }
> if ($gone -contains $true) { Write-Error "Phase 1A is not complete. Finish it before proceeding." }
> else { Write-Host "Phase 1A complete. Safe to proceed." }
> ```

---

> **Ordering constraint:** The 7 renames form a dependency chain because destinations within M22–M32 are vacated by earlier tasks in this plan. The required execution order is:
>
> 1. module-27 → module-32 (32 was vacated by Phase 1A Task 6)
> 2. module-28 → module-31 (31 was vacated by Phase 1A Task 5)
> 3. module-23 → module-28 (28 is now free from Task 2)
> 4. module-24 → module-23 (23 is now free from Task 3)
> 5. module-26 → module-24 (24 is now free from Task 4)
> 6. module-22 → module-26 (26 is now free from Task 5)
> 7. module-25 → module-22 (22 is now free from Task 6)
>
> **Do not skip ahead or reorder.** Each destination must be vacated before it can be used.

---

## Task 1: module-27 → module-32 (WebSocket & SSE Testing)

**Destination vacated by:** Phase 1A Task 6 (module-32-ci-cd → module-39)

**Files:**
- Rename: `tests/module-27-websocket-testing/` → `tests/module-32-websocket-sse-testing/`
- Modify: `tests/module-32-websocket-sse-testing/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-32-websocket-sse-testing
```

Expected: `False`. If `True`, Phase 1A Task 6 is incomplete. Stop and finish it.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-27-websocket-testing tests/module-32-websocket-sse-testing
```

- [ ] **Step 3: Update README heading**

```markdown
# M27: WebSocket Testing
```
→
```markdown
# M32: WebSocket & SSE Testing
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Test SSE (EventSource) streams: intercept with `page.on('response')` and assert event data
- Assert that a real-time notification (WebSocket or SSE) arrives within a time budget using `waitForEvent` with a timeout
```

- [ ] **Step 5: Add SSE note and scope boundaries**

After the `## Key Takeaways` section, add:

```markdown
> **Note — M32 vs M60/M61:** M32 introduces the basic patterns for both WebSocket and SSE delivery testing. M60 (WebSocket Deep Dive) covers payload content assertions and mock WebSocket servers for edge cases. M61 (SSE & Streaming) covers SSE reconnection, ordering, and the SSE vs WebSocket decision framework.

> **SSE testing pattern:**
> ```typescript
> const sseResponse = await page.waitForResponse(res =>
>   res.url().includes('/api/activity') && res.headers()['content-type']?.includes('text/event-stream')
> );
> // EventSource uses repeated response chunks — assert on page state rather than raw frames
> ```
```

- [ ] **Step 6: Check for stale M27 references**

```powershell
Select-String -Path "tests/module-32-websocket-sse-testing/*" -Pattern "M27" -Recurse
```

Replace any found with `M32`.

- [ ] **Step 7: Commit**

```powershell
git add tests/module-32-websocket-sse-testing
git commit -m "refactor(curriculum): rename module-27-websocket to module-32 per spec

Moves WebSocket & SSE Testing from draft position (M27) to spec-correct
position (M32, Phase 8). Adds SSE objective and scope notes pointing to
M60/M61 for deep-dive content."
```

---

## Task 2: module-28 → module-31 (Multi-Tab & Popup Management)

**Destination vacated by:** Phase 1A Task 5 (module-31-tracing-debugging → module-43)

**Files:**
- Rename: `tests/module-28-multi-tab-multi-user/` → `tests/module-31-multi-tab-popup-management/`
- Modify: `tests/module-31-multi-tab-popup-management/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-31-multi-tab-popup-management
```

Expected: `False`.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-28-multi-tab-multi-user tests/module-31-multi-tab-popup-management
```

- [ ] **Step 3: Update README heading**

```markdown
# M28: Multi-Tab and Multi-User Testing
```
→
```markdown
# M31: Multi-Tab & Popup Management
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Wait for a popup window opened by a link click using `context.waitForEvent('page')`
- Handle OAuth login popups: wait for the popup page, fill credentials inside it, assert redirect back to the app
- Coordinate assertions across tabs: perform action in tab A and assert the result in tab B
```

- [ ] **Step 5: Add popup pattern to Concept section**

After the "Two users" code block in `## Concept`, add:

```markdown
**Popup window (link opens new tab):**
```typescript
const [popup] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open in new tab' }).click(),
]);
await popup.waitForLoadState();
await expect(popup).toHaveTitle('Expected Title');
```
`Promise.all` prevents a race: the popup may open before `waitForEvent` is registered if you `click()` first.
```

- [ ] **Step 6: Add M33 forward-reference**

Append to `## Going Deeper`:

```markdown
- M33 (User Journey Simulation) covers multi-user collaboration flows in full: two independent contexts, real-time sync assertions, and multi-step orchestration across users.
```

- [ ] **Step 7: Check for stale M28 references**

```powershell
Select-String -Path "tests/module-31-multi-tab-popup-management/*" -Pattern "M28" -Recurse
```

Replace any found with `M31`.

- [ ] **Step 8: Commit**

```powershell
git add tests/module-31-multi-tab-popup-management
git commit -m "refactor(curriculum): rename module-28-multi-tab to module-31 per spec

Moves Multi-Tab & Popup Management from draft position (M28) to
spec-correct position (M31, Phase 8). Adds popup waitForEvent objective,
OAuth popup pattern, cross-tab assertion objective, and M33 reference."
```

---

## Task 3: module-23 → module-28 (Accessibility Testing)

**Destination vacated by:** Task 2 above (module-28 → module-31)

**Files:**
- Rename: `tests/module-23-accessibility/` → `tests/module-28-accessibility-testing/`
- Modify: `tests/module-28-accessibility-testing/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-28-accessibility-testing
```

Expected: `False`.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-23-accessibility tests/module-28-accessibility-testing
```

- [ ] **Step 3: Update README heading**

```markdown
# M23: Accessibility Testing
```
→
```markdown
# M28: Accessibility Testing
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Filter axe rules by WCAG level: `.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])` to commit to specific conformance levels
- Assert tab order: `press('Tab')` repeatedly and verify `page.evaluate(() => document.activeElement.getAttribute('data-testid'))` matches expected sequence
- Assert focus management: after opening a modal, confirm focus is trapped inside; after closing, confirm focus returns to the trigger
- Verify ARIA role and label correctness: `getByRole('dialog', { name: 'Delete task' })` fails if the role or name is wrong
```

- [ ] **Step 5: Check for stale M23 references**

```powershell
Select-String -Path "tests/module-28-accessibility-testing/*" -Pattern "M23" -Recurse
```

Replace any found with `M28`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-28-accessibility-testing
git commit -m "refactor(curriculum): rename module-23-accessibility to module-28 per spec

Moves Accessibility Testing from draft position (M23) to spec-correct
position (M28, Phase 7). Adds WCAG level filtering, tab order assertion,
focus management, and ARIA role verification objectives."
```

---

## Task 4: module-24 → module-23 (Advanced Input & Interactions)

**Destination vacated by:** Task 3 above (module-23 → module-28)

**Files:**
- Rename: `tests/module-24-drag-and-drop/` → `tests/module-23-advanced-input-interactions/`
- Modify: `tests/module-23-advanced-input-interactions/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-23-advanced-input-interactions
```

Expected: `False`.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-24-drag-and-drop tests/module-23-advanced-input-interactions
```

- [ ] **Step 3: Update README heading**

```markdown
# M24: Drag-and-Drop
```
→
```markdown
# M23: Advanced Input & Interactions
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Use `page.keyboard.press()`, `keyboard.down()`, `keyboard.up()`, and `keyboard.type()` for complex key sequences
- Read and write clipboard content via `page.evaluate(() => navigator.clipboard.readText())`
- Dispatch touch events for mobile interaction testing: `page.touchscreen.tap(x, y)`
- Assert tooltip visibility: hover over an element and verify the tooltip locator `toBeVisible()`
```

- [ ] **Step 5: Update the module scope framing**

Replace the existing `## Concept` opening line(s) with:

```markdown
## Concept

This module covers all "complex input" patterns that go beyond standard `click()` and `fill()`: drag-and-drop, keyboard sequences, clipboard access, touch, and hover states. They share a common challenge — the browser's default event handling is bypassed by synthetic dispatch, so you must use the right API level for each library.
```

- [ ] **Step 6: Add contrast note with M03**

After the DnD library table, add:

```markdown
> **M03 vs M23:** M03 introduced `dragTo()` as the high-level drag API for simple cases. M23 covers `page.mouse` as the low-level escape hatch for libraries (like dnd-kit) that ignore synthetic drag events and require real `mousedown → mousemove → mouseup` sequences.
```

- [ ] **Step 7: Check for stale M24 references**

```powershell
Select-String -Path "tests/module-23-advanced-input-interactions/*" -Pattern "M24" -Recurse
```

Replace any found with `M23`.

- [ ] **Step 8: Commit**

```powershell
git add tests/module-23-advanced-input-interactions
git commit -m "refactor(curriculum): rename module-24-drag-and-drop to module-23 per spec

Moves Advanced Input & Interactions from draft position (M24) to
spec-correct position (M23, Phase 5). Broadens scope to include
keyboard sequences, clipboard, touch events, and tooltip assertions.
Adds M03 contrast note."
```

---

## Task 5: module-26 → module-24 (iFrame & Shadow DOM)

**Destination vacated by:** Task 4 above (module-24 → module-23)

**Files:**
- Rename: `tests/module-26-iframe-interactions/` → `tests/module-24-iframe-shadow-dom/`
- Modify: `tests/module-24-iframe-shadow-dom/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-24-iframe-shadow-dom
```

Expected: `False`.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-26-iframe-interactions tests/module-24-iframe-shadow-dom
```

- [ ] **Step 3: Update README heading**

```markdown
# M26: iFrame Interactions
```
→
```markdown
# M24: iFrame & Shadow DOM
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Navigate nested iframes using chained `frameLocator()` calls: `page.frameLocator('#outer').frameLocator('#inner')`
- Interact with Shadow DOM using `locator.locator(':shadow *')` piercing syntax
- Explain cross-origin iframe limitations: Playwright cannot interact with a cross-origin iframe's DOM; describe the workaround (route the iframe origin via `page.route()` or use `addInitScript` on the outer page)
```

- [ ] **Step 5: Add Shadow DOM section to Concept**

After the `contenteditable (TipTap)` block in `## Concept`, add:

```markdown
**Shadow DOM:**
```typescript
// Pierce into a shadow root
const shadowInput = page.locator('my-custom-element').locator('input');
// Playwright automatically pierces open shadow roots for locator queries
await shadowInput.fill('value');
```
Playwright pierces **open** shadow roots automatically. Closed shadow roots (`mode: 'closed'`) are inaccessible by design — no workaround exists.
```

- [ ] **Step 6: Check for stale M26 references**

```powershell
Select-String -Path "tests/module-24-iframe-shadow-dom/*" -Pattern "M26" -Recurse
```

Replace any found with `M24`.

- [ ] **Step 7: Commit**

```powershell
git add tests/module-24-iframe-shadow-dom
git commit -m "refactor(curriculum): rename module-26-iframe to module-24 per spec

Moves iFrame & Shadow DOM from draft position (M26) to spec-correct
position (M24, Phase 5). Adds nested iframe, shadow DOM piercing, and
cross-origin limitation objectives."
```

---

## Task 6: module-22 → module-26 (Visual Regression Testing)

**Destination vacated by:** Task 5 above (module-26 → module-24)

**Files:**
- Rename: `tests/module-22-visual-regression/` → `tests/module-26-visual-regression-testing/`
- Modify: `tests/module-26-visual-regression-testing/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-26-visual-regression-testing
```

Expected: `False`.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-22-visual-regression tests/module-26-visual-regression-testing
```

- [ ] **Step 3: Update README heading**

```markdown
# M22: Visual Regression Testing
```
→
```markdown
# M26: Visual Regression Testing
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Store baselines in per-platform directories so macOS and Linux CI don't overwrite each other's snapshots
- Mask dynamic content (timestamps, user avatars, random IDs) using the `mask` option to prevent false failures
- Resolve snapshot conflicts after a team member updates baselines on a different OS: use `--update-snapshots` locally with the correct platform flag
```

- [ ] **Step 5: Add per-platform and mask examples to Concept**

After the "Workflow" numbered list in `## Concept`, add:

```markdown
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
```

- [ ] **Step 6: Add scope note distinguishing M25 vs M26**

Append to `## Going Deeper`:

```markdown
- M25 (Screenshot Testing) covers `page.screenshot()` and `locator.screenshot()` as general-purpose capture tools (docs, debugging, CI artifacts). M26 (this module) is specifically about comparison-based regression detection using `toHaveScreenshot()`.
```

- [ ] **Step 7: Check for stale M22 references**

```powershell
Select-String -Path "tests/module-26-visual-regression-testing/*" -Pattern "M22" -Recurse
```

Replace any found with `M26`.

- [ ] **Step 8: Commit**

```powershell
git add tests/module-26-visual-regression-testing
git commit -m "refactor(curriculum): rename module-22-visual-regression to module-26 per spec

Moves Visual Regression Testing from draft position (M22) to spec-correct
position (M26, Phase 6). Adds per-platform snapshots, mask option,
conflict resolution objectives, and distinguishes scope from M25."
```

---

## Task 7: module-25 → module-22 (File Upload, Download & PDF)

**Destination vacated by:** Task 6 above (module-22 → module-26)

**Files:**
- Rename: `tests/module-25-file-upload/` → `tests/module-22-file-upload-download-pdf/`
- Modify: `tests/module-22-file-upload-download-pdf/README.md`

- [ ] **Step 1: Confirm destination is free**

```powershell
Test-Path tests/module-22-file-upload-download-pdf
```

Expected: `False`.

- [ ] **Step 2: Rename the folder**

```powershell
git mv tests/module-25-file-upload tests/module-22-file-upload-download-pdf
```

- [ ] **Step 3: Update README heading**

```markdown
# M25: File Upload
```
→
```markdown
# M22: File Upload, Download & PDF
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Intercept a file download with `page.waitForEvent('download')` and save it to disk for assertion
- Assert downloaded file content: read the saved file with `fs.readFileSync` and verify size or content
- Generate a PDF with `page.pdf()` (Chromium only): understand when to use it and its limitations (no WebKit/Firefox support, requires headful or `--headless=new`)
```

- [ ] **Step 5: Add download and PDF sections to Concept**

After the drag-and-drop code block in `## Concept`, add:

```markdown
**File download:**
```typescript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export CSV' }).click(),
]);
const path = await download.path(); // temp file path
const content = fs.readFileSync(path, 'utf-8');
expect(content).toContain('task-id,title');
```

**PDF generation (`page.pdf()`):**
```typescript
// Chromium only — not supported in Firefox or WebKit
const pdf = await page.pdf({ path: 'report.pdf', format: 'A4' });
expect(pdf.length).toBeGreaterThan(0); // at minimum, assert non-empty
```
`page.pdf()` renders the current page to PDF server-side. It requires Chromium (`chromium` project) and throws in other browsers. Use it when you're testing the PDF export feature itself — not as a general assertion tool.
```

- [ ] **Step 6: Check for stale M25 references**

```powershell
Select-String -Path "tests/module-22-file-upload-download-pdf/*" -Pattern "M25" -Recurse
```

Replace any found with `M22`.

- [ ] **Step 7: Commit**

```powershell
git add tests/module-22-file-upload-download-pdf
git commit -m "refactor(curriculum): rename module-25-file-upload to module-22 per spec

Moves File Upload, Download & PDF from draft position (M25) to
spec-correct position (M22, Phase 5). Adds download event objective,
file content assertion, and page.pdf() with Chromium-only caveat."
```

---

## Phase 1B Verification

After all 7 tasks are complete, verify the complete folder state:

```powershell
Get-ChildItem tests -Directory | Select-Object Name | Sort-Object Name
```

Expected folders (M00–M19 unchanged, then the spec-correct set):

```
module-00-setup
module-01-how-playwright-works
module-02-locators
module-03-actions
module-04-assertions
module-05-navigation
module-06-test-runner
module-07-configuration
module-08-fixtures
module-09-global-setup
module-10-watch-mode
module-11-retries
module-12-network-mocking
module-13-advanced-network
module-14-api-testing
module-15-har-recording
module-16-auth-patterns
module-17-oauth
module-18-session-management
module-19-security-workflows
module-22-file-upload-download-pdf
module-23-advanced-input-interactions
module-24-iframe-shadow-dom
module-26-visual-regression-testing
module-28-accessibility-testing
module-29-performance-testing-measurement
module-31-multi-tab-popup-management
module-32-websocket-sse-testing
module-37-offline-pwa-service-workers
module-39-sharding-large-suites
module-43-tracing-trace-viewer
module-47-page-object-model
module-51-component-testing-foundations
module-63-localization-i18n-testing
module-72-electron-app-testing
module-92-end-to-end-review-capstone
```

No module in the M20–M35 range should remain. Gaps (M20, M21, M25, M27, M30, etc.) are intentional — those are new modules to be created in Phase 2.

Confirm git status is clean:

```powershell
git status
```

Expected: `nothing to commit, working tree clean`
