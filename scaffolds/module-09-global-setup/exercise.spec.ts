import { test, expect } from '../fixtures/fixtures';
import { readFileSync } from 'fs';
import { join } from 'path';

// M09: Global Setup & Teardown
//
// Run with the M09-specific config that points globalSetup to this module's setup file:
// npx playwright test tests/module-09-global-setup --config=tests/module-09-global-setup/playwright-m09.config.ts

test('global setup wrote test state file', () => {
  // TODO 4: Read the .test-state.json file written by globalSetup.
  // Parse it and assert it has a 'workspaceId' property that is a non-empty string.
  const stateFile = join(__dirname, '.test-state.json');
  const state = JSON.parse(readFileSync(/* TODO 4: stateFile */ stateFile, 'utf-8'));

  expect(state.workspaceId).toBeTruthy();
  expect(typeof state.workspaceId).toBe('string');
});

test('test database has seeded project', async ({ request }) => {
  // TODO 5: Use the request fixture to GET /api/projects?workspaceId={id}.
  // First, read the workspaceId from .test-state.json (same as TODO 4).
  // Then make the API call and assert the response contains at least one project.
  const state = JSON.parse(readFileSync(join(__dirname, '.test-state.json'), 'utf-8'));

  const response = await request.get(
    /* TODO 5: `/api/projects?workspaceId=${state.workspaceId}` */
  );

  // The API returns 401 because this test doesn't have auth — that's expected at M09.
  // (Auth-aware testing is M14 and M16.)
  expect(response.status()).toBe(401);
});
