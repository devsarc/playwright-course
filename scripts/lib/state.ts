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
