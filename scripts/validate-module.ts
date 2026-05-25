/**
 * Pre-push module validator.
 * Run: npx tsx scripts/validate-module.ts
 * Detects the current branch's module and checks scaffold integrity.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { MODULES } from './modules.config';

const ROOT = resolve(__dirname, '..');

function getCurrentBranch(): string {
  return execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf8' }).trim();
}

function detectModule(branch: string): string | null {
  const match = branch.match(/module-(\d{2})-([a-z-]+)/);
  if (!match) return null;
  return `module-${match[1]}-${match[2]}`;
}

interface ValidationResult {
  pass: boolean;
  message: string;
}

function validate(moduleDir: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const testsPath = join(ROOT, 'tests', moduleDir);

  // Check directory exists
  results.push({
    pass: existsSync(testsPath),
    message: `tests/${moduleDir}/ directory exists`,
  });

  if (!existsSync(testsPath)) return results;

  // Check required files
  for (const file of ['README.md', 'hints.md', 'lumio-context.md']) {
    results.push({
      pass: existsSync(join(testsPath, file)),
      message: `${file} exists`,
    });
  }

  // Check if this module has an exercise
  const moduleConfig = MODULES.find(m => `module-${m.number}-${m.slug}` === moduleDir);
  if (!moduleConfig) {
    results.push({ pass: false, message: `Module not found in modules.config.ts registry` });
    return results;
  }

  if (moduleConfig.hasExercise) {
    const specPath = join(testsPath, 'exercise.spec.ts');
    results.push({ pass: existsSync(specPath), message: 'exercise.spec.ts exists' });

    if (existsSync(specPath)) {
      const content = readFileSync(specPath, 'utf8');

      // Check for correct import
      const hasCorrectImport = content.includes("from '../fixtures/fixtures'");
      results.push({
        pass: hasCorrectImport,
        message: "Imports from '../fixtures/fixtures' (not from '@playwright/test' directly)",
      });

      // Count unfilled TODOs
      const todoCount = (content.match(/\/\* TODO \d+/g) || []).length;
      results.push({
        pass: true,
        message: `${todoCount} TODO(s) remaining (0 means all complete, which is fine for solutions)`,
      });
    }
  }

  return results;
}

function main(): void {
  const branch = getCurrentBranch();
  const moduleName = detectModule(branch);

  if (!moduleName) {
    console.error(`Not on a module branch. Current branch: ${branch}`);
    console.error('Expected branch format: module-NN-topic');
    process.exit(1);
  }

  console.log(`Validating ${moduleName} (branch: ${branch})\n`);

  const results = validate(moduleName);
  let allPassed = true;

  for (const { pass, message } of results) {
    const icon = pass ? '✅' : '❌';
    console.log(`${icon} ${message}`);
    if (!pass) allPassed = false;
  }

  if (!allPassed) {
    console.log('\n❌ Validation failed. Fix the issues above before pushing.');
    process.exit(1);
  }

  console.log('\n✅ All checks passed. Safe to push.');
}

main();
