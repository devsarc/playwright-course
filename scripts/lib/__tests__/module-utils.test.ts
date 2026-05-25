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
    expect(filePathToModuleId('tests/module-02-locators/exercise.spec.ts')).toBe('M02');
  });
  it('extracts ID with nested path', () => {
    expect(filePathToModuleId('tests/module-47-page-object-model/pages/KanbanPage.ts')).toBe('M47');
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
    expect(moduleDirectory('M00')).toBe('tests/module-00-setup');
  });
  it('works for a mid-range module', () => {
    expect(moduleDirectory('M47')).toBe('tests/module-47-page-object-model');
  });
  it('throws for unknown module ID', () => {
    expect(() => moduleDirectory('M99')).toThrow('Module M99 not found');
  });
});

describe('scaffoldDirectory', () => {
  it('builds the correct scaffolds/ directory path', () => {
    expect(scaffoldDirectory('M00')).toBe('scaffolds/module-00-setup');
  });
});

describe('buildTestMatch', () => {
  it('builds comma-separated globs for exercise modules', () => {
    const result = buildTestMatch(['M00'], 'M02');
    expect(result).toBe('tests/module-00-setup/**,tests/module-02-locators/**');
  });
  it('excludes awareness modules (hasExercise=false)', () => {
    // M01 is an awareness module
    const result = buildTestMatch(['M00', 'M01'], 'M02');
    expect(result).toBe('tests/module-00-setup/**,tests/module-02-locators/**');
  });
  it('returns empty string when nothing is testable', () => {
    expect(buildTestMatch([], null)).toBe('');
  });
  it('handles null currentModule (post-completion regression mode)', () => {
    const result = buildTestMatch(['M00', 'M02'], null);
    expect(result).toBe('tests/module-00-setup/**,tests/module-02-locators/**');
  });
});

describe('getNextModule', () => {
  it('returns the next module config after given ID', () => {
    const next = getNextModule('M00');
    expect(next?.number).toBe('01');
  });
  it('returns null for the last module (M92)', () => {
    expect(getNextModule('M92')).toBeNull();
  });
});

describe('findNextCurrent', () => {
  it('returns next hasExercise module and no auto-completed when next has exercise', () => {
    // After M00 (setup), M01 is awareness, then M02 has exercise
    const result = findNextCurrent('M00');
    expect(result.nextCurrent).toBe('M02');
    expect(result.autoCompleted).toEqual(['M01']);
  });
  it('returns null nextCurrent and all remaining as autoCompleted if none have exercise', () => {
    // After M72 (electron), M73 (android) is awareness, M74 has exercise
    const result = findNextCurrent('M72');
    expect(result.nextCurrent).toBe('M74');
    expect(result.autoCompleted).toEqual(['M73']);
  });
  it('returns null nextCurrent when completing the last module', () => {
    const result = findNextCurrent('M92');
    expect(result.nextCurrent).toBeNull();
    expect(result.autoCompleted).toEqual([]);
  });
});
