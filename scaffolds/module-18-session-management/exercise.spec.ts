import { test, expect } from '../fixtures/fixtures';

// M18: Cookie, Storage & Session Management

test.describe('Storage and session manipulation', () => {
  test('localStorage: persist and read theme preference', async ({ page }) => {
    await page.goto('/');

    // TODO 1: Use page.evaluate() to set a theme in localStorage.
    await page.evaluate(/* TODO 1: () => localStorage.setItem('theme', 'dark') */);

    // TODO 2: Reload the page.
    await page./* TODO 2: reload() */ evaluate(() => void 0);

    // TODO 3: Read the theme back from localStorage and assert it's 'dark'.
    const theme = await page.evaluate(/* TODO 3: () => localStorage.getItem('theme') */);
    expect(theme)/* TODO 3b: toBe('dark') */;
  });

  test('cookies: add and read a cookie', async ({ context, page }) => {
    // TODO 4: Add a cookie named 'test-session' with value 'abc123' using context.addCookies().
    await context.addCookies([/* TODO 4: {
      name: 'test-session',
      value: 'abc123',
      domain: 'localhost',
      path: '/',
    } */]);

    await page.goto('/');

    // TODO 5: Read the cookies from the context and assert 'test-session' exists.
    const cookies = await context./* TODO 5: cookies() */;
    const testCookie = cookies.find((c) => c.name === 'test-session');
    expect(testCookie?.value).toBe('abc123');
  });

  test('storageState: snapshot and restore session', async ({ context, page }) => {
    await page.goto('/');

    // TODO 6: Take a snapshot of the current storage state.
    // storageState() returns { cookies: [...], origins: [...] }
    const snapshot = await context./* TODO 6: storageState() */;

    expect(snapshot).toHaveProperty('cookies');
    expect(snapshot).toHaveProperty('origins');
  });

  test('clearCookies: sign out by clearing cookies', async ({ context, page }) => {
    // Set some cookies first
    await context.addCookies([{ name: 'some-cookie', value: 'val', domain: 'localhost', path: '/' }]);

    // TODO 7: Clear all cookies from the context.
    await context./* TODO 7: clearCookies() */;

    const cookies = await context.cookies();
    // TODO 8: Assert there are no cookies after clearing.
    expect(cookies)/* TODO 8: toHaveLength(0) */;
  });
});
