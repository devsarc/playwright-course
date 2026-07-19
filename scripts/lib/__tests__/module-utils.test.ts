import { describe, it, expect } from 'vitest';
import {
  filePathToModuleId,
  buildTestMatch,
  moduleDirectory,
  scaffoldDirectory,
  getNextModule,
  findNextCurrent,
} from '../module-utils';

describe('filePathToModuleId', () => {
  it('extracts module ID from test file path', () => {
    expect(filePathToModuleId('tests/module-01-test-runner-organization/exercise.spec.ts')).toBe('M01');
  });
  it('extracts ID with nested path', () => {
    expect(filePathToModuleId('tests/module-10-architecture-and-patterns/pages/KanbanPage.ts')).toBe('M10');
  });
  it('returns null for non-module paths', () => {
    expect(filePathToModuleId('tests/fixtures/fixtures.ts')).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(filePathToModuleId('')).toBeNull();
  });
});

describe('moduleDirectory', () => {
  it('builds the correct tests/ directory path', () => {
    expect(moduleDirectory('M00')).toBe('tests/module-00-foundations');
  });
  it('works for a mid-range module', () => {
    expect(moduleDirectory('M10')).toBe('tests/module-10-architecture-and-patterns');
  });
  it('throws for unknown module ID', () => {
    expect(() => moduleDirectory('M99')).toThrow('Module M99 not found');
  });
});

describe('scaffoldDirectory', () => {
  it('builds the correct scaffolds/ directory path', () => {
    expect(scaffoldDirectory('M00')).toBe('scaffolds/module-00-foundations');
  });
});

describe('buildTestMatch', () => {
  it('builds comma-separated globs for exercise modules', () => {
    const result = buildTestMatch(['M00'], 'M01');
    expect(result).toBe('tests/module-00-foundations/**,tests/module-01-test-runner-organization/**');
  });
  it('returns empty string when nothing is testable', () => {
    expect(buildTestMatch([], null)).toBe('');
  });
  it('handles null currentModule (post-completion regression mode)', () => {
    const result = buildTestMatch(['M00', 'M01'], null);
    expect(result).toBe('tests/module-00-foundations/**,tests/module-01-test-runner-organization/**');
  });
  it('includes every completed module — no lesson is awareness-only anymore', () => {
    // Unlike the old 93-module registry (where M01/M73 had hasExercise=false),
    // every merged lesson has hasExercise=true, so buildTestMatch never
    // excludes a completed module.
    const result = buildTestMatch(['M00', 'M01', 'M02'], null);
    expect(result).toBe(
      'tests/module-00-foundations/**,tests/module-01-test-runner-organization/**,tests/module-02-network-and-apis/**'
    );
  });
});

describe('getNextModule', () => {
  it('returns the next module config after given ID', () => {
    const next = getNextModule('M00');
    expect(next?.number).toBe('01');
  });
  it('returns null for the last module (M19)', () => {
    expect(getNextModule('M19')).toBeNull();
  });
});

describe('findNextCurrent', () => {
  it('returns the immediate next module with no auto-completed — no awareness-only lessons remain', () => {
    const result = findNextCurrent('M00');
    expect(result.nextCurrent).toBe('M01');
    expect(result.autoCompleted).toEqual([]);
  });
  it('returns null nextCurrent when completing the last module', () => {
    const result = findNextCurrent('M19');
    expect(result.nextCurrent).toBeNull();
    expect(result.autoCompleted).toEqual([]);
  });
});
