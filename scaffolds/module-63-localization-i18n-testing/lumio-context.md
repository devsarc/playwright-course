# Lumio Context: M63

## i18n setup in Lumio

Library: `next-intl`
Strategy: URL prefix routing

| Locale | URL prefix | Language |
|--------|-----------|----------|
| en | / (default) | English |
| fr | /fr | French |
| es | /es | Spanish |

## Translation files

```
lumio/messages/
  en.json   -> English strings
  fr.json   -> French strings
  es.json   -> Spanish strings
```

## Key translated strings (for assertions)

| Key | en | fr | es |
|-----|----|----|-----|
| hero.heading | Organize your work | Organisez votre travail | Organiza tu trabajo |
| nav.projects | Projects | Projets | Proyectos |

## Language switcher testids

| Element | data-testid |
|---------|-------------|
| Switcher trigger | `language-switcher` |
| French option | `lang-option-fr` |
| Spanish option | `lang-option-es` |
| English option | `lang-option-en` |

## Where to find this in the code

```
lumio/i18n.ts                -> next-intl configuration
lumio/middleware.ts          -> locale routing middleware
lumio/messages/              -> translation files
lumio/components/LanguageSwitcher.tsx
```
