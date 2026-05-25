import { test as setup, expect } from '@playwright/test';
import path from 'path';

// M16: Authentication Patterns
//
// The key insight: logging in once and saving storageState is much faster than
// logging in in every test. A saved auth state reuses the session cookie across
// all tests that need it.
//
// This file has two parts:
// 1. setup.ts — logs in and saves storageState (runs once in globalSetup or as a setup project)
// 2. exercise.spec.ts — uses the saved state

const AUTH_FILE = path.join(__dirname, '.auth-state-member.json');

// AUTH SETUP: Run this first to save login state
// (In a real project this would be in a setup project in playwright.config.ts)
setup('save member auth state', async ({ page }) => {
  await page.goto('/login');

  // TODO 1: Fill in the test member credentials and submit the form.
  await page.getByLabel('Email address').fill(/* TODO 1: process.env.TEST_USER_EMAIL! */);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // TODO 2: Wait for navigation to /dashboard.
  await page./* TODO 2: waitForURL(/dashboard/, { timeout: 10_000 }) */ evaluate(() => void 0);

  // TODO 3: Save the browser's auth state (cookies + localStorage) to a file.
  // Use page.context().storageState({ path: AUTH_FILE }).
  await page.context()/* TODO 3: storageState({ path: AUTH_FILE }) */;
});
