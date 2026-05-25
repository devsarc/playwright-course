# Lumio Context: M43

## What to trace in Lumio

High-value traces for debugging:
- Board load with card fetch (network requests visible in trace)
- Card creation with optimistic update
- Auth redirect flow

## Trace viewer features

When you open a `.zip` trace in the viewer, you can see:
- Timeline of actions (click, fill, goto)
- Network requests with headers and response bodies
- Console logs from each step
- DOM snapshots before and after each action
- Screenshot thumbnails for visual diffs

## test-results directory

Playwright writes all artifacts (traces, screenshots, videos) to
`test-results/` by default. This directory is gitignored — do not commit
test artifacts.

## Debugging modes

| Mode | Command | What it does |
|------|---------|--------------|
| Headed | `--headed` | Opens a real browser window |
| Inspector | `--debug` | Adds page.pause() breakpoints |
| UI mode | `--ui` | Interactive test runner with trace viewer |
| Slow-mo | `--slowmo=500` | 500ms delay between actions |
