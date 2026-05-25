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
