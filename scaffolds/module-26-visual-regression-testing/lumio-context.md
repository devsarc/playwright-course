# Lumio Context: M26

## Visual areas under test

- **Landing page** (`/`) — hero, features grid, pricing section
- **Kanban board** (`/projects/demo/board`) — column layout, card appearance

## testid attributes for scoped screenshots

| Element | data-testid |
|---------|-------------|
| Hero section | `hero-section` |
| Feature cards | `feature-card` |
| Kanban column | `kanban-column-{status}` |
| Kanban card | `kanban-card` |

## Dark mode

Lumio uses Tailwind's `dark` class strategy. Adding `dark` to `<html>` switches
the entire page to dark mode without any localStorage or cookie setup.

## Screenshot storage

Playwright stores baselines at:
`tests/module-22-visual-regression/__screenshots__/`

Commit these PNG files to git. On CI, the same baselines are used for comparison.
