# Progressive CI System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a single-branch progressive CI system that runs tests only for completed + current modules, auto-unlocks the next module on pass, and publishes per-commit reports to GitHub Pages.

**Architecture:** A GitHub Actions workflow (`progress.yml`) reads `scripts/progress.json` to build a dynamic `PW_TEST_MATCH` env var, runs Playwright natively, then a finalize job (`scripts/ci-finalize.ts`) parses results, updates state, copies the next exercise scaffold, and publishes to gh-pages. Automated commits include `[skip ci]` to prevent cycles. A concurrency group cancels stale runs on rapid pushes.

**Tech Stack:** TypeScript, tsx, Vitest (unit tests), Playwright (exercise runner), GitHub Actions, GitHub Pages, Node.js crypto (scaffold hashing)

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `scripts/types.ts` | `ProgressState`, `CompletedModule`, `CurrentModule`, `DecisionType` types |
| `scripts/lib/module-utils.ts` | ID mapping, directory paths, testMatch building, awareness cascade |
| `scripts/lib/hash.ts` | Scaffold file hash computation |
| `scripts/lib/results-parser.ts` | Playwright JSON results → per-module pass/fail map |
| `scripts/lib/decision.ts` | Unlock / fail / regression decision logic |
| `scripts/lib/state.ts` | `progress.json` read / write / initialize |
| `scripts/lib/summary.ts` | GitHub Actions step summary Markdown |
| `scripts/lib/pages.ts` | gh-pages `manifest.json` + `index.html` generation |
| `scripts/ci-finalize.ts` | Thin orchestrator wiring all lib functions |
| `scripts/lib/__tests__/module-utils.test.ts` | Unit tests for module-utils |
| `scripts/lib/__tests__/results-parser.test.ts` | Unit tests for results-parser |
| `scripts/lib/__tests__/decision.test.ts` | Unit tests for decision engine |
| `scripts/lib/__tests__/fixtures/results-pass.json` | Mock Playwright JSON (all pass) |
| `scripts/lib/__tests__/fixtures/results-fail.json` | Mock Playwright JSON (current module fails) |
| `.github/workflows/progress.yml` | New CI workflow (test + finalize jobs) |
| `vitest.config.ts` | Vitest configuration |
| `scaffolds/module-XX-*/exercise.spec.ts` | All 93 exercise scaffold sources (copied from tests/) |

### Modified files
| File | Change |
|------|--------|
| `playwright.config.ts` | Read `PW_TEST_MATCH` env var for dynamic testMatch |
| `package.json` | Add `vitest` dev dependency + `test:unit` script |
| `.github/workflows/playwright.yml` | Disable (add `if: false`) — superseded by progress.yml |
| `scripts/progress.json` | Reset to pristine cold-start state |

---

## Part 1 — Foundation

### Task 1: Add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

Expected: `vitest` appears in `package.json` devDependencies.

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/**/__tests__/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 3: Add test:unit script to package.json**

In the `"scripts"` section, add:
```json
"test:unit": "vitest run"
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

```bash
npx vitest run
```

Expected output: `No test files found` or `0 tests`.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for unit testing ci-finalize lib"
```

---

### Task 2: Create TypeScript types

**Files:**
- Create: `scripts/types.ts`

- [ ] **Step 1: Create `scripts/types.ts`**

```typescript
export interface CompletedModule {
  id: string;
  completedAt: string;
  scaffoldHash: string | null;
}

export interface CurrentModule {
  id: string;
  unlockedAt: string;
  scaffoldHash: string | null;
}

export interface ProgressState {
  completedModules: CompletedModule[];
  currentModule: CurrentModule | null;
  lastUpdated: string;
  lastCommitSha: string;
}

export type DecisionType =
  | { type: 'unlock'; completedId: string; nextCurrent: string | null; autoCompleted: string[] }
  | { type: 'fail'; failedModules: string[] }
  | { type: 'regression'; regressionModules: string[]; scaffoldChangedModules: string[] }
  | { type: 'complete' }
  | { type: 'complete-regression-fail'; failedModules: string[] }
  | { type: 'cancelled' };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --skipLibCheck scripts/types.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/types.ts
git commit -m "feat(ci): add ProgressState and DecisionType types"
```

---

### Task 3: Module utilities with tests

**Files:**
- Create: `scripts/lib/module-utils.ts`
- Create: `scripts/lib/__tests__/module-utils.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `scripts/lib/__tests__/module-utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  filePathToModuleId,
  buildTestMatch,
  moduleDirectory,
  scaffoldDirectory,
  getNextModule,
  findNextCurrent,
} from '../module-utils';

describe('filePathToModuleId', () => {
  it('extracts module ID from test file path', () => {
    expect(filePathToModuleId('tests/module-02-locators/exercise.spec.ts')).toBe('M02');
  });
  it('extracts ID with nested path', () => {
    expect(filePathToModuleId('tests/module-47-page-object-model/pages/KanbanPage.ts')).toBe('M47');
  });
  it('returns null for non-module paths', () => {
    expect(filePathToModuleId('tests/fixtures/fixtures.ts')).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(filePathToModuleId('')).toBeNull();
  });
});

describe('moduleDirectory', () => {
  it('builds the correct tests/ directory path', () => {
    expect(moduleDirectory('M00')).toBe('tests/module-00-setup');
  });
  it('works for a mid-range module', () => {
    expect(moduleDirectory('M47')).toBe('tests/module-47-page-object-model');
  });
  it('throws for unknown module ID', () => {
    expect(() => moduleDirectory('M99')).toThrow('Module M99 not found');
  });
});

describe('scaffoldDirectory', () => {
  it('builds the correct scaffolds/ directory path', () => {
    expect(scaffoldDirectory('M00')).toBe('scaffolds/module-00-setup');
  });
});

