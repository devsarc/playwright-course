# Lumio Context: M71

## What's in Lumio at this point

From M71 onward, the repo includes a Chrome MV3 extension at `lumio/extension/`. The extension is a companion tool that lets Lumio users add tasks without switching tabs.

## Extension structure

```
lumio/extension/
├── manifest.json          MV3 manifest (name, version, permissions, host_permissions)
├── popup.html             Quick-add task form (title, project select, priority)
├── popup.ts               Popup logic — submits to Lumio REST API on form submit
├── content.ts             Content script — highlights task reference patterns (TASK-123)
├── background.ts          Service worker — caches recent tasks in chrome.storage.local
└── icons/                 Extension icons (16, 48, 128px)
```

## Permissions

```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://lumio.io/*", "http://localhost:3000/*"]
}
```

`storage` allows `chrome.storage.local` access. `host_permissions` includes `localhost:3000` so the content script runs in test environments against the local dev server.

## Extension popup (popup.html)

The popup renders a single-screen form:
- `<h1>` with accessible name "Quick Add Task"
- `<label>Task title</label>` wrapping a text input
- A project dropdown (select from workspaces the user has access to)
- A priority radio group (Low / Medium / High)
- A submit button with accessible name "Add Task"

On successful submission, the popup shows a `<p>Task added!</p>` confirmation for 2 seconds, then resets the form.

## Content script (content.ts)

Runs on all pages matching `http://localhost:3000/*` and `https://lumio.io/*`. Scans the page text for patterns matching `TASK-\d+` and wraps each match in a `<span data-testid="lumio-task-highlight">` with a tooltip linking to the task detail page.

## Background service worker (background.ts)

Listens for messages from the popup. When a task is created, it:
1. Appends the task to `chrome.storage.local` under the key `recentTasks` (max 10 items)
2. Updates the extension badge with the count of tasks created today

## Why extension testing with Playwright

Manual extension testing is tedious: install → open popup → submit → switch tabs → verify. Playwright's `launchPersistentContext` automates the full flow in CI, catching regressions in the popup form, the API call, and the cross-context data flow in a single test run.
