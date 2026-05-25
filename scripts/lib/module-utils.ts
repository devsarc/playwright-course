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
