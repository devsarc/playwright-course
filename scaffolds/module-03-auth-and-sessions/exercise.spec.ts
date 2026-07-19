// Lesson 03: Authentication & Session Management
// Combines former modules: M16 (Authentication Patterns), M17 (OAuth & SSO
// Flows), M18 (Cookie, Storage & Session Management), M19 (Security Workflow
// Testing).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M17 module becomes TODO
// 2.N here, matching Part 2's prefix).
//
// Merge note: Part 1 (M16) originally had no test.describe wrapper and
// imported `test as setup`/`expect` directly from '@playwright/test' instead
// of the shared '../fixtures/fixtures' used by Parts 2-4. It's wrapped in its
// own describe below, with `setup`/`expect` shadowed locally to `pw.test`/
// `pw.expect` so they don't collide with the top-level `test`/`expect`
// imported from '../fixtures/fixtures'. Part 1's companion file
// `exercise-part1-use.spec.ts` (formerly module-16-auth-patterns/
// exercise-use.spec.ts) imports `test`/`expect` directly from
// '@playwright/test' and does not import anything from this file, so it
// needed no import changes — per the same precedent Task 3 set for its own
// extra file, it keeps its original TODO numbers (4, 5, 6) unrenumbered (see
// hints.md).

import { test, expect } from '../fixtures/fixtures';
import path from 'path';
import * as pw from '@playwright/test';

const AUTH_FILE = path.join(__dirname, '.auth-state-member.json');

test.describe('Part 1 — Authentication Patterns (formerly M16)', () => {
  // M16: Authentication Patterns
  //
  // The key insight: logging in once and saving storageState is much faster than
  // logging in in every test. A saved auth state reuses the session cookie across
  // all tests that need it.
  //
  // This file has two parts:
  // 1. setup.ts — logs in and saves storageState (runs once in globalSetup or as a setup project)
  // 2. exercise.spec.ts — uses the saved state

  // Merge note: this Part originally imported `test as setup`/`expect` directly
  // from '@playwright/test'. Shadowed locally here so it doesn't collide with
  // the `test`/`expect` imported from '../fixtures/fixtures' used by the other
  // Parts in this file.
  const setup = pw.test;
  const expect = pw.expect;

  // AUTH SETUP: Run this first to save login state
  // (In a real project this would be in a setup project in playwright.config.ts)
  setup('save member auth state', async ({ page }) => {
    await page.goto('/login');

    // TODO 1.1: Fill in the test member credentials and submit the form.
    await page.getByLabel('Email address').fill(/* TODO 1.1: process.env.TEST_USER_EMAIL! */);
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // TODO 1.2: Wait for navigation to /dashboard.
    await page./* TODO 1.2: waitForURL(/dashboard/, { timeout: 10_000 }) */ evaluate(() => void 0);

    // TODO 1.3: Save the browser's auth state (cookies + localStorage) to a file.
    // Use page.context().storageState({ path: AUTH_FILE }).
    await page.context()/* TODO 1.3: storageState({ path: AUTH_FILE }) */;
  });
});

test.describe('Part 2 — OAuth & SSO Flows (formerly M17)', () => {
  // M17: OAuth & SSO Flows
  //
  // OAuth involves a redirect to an external provider (GitHub) and back.
  // Two strategies:
  // 1. Automate the real redirect (slow, brittle if GitHub changes their UI)
  // 2. Mock the OAuth provider (fast, reliable, CI-friendly)
  // Strategy 2 is strongly preferred for test suites.

  test('OAuth redirect: GitHub button navigates to GitHub authorize URL', async ({ page }) => {
    await page.goto('/login');

    // TODO 2.1: Listen for the popup window that opens when GitHub OAuth is triggered.
    // Use context.waitForEvent('page') BEFORE clicking the GitHub button.
    const popupPromise = page.context()/* TODO 2.1: waitForEvent('page') */;

    // TODO 2.2: Click the "GitHub" OAuth button.
    await page.getByRole('button', { name: /GitHub/i })/* TODO 2.2: click() */;

    // TODO 2.3: Await the popup promise to get the popup page.
    const popup = await /* TODO 2.3: popupPromise */ Promise.resolve(page as import('@playwright/test').Page);

    // TODO 2.4: Assert the popup URL contains 'github.com/login/oauth/authorize'.
    // waitForURL on the popup page to handle redirects.
    await popup./* TODO 2.4: waitForURL(/github\.com\/login\/oauth/, { timeout: 10_000 }) */ evaluate(() => void 0);
    await expect(popup).toHaveURL(/github\.com/);

    await popup.close();
  });

  test('mock OAuth: intercept the GitHub callback and simulate a successful login', async ({ page }) => {
    // Mocking OAuth means intercepting the callback URL that GitHub would redirect to,
    // and providing a mock response that NextAuth processes as a successful login.

    // TODO 2.5: Use page.route() to intercept the NextAuth GitHub callback URL.
    // Pattern: /api/auth/callback/github
    // Response: redirect to /dashboard (simulating a successful GitHub auth)
    await page.route('/api/auth/callback/github*', async (route) => {
      // TODO 2.5: Redirect to /dashboard to simulate successful OAuth
      await route./* TODO 2.5: fulfill({ status: 302, headers: { Location: '/dashboard' } }) */ continue();
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /GitHub/i }).click();

    // With the mock in place, after clicking GitHub, the OAuth popup would
    // hit the mocked callback and redirect to /dashboard.
    // (This simplified test demonstrates the mocking concept.)
  });
});

