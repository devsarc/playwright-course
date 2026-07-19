/**
 * Branch Generation Script
 *
 * Builds all 20 lesson branches sequentially. Each branch:
 * 1. Starts from the correct Lumio snapshot (tagged commit on main)
 * 2. Has tests/solved/ pre-populated with solutions from all previous modules
 * 3. Has tests/module-NN-topic/ with the exercise scaffold for this module
 *
 * Usage:
 *   npx tsx scripts/build-branches.ts             # build all branches
 *   npx tsx scripts/build-branches.ts --from 05   # rebuild from module 05 onward
 *   npx tsx scripts/build-branches.ts --dry-run   # print what would happen, no git ops
 */

import { execSync, ExecSyncOptions } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { MODULES, ModuleConfig } from './modules.config';

const ROOT = resolve(__dirname, '..');
const TESTS_DIR = join(ROOT, 'tests');
const SCAFFOLDS_DIR = join(ROOT, 'scaffolds');

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FROM_INDEX = (() => {
  const idx = args.indexOf('--from');
  if (idx === -1) return 0;
  const fromNum = args[idx + 1];
  const found = MODULES.findIndex(m => m.number === fromNum.padStart(2, '0'));
  if (found === -1) throw new Error(`--from: module ${fromNum} not found in registry`);
  return found;
})();

function git(cmd: string, opts: ExecSyncOptions = {}): string {
  const fullCmd = `git ${cmd}`;
  if (DRY_RUN) {
    console.log(`  [dry-run] ${fullCmd}`);
    return '';
  }
  return (execSync(fullCmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...opts }) as string).trim();
}

function copyDir(src: string, dest: string): void {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function branchExists(name: string): boolean {
  try {
    execSync(`git rev-parse --verify ${name}`, { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function tagExists(tag: string): boolean {
  try {
    execSync(`git rev-parse --verify refs/tags/${tag}`, { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function buildBranch(module: ModuleConfig, prevModules: ModuleConfig[]): void {
  const branchName = `module-${module.number}-${module.slug}`;
  const solutionBranchName = `${branchName}-solution`;
  const moduleDir = join(TESTS_DIR, `module-${module.number}-${module.slug}`);
  const scaffoldDir = join(SCAFFOLDS_DIR, `module-${module.number}-${module.slug}`);

  console.log(`\n▶ Building ${branchName}`);

  // Verify the scaffold exists before creating the branch
  if (!existsSync(scaffoldDir)) {
    console.warn(`  ⚠ scaffolds/${branchName}/ not found — skipping branch creation`);
    return;
  }

  // Delete existing branch if rebuilding
  if (branchExists(branchName)) {
    git(`branch -D ${branchName}`);
  }

  // Determine base: use Lumio snapshot tag if specified, else main
  const base = module.lumioSnapshot && tagExists(module.lumioSnapshot)
    ? module.lumioSnapshot
    : 'main';

  git(`checkout -b ${branchName} ${base}`);
  console.log(`  ✓ Branched from ${base}`);

  // Seed tests/module-NN-topic/ from scaffolds/ (snapshot may not have it)
  if (!DRY_RUN) {
    copyDir(scaffoldDir, moduleDir);
    git(`add "${moduleDir}"`);
    const seedStatus = (execSync(`git status --porcelain "${moduleDir}"`, { cwd: ROOT, encoding: 'utf8' }) as string).trim();
    if (seedStatus) {
      git(`commit -m "chore: seed ${branchName} exercise from scaffold"`);
      console.log(`  ✓ Seeded tests/${branchName}/`);
    }
  } else {
    console.log(`  [dry-run] Would seed tests/${branchName}/ from scaffolds/${branchName}/`);
  }

  // Populate tests/solved/ with all previous module solutions
  const solvedDir = join(TESTS_DIR, 'solved');
  for (const prev of prevModules) {
    const prevSolutionBranch = `${prev.number}-${prev.slug}-solution`;
    const destDir = join(solvedDir, `module-${prev.number}-${prev.slug}`);

    if (!existsSync(destDir) && branchExists(`module-${prevSolutionBranch}`)) {
      // Extract solution files from the solution branch without switching branches
      if (!DRY_RUN) {
        mkdirSync(destDir, { recursive: true });
        try {
          // Copy exercise.spec.ts from solution branch into solved/
          git(
            `show module-${prevSolutionBranch}:tests/module-${prev.number}-${prev.slug}/exercise.spec.ts`,
            { stdio: ['pipe', 'pipe', 'pipe'] }
          );
          // If we got here without error, write the file
          const content = execSync(
            `git show module-${prevSolutionBranch}:tests/module-${prev.number}-${prev.slug}/exercise.spec.ts`,
            { cwd: ROOT, encoding: 'utf8' }
          );
          require('fs').writeFileSync(join(destDir, 'exercise.spec.ts'), content);
          console.log(`  ✓ Seeded solved/${prev.number}-${prev.slug}/exercise.spec.ts`);
        } catch {
          console.warn(`  ⚠ Could not find solution for module-${prev.number} — skipping`);
        }
      } else {
        console.log(`  [dry-run] Would seed solved/module-${prev.number}-${prev.slug}/`);
      }
    }
  }

  if (!DRY_RUN && existsSync(solvedDir)) {
    git('add tests/solved/');
    const status = execSync('git status --porcelain tests/solved/', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (status) {
      git(`commit -m "chore: seed solved/ with prior module solutions up to M${module.number}"`);
      console.log(`  ✓ Committed tests/solved/`);
    }
  }

  console.log(`  ✓ Branch ${branchName} ready`);

  // Create solution branch
  if (branchExists(solutionBranchName)) {
    git(`branch -D ${solutionBranchName}`);
  }
  git(`checkout -b ${solutionBranchName} ${branchName}`);
  console.log(`  ✓ Created solution branch ${solutionBranchName} (populate manually)`);

  // Return to main before next iteration
  git('checkout main');
}

async function main(): Promise<void> {
  console.log(`Branch generation script`);
  console.log(`DRY_RUN: ${DRY_RUN}`);
  console.log(`Building modules ${FROM_INDEX} → ${MODULES.length - 1}`);

  // Ensure we're on main before starting
  const currentBranch = execSync('git branch --show-current', { cwd: ROOT, encoding: 'utf8' }).trim();
  if (currentBranch !== 'main') {
    throw new Error(`Must be on main branch before running. Currently on: ${currentBranch}`);
  }

  const modulesToBuild = MODULES.slice(FROM_INDEX);
  const priorModules = MODULES.slice(0, FROM_INDEX);

  for (let i = 0; i < modulesToBuild.length; i++) {
    const module = modulesToBuild[i];
    const prevModules = [...priorModules, ...modulesToBuild.slice(0, i)];
    buildBranch(module, prevModules);
  }

  console.log('\n✅ All branches created.');
  if (DRY_RUN) console.log('(Dry run — no actual git operations performed)');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
