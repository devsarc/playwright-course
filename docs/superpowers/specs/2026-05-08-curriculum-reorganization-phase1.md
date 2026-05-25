# Design: Curriculum Reorganization — Phase 1 (Rename M20–M35 to Spec Positions)

**Date:** 2026-05-08
**Status:** Approved

---

## Context

M00–M19 are correctly aligned with the approved spec (`2026-05-08-playwright-learning-platform-design.md`). M20–M35 were built from an earlier plan draft that compressed and reordered topics differently from the final spec. The spec is the canonical source of truth, so M20–M35 must be renamed to their correct spec positions before new modules are added.

---

## Goal

Move all 16 existing M20–M35 folders to their spec-correct numbers using `git mv`, then update the content inside each module to align with its new position. No new exercises are written in this phase — only reorganization and content alignment.

---

## Rename Mapping

| From (current) | To (spec-correct) | Spec title |
|---|---|---|
| `module-20-page-object-model` | `module-47-page-object-model` | Page Object Model |
| `module-21-component-testing` | `module-51-component-testing-foundations` | Component Testing Foundations |
| `module-22-visual-regression` | `module-26-visual-regression-testing` | Visual Regression Testing |
| `module-23-accessibility` | `module-28-accessibility-testing` | Accessibility Testing |
| `module-24-drag-and-drop` | `module-23-advanced-input-interactions` | Advanced Input & Interactions |
| `module-25-file-upload` | `module-22-file-upload-download-pdf` | File Upload, Download & PDF |
| `module-26-iframe-interactions` | `module-24-iframe-shadow-dom` | iFrame & Shadow DOM |
| `module-27-websocket-testing` | `module-32-websocket-sse-testing` | WebSocket & SSE Testing |
| `module-28-multi-tab-multi-user` | `module-31-multi-tab-popup-management` | Multi-Tab & Popup Management |
| `module-29-service-worker-pwa` | `module-37-offline-pwa-service-workers` | Offline, PWA & Service Workers |
| `module-30-electron` | `module-72-electron-app-testing` | Electron App Testing |
| `module-31-tracing-debugging` | `module-43-tracing-trace-viewer` | Tracing & Trace Viewer |
| `module-32-ci-cd` | `module-39-sharding-large-suites` | Sharding for Large Suites |
| `module-33-performance` | `module-29-performance-testing-measurement` | Performance Testing & Measurement |
| `module-34-internationalization` | `module-63-localization-i18n-testing` | Localization & i18n Testing |
| `module-35-capstone` | `module-92-end-to-end-review-capstone` | End-to-End Review & Capstone |

---

## Per-Module Content Review Checklist

For each renamed module, update:

1. **README heading** — `# MXX: <Title>` → correct number and spec title
2. **Module number references in prose** — any "M20", "M22" etc. in body text updated
3. **Learning objectives** — compare against spec "Key Concepts" column; append missing concepts as new bullet points at the end of the existing list; do not remove or rewrite existing objectives
4. **Cross-links** — "See M28" / "contrast with M03" style references updated to correct numbers
5. **Scope gap notes** — where the spec defines broader scope than the existing exercise covers, add a `> **Note:** Full spec scope also includes X — to be added in a later content pass.` callout at the end of the concept section

---

## Edge Case: module-32-ci-cd → module-39-sharding-large-suites

The existing module covers both sharding and CI/CD pipeline setup. After rename:
- Title and learning objectives updated to spec M39 focus: `--shard` flag, CI matrix, blob reporter, `createMergedReport`
- A note added to the README: "M40 (CI/CD Pipeline Setup) covers GitHub Actions workflow, reporters, caching, and artifact upload. Some of that content currently lives here and will be formally split when M40 is created."
- No content is deleted — it stays in M39 for now.

## Edge Case: module-35-capstone → module-92-end-to-end-review-capstone

The existing capstone has a "what you've learned" table referencing old module numbers (M20–M35). After rename:
- The summary table is updated to reference correct module numbers per the rename mapping above
- README title becomes `# M92: End-to-End Review & Capstone`
- A note is added: "This capstone will be revisited and expanded when M36–M91 are complete."

---

## What This Phase Does NOT Do

- Does not write new `exercise.spec.ts` files
- Does not create the spec's M20–M35 gap modules (Form Automation, Dialog Handling, etc.) — that is Phase 2
- Does not build M36–M91 — subsequent phases
- Does not modify M00–M19 (correctly positioned, no changes needed)

---

## Commit Strategy

Each `git mv` and its content update are done in the **same commit** (single atomic change per module). Format:

```
refactor(curriculum): rename module-XX to module-YY per spec

Moves <Old Title> from its draft position (M20-era plan) to its
spec-correct position (M47). Updates README heading, module number
references, and cross-links.
```

One final commit after all 16 are done:
```
refactor(curriculum): complete phase-1 reorganization of M20-M35 to spec positions
```

---

## Output State

After this phase completes:
- `tests/` contains modules M00–M19 (unchanged) + M22–M24, M26, M28–M29, M31–M32, M37, M39, M43, M47, M51, M63, M72, M92 (renamed)
- Gaps at M20, M21, M25, M27, M30, M33–M36, M38, M40–M42, M44–M46, M48–M50, M52–M62, M64–M71, M73–M91 — all to be filled in subsequent phases
- Every module that exists is at its spec-correct number with aligned content
