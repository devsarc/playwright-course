import { readFileSync } from 'fs';
import { buildTestMatch } from './lib/module-utils';
import type { ProgressState } from './types';

const progress = JSON.parse(readFileSync('scripts/progress.json', 'utf-8')) as ProgressState;
const completedIds = progress.completedModules.map(m => m.id);
process.stdout.write(buildTestMatch(completedIds, progress.currentModule?.id ?? null));
