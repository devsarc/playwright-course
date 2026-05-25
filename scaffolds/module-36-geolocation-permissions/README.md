# M36: Geolocation, Permissions & Device APIs

## Learning Objectives

- Grant, deny, and clear browser permissions in test contexts using `context.grantPermissions()`
- Set a fake geolocation to test location-aware features without physical movement
- Override the browser timezone and locale to test localization-sensitive behavior
- Assert the correct UI feedback when a permission is denied
- Decide when to grant permissions globally in context vs. per-test

## Concept

Browsers gate access to powerful device APIs behind permission prompts: geolocation, camera, microphone, clipboard, notifications. In production these prompts appear when a user visits your site. In tests you need to decide the outcome of those prompts upfront — you cannot click "Allow" or "Deny" on a native browser dialog from Playwright in the normal way. Instead, Playwright gives you `context.grantPermissions()` and its counterpart `context.clearPermissions()` to set the state programmatically before any user action triggers the prompt.

**`context.grantPermissions()`** takes an array of permission strings and an optional `{ origin }` option to scope the grant to a specific origin. The permission strings match the names defined in the Permissions API spec: `'geolocation'`, `'notifications'`, `'camera'`, `'microphone'`, `'clipboard-read'`, `'clipboard-write'`. Granting before the page loads means the browser never shows a prompt — your code runs as if the user already said "Allow". This is the right approach for the happy path.

**Testing the denied path** is equally important. Denying a geolocation request should trigger fallback UI — a message, a default location, or an error state. `context.clearPermissions()` resets all grants to the browser's default, which is "deny" in headless contexts. After clearing, when your app calls `navigator.geolocation.getCurrentPosition()`, the browser calls the error callback rather than the success callback. Your test can then assert the correct error UI appears.

**Fake geolocation.** `context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 })` pins the browser's location to Paris. Any call to `navigator.geolocation.getCurrentPosition()` returns these coordinates. This is how you test location-aware features (nearest office finder, timezone detection, weather widgets) without physically traveling to Paris. The coordinates update immediately — you can call `setGeolocation()` multiple times in a test to simulate movement.

**Timezone override.** `context.setTimezone('America/New_York')` tells the browser that the user is in New York, regardless of the machine's real timezone. This affects `new Date().toLocaleTimeString()`, `Intl.DateTimeFormat`, and any JavaScript that reads the local timezone. Use it to test features like "show tasks due in your timezone" without setting your machine's timezone manually. Unlike geolocation, timezone is set at context creation time in Playwright — if you need a different timezone mid-test, create a new context.

**Locale override.** `context.setLocale('fr-FR')` sets the locale for `Intl.*` APIs, number formatting, and `Accept-Language` headers sent to the server. Combined with timezone, it lets you simulate a French user in Paris without changing your system settings.

**When to set permissions globally.** If most of your tests in a file need geolocation, set it in `test.beforeAll()` at the context level using worker-scoped fixtures, or configure it in your project's `use` block in `playwright.config.ts`. Setting permissions inside individual tests is fine for one-off scenarios. The tradeoff: global grants are faster but can hide tests that should be testing the deny path.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-36-geolocation-permissions --headed
```

## Key Takeaways

1. `context.grantPermissions(['geolocation'])` must be called before the code that triggers the permission request — not after.
2. `context.clearPermissions()` resets to deny; use it to test what your app does when the user says "Block".
3. `context.setGeolocation({ latitude, longitude })` fakes GPS coordinates — combine it with `grantPermissions(['geolocation'])` or the browser will still deny access.
4. Timezone and locale affect `Intl.*` APIs — `context.setTimezone()` and `context.setLocale()` let you test date/time formatting without changing your machine.
5. Setting permissions in a project's `use` block applies them to every test in that project without boilerplate.

## Going Deeper

- [Playwright docs: Geolocation](https://playwright.dev/docs/geolocation)
- [Playwright docs: Permissions](https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions)
- [Playwright docs: Emulation (timezone, locale)](https://playwright.dev/docs/emulation#locale--timezone)
