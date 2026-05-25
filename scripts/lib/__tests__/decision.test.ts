import { describe, it, expect } from 'vitest';
import { makeDecision } from '../decision';
import type { ProgressState } from '../../types';

const baseProgress: ProgressState = {
  completedModules: [
    { id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' },
  ],
  currentModule: { id: 'M02', unlockedAt: '2026-01-02T00:00:00Z', scaffoldHash: 'def' },
  lastUpdated: '2026-01-02T00:00:00Z',
  lastCommitSha: 'abc123',
};

const noChanges = new Map<string, boolean>([['M00', false], ['M02', false]]);

describe('makeDecision', () => {
  it('returns cancelled when results map is empty (job was cancelled)', () => {
    const d = makeDecision(new Map(), baseProgress, new Map());
    expect(d.type).toBe('cancelled');
  });

  it('returns unlock when all tests pass', () => {
    const results = new Map([['M00', true], ['M02', true]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('unlock');
    if (d.type === 'unlock') {
      expect(d.completedId).toBe('M02');
      expect(d.nextCurrent).toBe('M03'); // M03 is actions, hasExercise=true
      expect(d.autoCompleted).toEqual([]);
    }
  });

  it('auto-completes awareness modules when unlocking past M00', () => {
    // Completing M00: next is M01 (awareness), then M02 (exercise)
    const progress: ProgressState = {
      completedModules: [],
      currentModule: { id: 'M00', unlockedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' },
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', true]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('unlock');
    if (d.type === 'unlock') {
      expect(d.nextCurrent).toBe('M02');
      expect(d.autoCompleted).toEqual(['M01']);
    }
  });

  it('returns fail when current module fails', () => {
    const results = new Map([['M00', true], ['M02', false]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('fail');
    if (d.type === 'fail') {
      expect(d.failedModules).toContain('M02');
      expect(d.failedModules).not.toContain('M00');
    }
  });

  it('returns regression when a completed module fails', () => {
    const results = new Map([['M00', false], ['M02', true]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('regression');
    if (d.type === 'regression') {
      expect(d.regressionModules).toContain('M00');
      expect(d.scaffoldChangedModules).toEqual([]);
    }
  });

  it('flags scaffold-changed modules in regression', () => {
    const results = new Map([['M00', false], ['M02', true]]);
    const changes = new Map([['M00', true], ['M02', false]]);
    const d = makeDecision(results, baseProgress, changes);
    expect(d.type).toBe('regression');
    if (d.type === 'regression') {
      expect(d.scaffoldChangedModules).toContain('M00');
    }
  });

  it('returns complete when currentModule is null and all pass', () => {
    const progress: ProgressState = {
      completedModules: [{ id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' }],
      currentModule: null,
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', true]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('complete');
  });

  it('returns complete-regression-fail when post-completion module fails', () => {
    const progress: ProgressState = {
      completedModules: [{ id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' }],
      currentModule: null,
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', false]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('complete-regression-fail');
  });
});
