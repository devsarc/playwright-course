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

  if (progress.currentModule === null) {
    return { type: 'complete-regression-fail', failedModules: failed };
  }

  const completedIds = new Set(progress.completedModules.map(m => m.id));
  const regressionModules = failed.filter(id => completedIds.has(id));
  const scaffoldChangedModules = failed.filter(id => scaffoldChanges.get(id) === true);

  if (regressionModules.length > 0) {
    return { type: 'regression', regressionModules, scaffoldChangedModules };
  }

  return { type: 'fail', failedModules: failed };
}
