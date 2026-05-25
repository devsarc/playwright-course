import { existsSync, cpSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { readProgress, writeProgress, initProgress, markComplete, computeActiveScaffoldChanges } from './lib/state';
import { buildTestMatch, moduleDirectory, scaffoldDirectory, getModuleConfig } from './lib/module-utils';
import { parseResults } from './lib/results-parser';
import { makeDecision } from './lib/decision';
import { writeSummary } from './lib/summary';
import { appendManifest, buildManifestEntry, generateIndexHtml, loadManifest } from './lib/pages';
import { computeFileHash } from './lib/hash';
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

    cpSync(scaffoldDirectory(firstId), moduleDirectory(firstId), { recursive: true });

    writeProgress(progress);
    run(`git add scripts/progress.json "${moduleDirectory(firstId)}"`);
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
      cpSync(scaffoldDirectory(nextCurrent), moduleDirectory(nextCurrent), { recursive: true });
      filesToCommit.push(moduleDirectory(nextCurrent));
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
