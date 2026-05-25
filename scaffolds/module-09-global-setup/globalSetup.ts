import { type FullConfig } from '@playwright/test';
import { prisma } from '../../lumio/lib/db';

// M09: Global Setup
// This runs ONCE before all tests in the suite.
// At M09, we verify the test database has the expected seed data.
// Auth-aware globalSetup (login + storageState) is covered in M16.

async function globalSetup(_config: FullConfig) {
  // TODO 1: Verify the test user exists in the database.
  // Use prisma.user.findUnique to check for TEST_USER_EMAIL.
  // If it doesn't exist, throw an error with a helpful message telling
  // the developer to run `npm run db:seed --prefix lumio`.
  const testUser = await prisma.user.findUnique({
    where: { email: process.env.TEST_USER_EMAIL! },
  });

  if (!testUser) {
    throw new Error(
      `Test user ${process.env.TEST_USER_EMAIL} not found. ` +
      'Run: npm run db:seed --prefix lumio'
    );
  }

  // TODO 2: Verify the test workspace exists.
  const workspace = await prisma.workspace.findUnique({
    where: { slug: 'test-workspace' },
  });

  if (!workspace) {
    throw new Error('Test workspace not found. Run: npm run db:seed --prefix lumio');
  }

  console.log(`✓ Global setup: test user and workspace verified`);

  // TODO 3: Write the test workspace ID to a JSON file so tests can read it.
  // Use fs.writeFileSync to write { workspaceId: workspace.id } to
  // tests/module-09-global-setup/.test-state.json.
  const { writeFileSync } = await import('fs');
  const { join } = await import('path');
  writeFileSync(
    join(__dirname, '.test-state.json'),
    JSON.stringify({ workspaceId: workspace.id }),
  );
}

export default globalSetup;