describe('buildTestMatch', () => {
  it('builds comma-separated globs for exercise modules', () => {
    const result = buildTestMatch(['M00'], 'M02');
    expect(result).toBe('tests/module-00-setup/**,tests/module-02-locators/**');
  });
  it('excludes awareness modules (hasExercise=false)', () => {
    // M01 is an awareness module
    const result = buildTestMatch(['M00', 'M01'], 'M02');
    expect(result).toBe('tests/module-00-setup/**,tests/module-02-locators/**');
  });
  it('returns empty string when nothing is testable', () => {
    expect(buildTestMatch([], null)).toBe('');
  });
  it('handles null currentModule (post-completion regression mode)', () => {
    const result = buildTestMatch(['M00', 'M02'], null);
    expect(result).toBe('tests/module-00-setup/**,tests/module-02-locators/**');
  });
});

describe('getNextModule', () => {
  it('returns the next module config after given ID', () => {
    const next = getNextModule('M00');
    expect(next?.number).toBe('01');
  });
  it('returns null for the last module (M92)', () => {
    expect(getNextModule('M92')).toBeNull();
  });
});

describe('findNextCurrent', () => {
  it('returns next hasExercise module and no auto-completed when next has exercise', () => {
    // After M00 (setup), M01 is awareness, then M02 has exercise
    const result = findNextCurrent('M00');
    expect(result.nextCurrent).toBe('M02');
    expect(result.autoCompleted).toEqual(['M01']);
  });
  it('returns null nextCurrent and all remaining as autoCompleted if none have exercise', () => {
    // After M72 (electron), M73 (android) is awareness, M74 has exercise
    const result = findNextCurrent('M72');
    expect(result.nextCurrent).toBe('M74');
    expect(result.autoCompleted).toEqual(['M73']);
  });
  it('returns null nextCurrent when completing the last module', () => {
    const result = findNextCurrent('M92');
    expect(result.nextCurrent).toBeNull();
    expect(result.autoCompleted).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run scripts/lib/__tests__/module-utils.test.ts
```

Expected: `Cannot find module '../module-utils'`

- [ ] **Step 3: Create `scripts/lib/module-utils.ts`**

```typescript
import { MODULES } from '../modules.config';

function moduleIdToNumber(id: string): string {
  return id.replace(/^M/, '');
}

export function filePathToModuleId(filePath: string): string | null {
  const match = filePath.match(/tests\/module-(\d+)-[^/]+\//);
  return match ? `M${match[1]}` : null;
}

export function getModuleConfig(id: string) {
  const number = moduleIdToNumber(id);
  return MODULES.find(m => m.number === number) ?? null;
}

export function moduleDirectory(id: string): string {
  const config = getModuleConfig(id);
  if (!config) throw new Error(`Module ${id} not found`);
  return `tests/module-${config.number}-${config.slug}`;
}

export function scaffoldDirectory(id: string): string {
  const config = getModuleConfig(id);
  if (!config) throw new Error(`Module ${id} not found`);
  return `scaffolds/module-${config.number}-${config.slug}`;
}

export function buildTestMatch(completedIds: string[], currentId: string | null): string {
  const ids = [...completedIds, ...(currentId ? [currentId] : [])];
  return ids
    .filter(id => getModuleConfig(id)?.hasExercise === true)
    .map(id => `${moduleDirectory(id)}/**`)
    .join(',');
}

export function getNextModule(currentId: string) {
  const number = moduleIdToNumber(currentId);
  const idx = MODULES.findIndex(m => m.number === number);
  return idx >= 0 && idx < MODULES.length - 1 ? MODULES[idx + 1] : null;
}

export function findNextCurrent(completedId: string): {
  nextCurrent: string | null;
  autoCompleted: string[];
} {
  const number = moduleIdToNumber(completedId);
  const idx = MODULES.findIndex(m => m.number === number);
  const autoCompleted: string[] = [];

  let i = idx + 1;
  while (i < MODULES.length) {
    const mod = MODULES[i];
    if (!mod.hasExercise) {
      autoCompleted.push(`M${mod.number}`);
      i++;
    } else {
      return { nextCurrent: `M${mod.number}`, autoCompleted };
    }
  }
  return { nextCurrent: null, autoCompleted };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run scripts/lib/__tests__/module-utils.test.ts
```

Expected: all tests pass (green).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/module-utils.ts scripts/lib/__tests__/module-utils.test.ts
git commit -m "feat(ci): add module-utils with ID mapping, testMatch builder, awareness cascade"
```

---

### Task 4: Hash utility

**Files:**
- Create: `scripts/lib/hash.ts`

- [ ] **Step 1: Create `scripts/lib/hash.ts`**

```typescript
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';

export function computeFileHash(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  const contents = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(contents).digest('hex').slice(0, 12);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --skipLibCheck scripts/lib/hash.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/hash.ts
git commit -m "feat(ci): add scaffold hash utility"
```

---

### Task 5: Playwright results parser with tests

**Files:**
- Create: `scripts/lib/results-parser.ts`
- Create: `scripts/lib/__tests__/results-parser.test.ts`
- Create: `scripts/lib/__tests__/fixtures/results-pass.json`
- Create: `scripts/lib/__tests__/fixtures/results-fail.json`

- [ ] **Step 1: Create mock fixture — all-pass result**

Create `scripts/lib/__tests__/fixtures/results-pass.json`:

```json
{
  "suites": [
    {
      "title": "exercise.spec.ts",
      "file": "tests/module-00-setup/exercise.spec.ts",
      "suites": [
        {
          "title": "M00 — Setup",
          "suites": [],
          "tests": [
            {
              "title": "dev server is running",
              "results": [{ "status": "passed", "duration": 120 }]
            },
            {
              "title": "app title is correct",
              "results": [{ "status": "passed", "duration": 80 }]
            }
          ]
        }
      ],
      "tests": []
    },
    {
      "title": "exercise.spec.ts",
      "file": "tests/module-02-locators/exercise.spec.ts",
      "suites": [
        {
          "title": "M02 — Locators",
          "suites": [],
          "tests": [
            {
              "title": "find by role",
              "results": [{ "status": "passed", "duration": 200 }]
            }
          ]
        }
      ],
      "tests": []
    }
  ],
  "stats": { "total": 3, "passed": 3, "failed": 0, "skipped": 0 }
}
```

- [ ] **Step 2: Create mock fixture — current module fails**

Create `scripts/lib/__tests__/fixtures/results-fail.json`:

```json
{
  "suites": [
    {
      "title": "exercise.spec.ts",
      "file": "tests/module-00-setup/exercise.spec.ts",
      "suites": [
        {
          "title": "M00 — Setup",
          "suites": [],
          "tests": [
            {
              "title": "dev server is running",
              "results": [{ "status": "passed", "duration": 120 }]
            }
          ]
        }
      ],
      "tests": []
    },
    {
      "title": "exercise.spec.ts",
      "file": "tests/module-02-locators/exercise.spec.ts",
      "suites": [
        {
          "title": "M02 — Locators",
          "suites": [],
          "tests": [
            {
              "title": "find by role",
              "results": [{ "status": "failed", "duration": 5000 }]
            },
            {
              "title": "find by text",
              "results": [{ "status": "passed", "duration": 200 }]
            }
          ]
        }
      ],
      "tests": []
    }
  ],
  "stats": { "total": 3, "passed": 2, "failed": 1, "skipped": 0 }
}
```

- [ ] **Step 3: Write failing tests**

Create `scripts/lib/__tests__/results-parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { parseResults } from '../results-parser';

const FIXTURES = join(__dirname, 'fixtures');

describe('parseResults', () => {
  it('returns all-true map when all tests pass', () => {
    const result = parseResults(join(FIXTURES, 'results-pass.json'));
    expect(result.get('M00')).toBe(true);
    expect(result.get('M02')).toBe(true);
    expect(result.size).toBe(2);
  });

  it('marks module false when any test in it fails', () => {
    const result = parseResults(join(FIXTURES, 'results-fail.json'));
    expect(result.get('M00')).toBe(true);
    expect(result.get('M02')).toBe(false);
  });

  it('ignores suites whose file path does not match a module', () => {
    const result = parseResults(join(FIXTURES, 'results-pass.json'));
    expect(result.has('M99')).toBe(false);
  });
});
```

- [ ] **Step 4: Run tests to confirm they fail**

```bash
npx vitest run scripts/lib/__tests__/results-parser.test.ts
```

Expected: `Cannot find module '../results-parser'`

- [ ] **Step 5: Create `scripts/lib/results-parser.ts`**

```typescript
import { readFileSync } from 'fs';
import { filePathToModuleId } from './module-utils';

interface PlaywrightTest {
  title: string;
  results: { status: 'passed' | 'failed' | 'timedOut' | 'skipped' }[];
}

interface PlaywrightSuite {
  title: string;
  file?: string;
  suites?: PlaywrightSuite[];
  tests?: PlaywrightTest[];
}

interface PlaywrightReport {
  suites: PlaywrightSuite[];
  stats: { total: number; passed: number; failed: number };
}

function collectTests(suite: PlaywrightSuite): PlaywrightTest[] {
  const tests: PlaywrightTest[] = [...(suite.tests ?? [])];
  for (const child of suite.suites ?? []) {
    tests.push(...collectTests(child));
  }
  return tests;
}

export function parseResults(jsonPath: string): Map<string, boolean> {
  const report = JSON.parse(readFileSync(jsonPath, 'utf-8')) as PlaywrightReport;
  const moduleResults = new Map<string, boolean>();

  for (const fileSuite of report.suites) {
    const moduleId = filePathToModuleId(fileSuite.file ?? fileSuite.title ?? '');
    if (!moduleId) continue;

    const allTests = collectTests(fileSuite);
    const allPassed = allTests.every(t =>
      t.results.some(r => r.status === 'passed')
    );

    // If a module appears in multiple file suites, one failure marks it failed
    if (moduleResults.get(moduleId) !== false) {
      moduleResults.set(moduleId, allPassed);
    }
  }

  return moduleResults;
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npx vitest run scripts/lib/__tests__/results-parser.test.ts
```

Expected: all tests green.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/results-parser.ts scripts/lib/__tests__/results-parser.test.ts scripts/lib/__tests__/fixtures/
git commit -m "feat(ci): add Playwright results parser with module attribution"
```

---

### Task 6: Decision engine with tests

**Files:**
- Create: `scripts/lib/decision.ts`
- Create: `scripts/lib/__tests__/decision.test.ts`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/__tests__/decision.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { makeDecision } from '../decision';
import type { ProgressState } from '../../types';

const baseProgress: ProgressState = {
  completedModules: [
    { id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' },
  ],
  currentModule: { id: 'M02', unlockedAt: '2026-01-02T00:00:00Z', scaffoldHash: 'def' },
  lastUpdated: '2026-01-02T00:00:00Z',
  lastCommitSha: 'abc123',
};

const noChanges = new Map<string, boolean>([['M00', false], ['M02', false]]);

describe('makeDecision', () => {
  it('returns cancelled when results map is empty (job was cancelled)', () => {
    const d = makeDecision(new Map(), baseProgress, new Map());
    expect(d.type).toBe('cancelled');
  });

  it('returns unlock when all tests pass', () => {
    const results = new Map([['M00', true], ['M02', true]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('unlock');
    if (d.type === 'unlock') {
      expect(d.completedId).toBe('M02');
      expect(d.nextCurrent).toBe('M03'); // M03 is actions, hasExercise=true
      expect(d.autoCompleted).toEqual([]);
    }
  });

  it('auto-completes awareness modules when unlocking past M00', () => {
    // Completing M00: next is M01 (awareness), then M02 (exercise)
    const progress: ProgressState = {
      completedModules: [],
      currentModule: { id: 'M00', unlockedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' },
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', true]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('unlock');
    if (d.type === 'unlock') {
      expect(d.nextCurrent).toBe('M02');
      expect(d.autoCompleted).toEqual(['M01']);
    }
  });

  it('returns fail when current module fails', () => {
    const results = new Map([['M00', true], ['M02', false]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('fail');
    if (d.type === 'fail') {
      expect(d.failedModules).toContain('M02');
      expect(d.failedModules).not.toContain('M00');
    }
  });

  it('returns regression when a completed module fails', () => {
    const results = new Map([['M00', false], ['M02', true]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('regression');
    if (d.type === 'regression') {
      expect(d.regressionModules).toContain('M00');
      expect(d.scaffoldChangedModules).toEqual([]);
    }
  });

  it('flags scaffold-changed modules in regression', () => {
    const results = new Map([['M00', false], ['M02', true]]);
    const changes = new Map([['M00', true], ['M02', false]]);
    const d = makeDecision(results, baseProgress, changes);
    expect(d.type).toBe('regression');
    if (d.type === 'regression') {
      expect(d.scaffoldChangedModules).toContain('M00');
    }
  });

  it('returns complete when currentModule is null and all pass', () => {
    const progress: ProgressState = {
      completedModules: [{ id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' }],
      currentModule: null,
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', true]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('complete');
  });

  it('returns complete-regression-fail when post-completion module fails', () => {
    const progress: ProgressState = {
      completedModules: [{ id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' }],
      currentModule: null,
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', false]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('complete-regression-fail');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run scripts/lib/__tests__/decision.test.ts
```

Expected: `Cannot find module '../decision'`

- [ ] **Step 3: Create `scripts/lib/decision.ts`**

```typescript
import type { ProgressState, DecisionType } from '../types';
import { findNextCurrent } from './module-utils';

export function makeDecision(
  moduleResults: Map<string, boolean>,
  progress: ProgressState,
  scaffoldChanges: Map<string, boolean>
): DecisionType {
  if (moduleResults.size === 0) {
    return { type: 'cancelled' };
  }

  const failed = [...moduleResults.entries()]
    .filter(([, passed]) => !passed)
    .map(([id]) => id);

  if (failed.length === 0) {
    if (progress.currentModule === null) {
      return { type: 'complete' };
    }
    const { nextCurrent, autoCompleted } = findNextCurrent(progress.currentModule.id);
    return {
      type: 'unlock',
      completedId: progress.currentModule.id,
      nextCurrent,
      autoCompleted,
    };
  }

  const completedIds = new Set(progress.completedModules.map(m => m.id));
  const regressionModules = failed.filter(id => completedIds.has(id));
  const scaffoldChangedModules = failed.filter(id => scaffoldChanges.get(id) === true);

  if (regressionModules.length > 0) {
    return { type: 'regression', regressionModules, scaffoldChangedModules };
  }

  if (progress.currentModule === null) {
    return { type: 'complete-regression-fail', failedModules: failed };
  }

  return { type: 'fail', failedModules: failed };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run scripts/lib/__tests__/decision.test.ts
```

Expected: all tests green.

- [ ] **Step 5: Run all unit tests together**

```bash
npx vitest run
```

Expected: all test files pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/decision.ts scripts/lib/__tests__/decision.test.ts
git commit -m "feat(ci): add decision engine for unlock/fail/regression logic"
```

---

### Task 7: State manager

**Files:**
- Create: `scripts/lib/state.ts`

- [ ] **Step 1: Create `scripts/lib/state.ts`**

```typescript
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { ProgressState, CurrentModule, CompletedModule } from '../types';
import { computeFileHash } from './hash';
import { scaffoldDirectory } from './module-utils';

const PROGRESS_PATH = 'scripts/progress.json';

export function readProgress(): ProgressState | null {
  if (!existsSync(PROGRESS_PATH)) return null;
  return JSON.parse(readFileSync(PROGRESS_PATH, 'utf-8')) as ProgressState;
}

export function writeProgress(state: ProgressState): void {
  writeFileSync(PROGRESS_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

export function initProgress(firstModuleId: string): ProgressState {
  const scaffoldPath = `${scaffoldDirectory(firstModuleId)}/exercise.spec.ts`;
  return {
    completedModules: [],
    currentModule: {
      id: firstModuleId,
      unlockedAt: new Date().toISOString(),
      scaffoldHash: computeFileHash(scaffoldPath),
    },
    lastUpdated: new Date().toISOString(),
    lastCommitSha: process.env.GITHUB_SHA ?? 'local',
  };
}

export function markComplete(
  state: ProgressState,
  completedId: string,
  autoCompleted: string[],
  nextCurrent: string | null,
  nextScaffoldHash: string | null
): ProgressState {
  const now = new Date().toISOString();
  const currentEntry = state.currentModule!;

  const newCompleted: CompletedModule[] = [
    ...state.completedModules,
    { id: completedId, completedAt: now, scaffoldHash: currentEntry.scaffoldHash },
    ...autoCompleted.map(id => ({ id, completedAt: now, scaffoldHash: null })),
  ];

  const newCurrent: CurrentModule | null = nextCurrent
    ? { id: nextCurrent, unlockedAt: now, scaffoldHash: nextScaffoldHash }
    : null;

  return {
    completedModules: newCompleted,
    currentModule: newCurrent,
    lastUpdated: now,
    lastCommitSha: process.env.GITHUB_SHA ?? 'local',
  };
}

export function computeActiveScaffoldChanges(state: ProgressState): Map<string, boolean> {
  const changes = new Map<string, boolean>();
  const modules = [
    ...state.completedModules,
    ...(state.currentModule ? [state.currentModule] : []),
  ];
  for (const mod of modules) {
    if (mod.scaffoldHash === null) continue; // awareness module
    const scaffoldPath = `${scaffoldDirectory(mod.id)}/exercise.spec.ts`;
    const currentHash = computeFileHash(scaffoldPath);
    changes.set(mod.id, currentHash !== mod.scaffoldHash);
  }
  return changes;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --skipLibCheck scripts/lib/state.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/state.ts
git commit -m "feat(ci): add progress state reader, writer, and scaffold change detector"
```

---

### Task 8: Update playwright.config.ts for dynamic testMatch

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Read the current playwright.config.ts**

Open `playwright.config.ts` and locate the `testMatch` or `testIgnore` section.

- [ ] **Step 2: Add PW_TEST_MATCH support**

Find the `export default defineConfig({` block and add/replace the `testMatch` line. The env var, when set and non-empty, takes precedence over the default:

```typescript
// Near top of file, after imports:
const pwTestMatch = process.env.PW_TEST_MATCH;

// Inside defineConfig:
...(pwTestMatch && pwTestMatch.length > 0
  ? { testMatch: pwTestMatch.split(',') }
  : {}),
```

This uses a spread so it only overrides `testMatch` when the env var is set. The existing `testMatch` or `testIgnore` defaults remain active for local dev.

- [ ] **Step 3: Remove the old CI-conditional testMatch**

The current config has:
```typescript
...(process.env.CI && {
  testMatch: ['**/module-00-setup/**/*.spec.ts'],
}),
```

Remove this block — `progress.yml` will now control which tests run via `PW_TEST_MATCH`, and the old behaviour of restricting to M00 on CI is superseded.

- [ ] **Step 4: Verify config compiles**

```bash
npx tsc --noEmit --skipLibCheck playwright.config.ts
```

Expected: no errors.

- [ ] **Step 5: Verify local dev still works (no env var set)**

```bash
npx playwright test tests/module-00-setup --list
```

Expected: lists M00 tests without error.

- [ ] **Step 6: Verify PW_TEST_MATCH filtering works**

```bash
PW_TEST_MATCH="tests/module-00-setup/**" npx playwright test --list
```

On Windows PowerShell:
```powershell
$env:PW_TEST_MATCH="tests/module-00-setup/**"; npx playwright test --list
```

Expected: only M00 tests listed.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts
git commit -m "feat(ci): add PW_TEST_MATCH env var support to playwright.config.ts"
```

---

## Part 2 — Finalize Script & Reporting

### Task 9: GitHub Actions summary generator

**Files:**
- Create: `scripts/lib/summary.ts`

- [ ] **Step 1: Create `scripts/lib/summary.ts`**

```typescript
import { appendFileSync } from 'fs';
import type { DecisionType } from '../types';

const SUMMARY_PATH = process.env.GITHUB_STEP_SUMMARY ?? '/dev/null';

function append(line: string): void {
  appendFileSync(SUMMARY_PATH, line + '\n', 'utf-8');
}

export function writeSummary(
  decision: DecisionType,
  moduleResults: Map<string, boolean>,
  commitSha: string,
  pagesUrl: string | null
): void {
  const short = commitSha.slice(0, 7);
  append(`## Playwright Progress — commit ${short}\n`);

  if (decision.type === 'cancelled') {
    append('> ⚠️ CI run was cancelled — no state changes made.\n');
    return;
  }

  append('| Module | Status |');
  append('|--------|--------|');
  for (const [moduleId, passed] of moduleResults) {
    append(`| ${moduleId} | ${passed ? '✅ pass' : '❌ FAIL'} |`);
  }
  append('');

  if (decision.type === 'unlock') {
    const next = decision.nextCurrent ?? 'none (all complete)';
    const auto = decision.autoCompleted.length
      ? `\n> 🔄 Auto-completed awareness modules: ${decision.autoCompleted.join(', ')}`
      : '';
    append(`\n✅ **All tests passed!** Unlocked: **${next}**${auto}\n`);
  } else if (decision.type === 'complete') {
    append('\n🎉 **All 93 modules complete! Congratulations!**\n');
  } else if (decision.type === 'fail') {
    append(`\n❌ **FAIL** — ${decision.failedModules.join(', ')} failed. Fix and push again.\n`);
  } else if (decision.type === 'regression') {
    const note = decision.scaffoldChangedModules.length
      ? ` (scaffold updated by developer: ${decision.scaffoldChangedModules.join(', ')})`
      : '';
    append(`\n⚠️ **Regression** in completed modules: ${decision.regressionModules.join(', ')}${note}\n`);
  } else if (decision.type === 'complete-regression-fail') {
    append(`\n⚠️ **Regression in completed suite**: ${decision.failedModules.join(', ')} — fix and push.\n`);
  }

  if (pagesUrl) {
    append(`\n📊 Full report: ${pagesUrl}\n`);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --skipLibCheck scripts/lib/summary.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/summary.ts
git commit -m "feat(ci): add GitHub Actions step summary generator"
```

---

### Task 10: GitHub Pages generator

**Files:**
- Create: `scripts/lib/pages.ts`

- [ ] **Step 1: Create `scripts/lib/pages.ts`**

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import type { DecisionType } from '../types';

export interface ManifestEntry {
  sha: string;
  date: string;
  result: 'pass' | 'fail' | 'regression' | 'cancelled';
  modulesRun: string[];
  reportPath: string;
}

export function loadManifest(manifestPath: string): ManifestEntry[] {
  if (!existsSync(manifestPath)) return [];
  return JSON.parse(readFileSync(manifestPath, 'utf-8')) as ManifestEntry[];
}

export function appendManifest(manifestPath: string, entry: ManifestEntry): void {
  const entries = loadManifest(manifestPath);
  entries.unshift(entry);
  writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
}

export function buildManifestEntry(
  commitSha: string,
  decision: DecisionType,
  moduleResults: Map<string, boolean>
): ManifestEntry {
  const resultMap: Record<DecisionType['type'], ManifestEntry['result']> = {
    unlock: 'pass',
    complete: 'pass',
    fail: 'fail',
    regression: 'regression',
    'complete-regression-fail': 'regression',
    cancelled: 'cancelled',
  };
  return {
    sha: commitSha,
    date: new Date().toISOString(),
    result: resultMap[decision.type],
    modulesRun: [...moduleResults.keys()],
    reportPath: `reports/${commitSha}/index.html`,
  };
}

export function generateIndexHtml(entries: ManifestEntry[], baseUrl: string): string {
  const rows = entries.map(e => {
    const icon = e.result === 'pass' ? '✅' : e.result === 'cancelled' ? '⏹️' : '❌';
    const date = new Date(e.date).toLocaleString();
    return `
    <tr>
      <td><code>${e.sha.slice(0, 7)}</code></td>
      <td>${date}</td>
      <td>${icon} ${e.result}</td>
      <td>${e.modulesRun.join(', ')}</td>
      <td><a href="${baseUrl}/${e.reportPath}">View report</a></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Playwright Progress Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f5f5f5; }
    tr:nth-child(even) { background: #fafafa; }
    code { background: #eee; padding: 0.1em 0.3em; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>Playwright Learning Progress</h1>
  <table>
    <thead><tr><th>Commit</th><th>Date</th><th>Result</th><th>Modules</th><th>Report</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --skipLibCheck scripts/lib/pages.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/pages.ts
git commit -m "feat(ci): add gh-pages manifest and index.html generator"
```

---

### Task 11: Finalize orchestrator

**Files:**
- Create: `scripts/ci-finalize.ts`

- [ ] **Step 1: Create `scripts/ci-finalize.ts`**

```typescript
import { existsSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { readProgress, writeProgress, initProgress, markComplete, computeActiveScaffoldChanges } from './lib/state';
import { buildTestMatch, moduleDirectory, scaffoldDirectory, getModuleConfig } from './lib/module-utils';
import { parseResults } from './lib/results-parser';
import { makeDecision } from './lib/decision';
import { writeSummary } from './lib/summary';
import { appendManifest, buildManifestEntry, generateIndexHtml, loadManifest, ensureDir } from './lib/pages';
import { computeFileHash } from './lib/hash';
import { writeFileSync } from 'fs';
import { MODULES } from './modules.config';

const COMMIT_SHA = process.env.GITHUB_SHA ?? 'local';
const RESULTS_PATH = process.env.RESULTS_JSON_PATH ?? 'test-results/results.json';
const PAGES_BASE_URL = process.env.PAGES_BASE_URL ?? '';
const GH_PAGES_DIR = process.env.GH_PAGES_DIR ?? '.gh-pages';

function run(cmd: string): void {
  execSync(cmd, { stdio: 'inherit' });
}

async function main(): Promise<void> {
  // 1. Read or initialise progress
  let progress = readProgress();

  if (!progress) {
    const firstModule = MODULES.find(m => m.hasExercise);
    if (!firstModule) throw new Error('No modules with exercises found');
    const firstId = `M${firstModule.number}`;
    progress = initProgress(firstId);

    const src = `${scaffoldDirectory(firstId)}/exercise.spec.ts`;
    const dest = `${moduleDirectory(firstId)}/exercise.spec.ts`;
    ensureDir(moduleDirectory(firstId));
    copyFileSync(src, dest);

    writeProgress(progress);
    run(`git add scripts/progress.json "${dest}"`);
    run(`git commit -m "chore(ci): cold start — initialise progress and unlock ${firstId} [skip ci]"`);
    try {
      run('git push origin main');
    } catch {
      run('git pull --rebase origin main && git push origin main');
    }
    console.log(`Cold start complete. ${firstId} scaffold added.`);
    return;
  }

  // 2. Parse results (empty map = cancelled)
  let moduleResults = new Map<string, boolean>();
  if (existsSync(RESULTS_PATH)) {
    moduleResults = parseResults(RESULTS_PATH);
  }

  // 3. Check scaffold changes
  const scaffoldChanges = computeActiveScaffoldChanges(progress);

  // 4. Make decision
  const decision = makeDecision(moduleResults, progress, scaffoldChanges);
  console.log(`Decision: ${decision.type}`);

  // 5. Apply state changes
  const filesToCommit: string[] = ['scripts/progress.json'];

  if (decision.type === 'unlock') {
    const { completedId, nextCurrent, autoCompleted } = decision;
    const nextScaffoldHash = nextCurrent
      ? computeFileHash(`${scaffoldDirectory(nextCurrent)}/exercise.spec.ts`)
      : null;

    const updated = markComplete(progress, completedId, autoCompleted, nextCurrent, nextScaffoldHash);
    writeProgress(updated);

    if (nextCurrent) {
      const src = `${scaffoldDirectory(nextCurrent)}/exercise.spec.ts`;
      const dest = `${moduleDirectory(nextCurrent)}/exercise.spec.ts`;
      ensureDir(moduleDirectory(nextCurrent));
      copyFileSync(src, dest);
      filesToCommit.push(dest);
    }
  } else {
    writeProgress({ ...progress, lastCommitSha: COMMIT_SHA, lastUpdated: new Date().toISOString() });
  }

  // 6. Commit state (skip if cancelled)
  if (decision.type !== 'cancelled') {
    const label = decision.type === 'unlock'
      ? `unlock ${(decision as { completedId: string }).completedId}`
      : decision.type;
    run(`git add ${filesToCommit.map(f => `"${f}"`).join(' ')}`);
    try {
      run(`git commit -m "chore(ci): ${label} [skip ci]"`);
      try {
        run('git push origin main');
      } catch {
        run('git pull --rebase origin main');
        run('git push origin main');
      }
    } catch {
      console.log('Nothing new to commit.');
    }
  }

  // 7. Publish to gh-pages
  const pagesUrl = PAGES_BASE_URL
    ? `${PAGES_BASE_URL}/reports/${COMMIT_SHA}/index.html`
    : null;

  try {
    const manifestPath = join(GH_PAGES_DIR, 'manifest.json');
    const indexPath = join(GH_PAGES_DIR, 'index.html');

    const entry = buildManifestEntry(COMMIT_SHA, decision, moduleResults);
    appendManifest(manifestPath, entry);

    const entries = loadManifest(manifestPath);
    writeFileSync(indexPath, generateIndexHtml(entries, PAGES_BASE_URL), 'utf-8');

    run(`cd "${GH_PAGES_DIR}" && git add -A && git commit -m "ci: report ${COMMIT_SHA.slice(0, 7)} [skip ci]" && git push origin gh-pages`);
  } catch (err) {
    console.warn('gh-pages publish failed (non-fatal):', err);
  }

  // 8. Write Actions summary
  writeSummary(decision, moduleResults, COMMIT_SHA, pagesUrl);
}

main().catch(err => {
  console.error('ci-finalize fatal:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --skipLibCheck scripts/ci-finalize.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add scripts/ci-finalize.ts
git commit -m "feat(ci): add ci-finalize.ts orchestrator"
```

---

## Part 3 — CI Workflow

### Task 12: Create scope helper script + `progress.yml`

**Files:**
- Create: `scripts/get-test-match.ts`
- Create: `.github/workflows/progress.yml`

- [ ] **Step 1: Create `scripts/get-test-match.ts`**

This script is called by the workflow to compute `PW_TEST_MATCH` without inline eval gymnastics:

```typescript
import { readFileSync } from 'fs';
import { buildTestMatch } from './lib/module-utils';
import type { ProgressState } from './types';

const progress = JSON.parse(readFileSync('scripts/progress.json', 'utf-8')) as ProgressState;
const completedIds = progress.completedModules.map(m => m.id);
process.stdout.write(buildTestMatch(completedIds, progress.currentModule?.id ?? null));
```

- [ ] **Step 2: Verify it runs**

```bash
echo '{"completedModules":[],"currentModule":{"id":"M00","unlockedAt":"2026-01-01T00:00:00Z","scaffoldHash":null},"lastUpdated":"2026-01-01T00:00:00Z","lastCommitSha":"abc"}' > scripts/progress.json
npx tsx scripts/get-test-match.ts
```

Expected output: `tests/module-00-setup/**`

Then remove the test file:
```bash
rm scripts/progress.json
```

- [ ] **Step 3: Commit**

```bash
git add scripts/get-test-match.ts
git commit -m "feat(ci): add get-test-match.ts scope helper for workflow"
```

---

### Task 13 (continued): Create `.github/workflows/progress.yml`

**Files:**
- Create: `.github/workflows/progress.yml`

- [ ] **Step 1: Create the full workflow file**

Create `.github/workflows/progress.yml`:

```yaml
name: Progressive CI

on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - 'scaffolds/**'
      - '*.md'
  workflow_dispatch:

concurrency:
  group: progress-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  test:
    name: Run module tests
    runs-on: ubuntu-latest
    outputs:
      is_cold_start: ${{ steps.scope.outputs.is_cold_start }}
      pw_test_match: ${{ steps.scope.outputs.pw_test_match }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Compute test scope
        id: scope
        run: |
          if [ ! -f scripts/progress.json ]; then
            echo "is_cold_start=true" >> "$GITHUB_OUTPUT"
            echo "pw_test_match=" >> "$GITHUB_OUTPUT"
          else
            MATCH=$(npx tsx scripts/get-test-match.ts)
            echo "is_cold_start=false" >> "$GITHUB_OUTPUT"
            echo "pw_test_match=$MATCH" >> "$GITHUB_OUTPUT"
          fi

      - name: Install Playwright browsers
        if: steps.scope.outputs.is_cold_start == 'false'
        run: npx playwright install --with-deps chromium

      - name: Generate Prisma client
        if: steps.scope.outputs.is_cold_start == 'false'
        run: cd lumio && npx prisma generate

      - name: Seed database
        if: steps.scope.outputs.is_cold_start == 'false'
        run: cd lumio && npx prisma db push && npx prisma db seed
        env:
          DATABASE_URL: file:./dev.db

      - name: Run Playwright tests
        if: steps.scope.outputs.is_cold_start == 'false' && steps.scope.outputs.pw_test_match != ''
        run: npx playwright test --reporter=json,html
        env:
          PW_TEST_MATCH: ${{ steps.scope.outputs.pw_test_match }}
          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/results.json

      - name: Upload results artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
          retention-days: 7
          if-no-files-found: ignore

  finalize:
    name: Finalize — update state and publish
    runs-on: ubuntu-latest
    needs: test
    if: always()
    # TODO: add [if: github.actor != 'github-actions[bot]'] for belt-and-suspenders cycle guard
    permissions:
      contents: write
      pages: write
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Configure git identity
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download test results
        uses: actions/download-artifact@v4
        with:
          name: test-results
          path: downloaded-results/
        continue-on-error: true

      - name: Stage results
        run: |
          mkdir -p test-results playwright-report
          [ -f downloaded-results/results.json ] && cp downloaded-results/results.json test-results/results.json || true
          [ -d downloaded-results/playwright-report ] && cp -r downloaded-results/playwright-report/. playwright-report/ || true

      - name: Checkout gh-pages branch
        run: |
          if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
            git worktree add .gh-pages gh-pages
          else
            git worktree add --orphan -b gh-pages .gh-pages
            touch .gh-pages/.nojekyll
            echo '[]' > .gh-pages/manifest.json
            cd .gh-pages && git add -A && git commit -m "chore: initialise gh-pages"
            git push origin gh-pages
          fi

      - name: Copy HTML report to gh-pages
        run: |
          mkdir -p ".gh-pages/reports/${{ github.sha }}"
          [ -d playwright-report ] && cp -r playwright-report/. ".gh-pages/reports/${{ github.sha }}/" || true

      - name: Run finalize script
        run: npx tsx scripts/ci-finalize.ts
        env:
          GITHUB_SHA: ${{ github.sha }}
          RESULTS_JSON_PATH: test-results/results.json
          PAGES_BASE_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}
          GH_PAGES_DIR: .gh-pages
```

- [ ] **Step 2: Validate YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/progress.yml'))" && echo "YAML valid"
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/progress.yml
git commit -m "feat(ci): add progress.yml workflow with test + finalize jobs"
```

---

### Task 13: Disable old playwright.yml

**Files:**
- Modify: `.github/workflows/playwright.yml`

- [ ] **Step 1: Add `if: false` to the test job**

Open `.github/workflows/playwright.yml`. Find the first job key inside `jobs:` and add `if: false` as its first property:

```yaml
jobs:
  test:
    if: false  # superseded by progress.yml — delete this line to re-enable
    runs-on: ubuntu-latest
    ...
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/playwright.yml
git commit -m "chore(ci): disable playwright.yml — superseded by progress.yml"
```

---

## Part 4 — Scaffold Migration

### Task 14: Create scaffold directory

**Files:**
- Create: `scaffolds/module-XX-*/exercise.spec.ts` for all `hasExercise: true` modules

- [ ] **Step 1: Create and run one-time migration script**

Create a temporary file `scripts/_migrate.ts` (will be deleted after use):

```typescript
import { MODULES } from './modules.config';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join } from 'path';

for (const mod of MODULES) {
  const srcDir = `tests/module-${mod.number}-${mod.slug}`;
  const destDir = `scaffolds/module-${mod.number}-${mod.slug}`;

  if (!mod.hasExercise) {
    // Create empty directory marker for awareness modules
    mkdirSync(destDir, { recursive: true });
    continue;
  }

  if (!existsSync(srcDir)) {
    console.warn(`Missing: ${srcDir} — skipping`);
    continue;
  }

  mkdirSync(destDir, { recursive: true });

  for (const ext of ['exercise.spec.ts', 'exercise.spec.tsx']) {
    const src = join(srcDir, ext);
    const dest = join(destDir, ext);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`✓ ${src} → ${dest}`);
    }
  }

  // Copy supporting files (task-data.json, pages/, etc.) — exclude exercise specs
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.startsWith('exercise.spec.')) continue;
    const src = join(srcDir, entry.name);
    const dest = join(destDir, entry.name);
    if (entry.isFile()) {
      copyFileSync(src, dest);
      console.log(`✓ ${src} → ${dest} (support file)`);
    } else if (entry.isDirectory()) {
      mkdirSync(dest, { recursive: true });
      // Shallow: add recursive copy here if nested files are needed
    }
  }
}
console.log('\nDone.');
```

```bash
npx tsx scripts/_migrate.ts
```

- [ ] **Step 2: Verify scaffold count matches expected**

```bash
ls scaffolds/ | wc -l
```

Expected: 93 directories.

- [ ] **Step 3: Delete migration script and commit scaffolds**

```bash
rm scripts/_migrate.ts
git add scaffolds/
git commit -m "chore: add scaffolds/ directory with all 93 exercise sources"
```

---

### Task 15: Reset tests/ to pristine learner state

**Files:**
- Modify: `tests/` — remove exercise files for all modules except M00
- Delete: `scripts/progress.json` — triggers cold start on first push

- [ ] **Step 1: Remove exercise spec files for all locked modules**

```bash
npx tsx -e "
const { MODULES } = require('./scripts/modules.config');
const { existsSync, unlinkSync } = require('fs');
for (const m of MODULES) {
  if (!m.hasExercise || m.number === '00') continue;
  for (const ext of ['exercise.spec.ts', 'exercise.spec.tsx']) {
    const p = 'tests/module-' + m.number + '-' + m.slug + '/' + ext;
    if (existsSync(p)) { unlinkSync(p); console.log('Removed:', p); }
  }
}
console.log('Done.');
"
```

- [ ] **Step 2: Delete progress.json to arm cold-start detection**

```bash
rm -f scripts/progress.json
```

- [ ] **Step 3: Verify M00 still has its exercise file**

```bash
ls tests/module-00-setup/
```

Expected: `exercise.spec.ts` still present.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: reset tests/ to pristine learner state — cold start ready"
```

---

## Part 5 — Integration Verification

### Task 16: Verify cold start and first unlock

- [ ] **Step 1: Enable GitHub Pages**

In the GitHub repo → Settings → Pages → Source: set to `Deploy from a branch` → Branch: `gh-pages` → `/ (root)`. Save. (One-time manual setup per fork.)

- [ ] **Step 2: Push to trigger cold start**

```bash
git push origin main
```

Open Actions → "Progressive CI". Expected sequence:
- `test` job: no `progress.json` → `is_cold_start=true` → Playwright step skipped
- `finalize` job: cold start path → copies M00 scaffold → commits `scripts/progress.json` + `tests/module-00-setup/exercise.spec.ts` with `[skip ci]` → pushes
- No second workflow run triggered

- [ ] **Step 3: Pull and verify local state**

```bash
git pull origin main
```

Check:
- `scripts/progress.json` exists with `currentModule.id = "M00"`
- `tests/module-00-setup/exercise.spec.ts` exists
- `git log --oneline -3` shows the `[skip ci]` cold start commit

- [ ] **Step 4: Solve M00 and push**

Open `tests/module-00-setup/exercise.spec.ts`. Fill in the TODOs so all tests pass. Then:

```bash
npx playwright test tests/module-00-setup
```

Expected: all M00 tests pass locally.

```bash
git add tests/module-00-setup/exercise.spec.ts
git commit -m "exercise(m00): complete setup module"
git push origin main
```

- [ ] **Step 5: Verify unlock**

Watch Actions → "Progressive CI" run. Expected:
- `test` job: `PW_TEST_MATCH=tests/module-00-setup/**` → M00 tests run → all pass
- `finalize` decision = `unlock` → commits updated `progress.json` + `tests/module-02-locators/exercise.spec.ts` (M01 is awareness, auto-completed) with `[skip ci]`

Pull and verify:
```bash
git pull origin main
cat scripts/progress.json
# completedModules should contain M00 and M01 (auto-completed)
# currentModule.id should be "M02"
ls tests/module-02-locators/
# exercise.spec.ts should exist
```

- [ ] **Step 6: Verify failure → no unlock**

Introduce a failing test in `tests/module-02-locators/exercise.spec.ts` and push. Expected:
- `finalize` decision = `fail`
- `progress.json` unchanged
- Actions summary shows ❌
- No new exercise file added

- [ ] **Step 7: Verify Pages dashboard**

Open `https://<username>.github.io/<repo>/`. Expected:
- Table with at least two rows (cold start + M00 solve runs)
- "View report" links open Playwright HTML reports

