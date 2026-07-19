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
    append('\n🎉 **All 20 lessons complete! Congratulations!**\n');
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
