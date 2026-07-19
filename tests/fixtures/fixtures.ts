import { test as base, expect, devices } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';

// Re-export base test and expect.
// Each module imports from here rather than from @playwright/test directly,
// so adding shared fixtures later only requires changing this one file.
export const test = base;
export { expect, devices };
export type { BrowserContext };