test.describe('Part 3 — Cookie, Storage & Session Management (formerly M18)', () => {
  // M18: Cookie, Storage & Session Management

  test('localStorage: persist and read theme preference', async ({ page }) => {
    await page.goto('/');

    // TODO 3.1: Use page.evaluate() to set a theme in localStorage.
    await page.evaluate(/* TODO 3.1: () => localStorage.setItem('theme', 'dark') */);

    // TODO 3.2: Reload the page.
    await page./* TODO 3.2: reload() */ evaluate(() => void 0);

    // TODO 3.3: Read the theme back from localStorage and assert it's 'dark'.
    const theme = await page.evaluate(/* TODO 3.3: () => localStorage.getItem('theme') */);
    expect(theme)/* TODO 3.3b: toBe('dark') */;
  });

  test('cookies: add and read a cookie', async ({ context, page }) => {
    // TODO 3.4: Add a cookie named 'test-session' with value 'abc123' using context.addCookies().
    await context.addCookies([/* TODO 3.4: {
      name: 'test-session',
      value: 'abc123',
      domain: 'localhost',
      path: '/',
    } */]);

    await page.goto('/');

    // TODO 3.5: Read the cookies from the context and assert 'test-session' exists.
    const cookies = await context./* TODO 3.5: cookies() */ pages();
    const testCookie = cookies.find((c) => c.name === 'test-session');
    expect(testCookie?.value).toBe('abc123');
  });

  test('storageState: snapshot and restore session', async ({ context, page }) => {
    await page.goto('/');

    // TODO 3.6: Take a snapshot of the current storage state.
    // storageState() returns { cookies: [...], origins: [...] }
    const snapshot = await context./* TODO 3.6: storageState() */ pages();

    expect(snapshot).toHaveProperty('cookies');
    expect(snapshot).toHaveProperty('origins');
  });

  test('clearCookies: sign out by clearing cookies', async ({ context, page }) => {
    // Set some cookies first
    await context.addCookies([{ name: 'some-cookie', value: 'val', domain: 'localhost', path: '/' }]);

    // TODO 3.7: Clear all cookies from the context.
    await context./* TODO 3.7: clearCookies() */ cookies();

    const cookies = await context.cookies();
    // TODO 3.8: Assert there are no cookies after clearing.
    expect(cookies)/* TODO 3.8: toHaveLength(0) */;
  });
});

// Reuse the member auth state from Part 1 of this lesson (formerly M16) (if it exists)
// Merge note: originally this path was
// '../module-16-auth-patterns/.auth-state-member.json' (a sibling scaffold
// directory). Now that Part 1 (formerly M16) lives in this same
// file/directory, the auth state file it writes lands at this directory's own
// .auth-state-member.json, so the path is corrected to point here directly.
const MEMBER_AUTH = path.join(__dirname, '.auth-state-member.json');

test.describe('Part 4 — Security Workflow Testing (formerly M19)', () => {
  // M19: Security Workflow Testing
  //
  // Security tests verify that the application enforces its access rules:
  // - Unauthenticated users can't access protected routes
  // - Members can't access admin routes
  // - CAPTCHA is disabled in test environments
  // - Session expiry is handled correctly

  test.describe('Unauthenticated access', () => {
    test('redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
      // TODO 4.1: Navigate to /dashboard WITHOUT authentication.
      // Assert you are redirected to /login.
      await page.goto('/dashboard');
      await expect(page)/* TODO 4.1: toHaveURL(/\/login/) */;
    });

    test('redirect to login when accessing admin panel unauthenticated', async ({ page }) => {
      // TODO 4.2: Navigate to /admin. Assert redirect to /login.
      await page.goto('/admin');
      await expect(page)/* TODO 4.2: toHaveURL(/\/login/) */;
    });

    test('API returns 401 for protected endpoints', async ({ request }) => {
      // TODO 4.3: Make an unauthenticated GET to /api/workspaces. Assert 401.
      const res = await request.get('/api/workspaces');
      expect(res.status())/* TODO 4.3: toBe(401) */;
    });
  });

  test.describe('Member access controls', () => {
    // Set up with a regular member's auth state
    test.use({ storageState: MEMBER_AUTH });

    test('member cannot access admin panel — gets redirected', async ({ page }) => {
      // TODO 4.4: Navigate to /admin as a member. Assert redirect to /dashboard.
      // (The app redirects non-admin users to /dashboard, not to /login.)
      await page.goto('/admin');
      await expect(page)/* TODO 4.4: toHaveURL(/\/dashboard/) */;
    });

    test('member API calls return 403 on admin endpoints', async ({ request, page }) => {
      // Navigate first so the session cookie is active
      await page.goto('/dashboard');

      // TODO 4.5: Make a GET to /api/admin/users as a member. Assert 403.
      const res = await request.get('/api/admin/users');
      expect(res.status())/* TODO 4.5: toBe(403) */;
    });
  });
});
