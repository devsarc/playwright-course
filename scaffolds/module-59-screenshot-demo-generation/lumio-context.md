# Lumio Context: M59

## What's in Lumio at this point

Lumio's full feature set — Kanban board, task creation, drag-and-drop, notifications, settings — is the target for a product demo walkthrough. A well-scripted demo flow:

1. Open dashboard — show the empty board
2. Create a task — show the dialog and form fill
3. Submit — show the task card appear
4. Drag to In Progress — show the board update
5. Open task detail — show the full task view

Each step gets a screenshot; the entire sequence gets a video recording.

## Demo output organization

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

## Automation for marketing

This pattern — Playwright generating screenshots for documentation — is production-ready. Large SaaS products use it to:
- Keep help center screenshots in sync with UI changes (regenerate on deploy)
- Generate product comparison images for marketing pages
- Record release notes videos showing new features
