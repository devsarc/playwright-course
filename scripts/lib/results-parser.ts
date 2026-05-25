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
