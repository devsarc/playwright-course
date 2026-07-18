import { part3Test as test, part3Expect as expect } from './exercise.spec';

// This file tests that the fixture works correctly.
//
// Merge note: this file (formerly module-08-fixtures/exercise-use.spec.ts) is
// otherwise unchanged. Only this import line was adjusted — the merged
// exercise.spec.ts exports this Part's extended test/expect as
// `part3Test`/`part3Expect` (see that file for why) and they're aliased back
// to `test`/`expect` here so the rest of this file didn't need to change.

test('lumioHomePage: page is already at /', async ({ lumioHomePage }) => {
  // The fixture navigated to '/' before this test body ran.
  // TODO 4: Assert the current URL is the landing page.
  await expect(lumioHomePage)/* TODO 4: toHaveURL('http://localhost:3000/') */;
  await expect(lumioHomePage.getByRole('heading', { level: 1 })).toBeVisible();
});
