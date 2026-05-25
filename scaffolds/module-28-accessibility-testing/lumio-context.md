# Lumio Context: M28

## Pages under test

- `/` — landing page (hero, features, pricing)
- `/projects/demo/board` — kanban board (interactive cards, drag handles)

## Known accessibility targets in Lumio

| Element | Expected role | data-testid |
|---------|---------------|-------------|
| Primary CTA | `link` | — |
| Pricing section | `region` | `pricing-section` |
| Kanban card | `listitem` | `kanban-card` |
| Delete button | `button` | `card-delete-btn` |

## axe-core installation

```bash
cd lumio && npm install --save-dev @axe-core/playwright
```

axe-core is already listed in devDependencies after Part 1 setup. If the import
fails, run the install command above.
