# Lumio Context: M53

## What's in Lumio at this point

Lumio itself is a React application — there are no Vue components in the production Lumio codebase. This module uses a standalone `vue-demo/TaskForm.vue` component bundled on this branch as a learning target.

## Why Vue in a React-primary course

Professional Playwright users work in codebases that are rarely framework-pure. You'll encounter:
- Third-party analytics dashboards built in Vue, embedded as iframes or web components
- Design system libraries published in Vue before your team migrated to React
- Acquired codebases that were Vue-based
- Micro-frontend setups where different teams own different framework choices

The Playwright CT API is largely framework-agnostic. Learning the Vue variant takes 20 minutes if you already know the React variant — the locator and assertion API is identical, only the mounting syntax differs.

## vue-demo directory

The `vue-demo/` directory at the repo root contains `TaskForm.vue` — a simple task creation form. It has:
- A text input for the task title (bound with `v-model`)
- A default slot for footer content
- A named `actions` slot for action buttons
- A `submit` emit that fires with the title when the form is submitted

This is a self-contained demo. The component is not imported by any Lumio code — it exists only for this module's exercises.
