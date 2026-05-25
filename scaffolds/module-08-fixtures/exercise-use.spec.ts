import { test, expect } from './exercise.spec';

// This file tests that the fixture works correctly.

test('lumioHomePage: page is already at /', async ({ lumioHomePage }) => {
  // The fixture navigated to '/' before this test body ran.
  // TODO 4: Assert the current URL is the landing page.
  await expect(lumioHomePage)/* TODO 4: toHaveURL('http://localhost:3000/') */;
  await expect(lumioHomePage.getByRole('heading', { level: 1 })).toBeVisible();
});
