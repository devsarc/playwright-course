# Lumio Context: M46

## What's in Lumio at this point

Lumio's task creation flow is the primary target for this module — it's a multi-step interaction (open dialog → fill form → submit → verify card) that benefits from step grouping. The HTML report for a four-step test reads like a specification: each phase is a named heading, and failures are localized to the step that failed.

## The task creation flow

Steps map directly to the natural phases of the flow:

1. **Navigate to dashboard** — `page.goto('/dashboard')`
2. **Open task creation dialog** — click "Add task", assert dialog visible
3. **Fill and submit task form** — fill title, click submit, assert dialog closed
4. **Verify task on board** — assert task card visible with the entered title

This four-step structure is the template for any Lumio CRUD test. Steps make the structure explicit in the report.

## Viewing steps and attachments

```bash
npx playwright test tests/module-46-test-step-attachments --reporter=html
npx playwright show-report
```

In the HTML report:
- Steps appear as indented rows under the test name
- Attached images display inline when you click the attachment name
- Annotations appear as colored badges next to the test status
