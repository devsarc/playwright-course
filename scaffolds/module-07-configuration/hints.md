# M07 Hints

## TODO 1 — Add firefox project

```typescript
{
  name: 'firefox',
  use: { ...devices['Desktop Firefox'] },
},
```

## TODO 2 — Add webkit project

```typescript
{
  name: 'webkit',
  use: { ...devices['Desktop Safari'] },
},
```

## TODO 3 — Add mobile-chrome project

```typescript
{
  name: 'mobile-chrome',
  use: { ...devices['Pixel 5'] },
},
```

`devices['Pixel 5']` sets viewport to 393×851, userAgent to a mobile Chrome UA,
and `isMobile: true`. This triggers the responsive CSS breakpoints in Lumio's navbar.

## TODO 4 — `toBeVisible()`

```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 5 — `test.info().annotations.push`

```typescript
test.info().annotations.push({ type: 'browser', description: browserName });
```

Annotations appear in the HTML report. Useful for adding runtime metadata to test results.

## TODO 6 — `test.skip` by viewport width

```typescript
test.skip((viewport?.width ?? 1280) > 768, 'Only meaningful on mobile viewports');
```

The Pixel 5 device has a viewport width of 393px — below 768px, so this test runs.
On Desktop Chrome (1280px), the condition is true and the test is skipped.
