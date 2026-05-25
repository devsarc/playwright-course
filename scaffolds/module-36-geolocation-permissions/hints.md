# M36 Hints

## TODO 1 — Grant geolocation permission

```typescript
await context.grantPermissions(['geolocation']);
```

The permission string `'geolocation'` matches the Permissions API name. You can also scope it to a specific origin: `context.grantPermissions(['geolocation'], { origin: 'http://localhost:3000' })`.

## TODO 2 — Set fake geolocation

```typescript
await context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 });
```

`setGeolocation` requires `grantPermissions(['geolocation'])` to have been called first — otherwise the browser still returns a permission denied error even with coordinates set.

## TODO 3 — Assert timezone value

```typescript
await expect(timezoneInput).toHaveValue('Europe/Paris');
```

Lumio derives the IANA timezone string (`Europe/Paris`) from the coordinates via a server-side reverse geocoding call or a client-side timezone library like `geotz`.

## TODO 4 — Clear permissions

```typescript
await context.clearPermissions();
```

`clearPermissions()` takes no arguments — it resets ALL permissions for the context to their default (denied in headless mode). Call it before the action that triggers the permission check.

## TODO 5 — Assert error message

```typescript
await expect(page.getByRole('alert')).toContainText('Location access denied');
```

Lumio shows the error in a `role="alert"` element that appears after the failed geolocation call. `toContainText` is more resilient than `toHaveText` — it passes as long as the string appears anywhere in the element, even if surrounding text changes.

## TODO 6 — Create context with timezone

```typescript
const context = await browser.newContext({ timezoneId: 'America/New_York' });
```

`timezoneId` takes an IANA timezone string. Unlike `setGeolocation`, timezone is set at context creation time and cannot be changed mid-context. If you need a different timezone, create a new context.

## TODO 7 — Assert date is truthy

```typescript
expect(displayedDate?.trim()).toBeTruthy();
```

For a more precise assertion, compare to today's date formatted in New York timezone:
```typescript
const expected = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric'
}).format(new Date());
expect(displayedDate?.trim()).toBe(expected);
```

## TODO 8 — Grant camera permission

```typescript
await context.grantPermissions(['camera']);
```

For camera + microphone together (e.g., video call features): `context.grantPermissions(['camera', 'microphone'])`.

## TODO 9 — Assert button is visible

```typescript
await expect(takePhotoButton).toBeVisible();
```

The `Take photo` button is conditionally rendered only when the browser reports that camera access is available. Without the permission grant, the button would not appear in the DOM.
