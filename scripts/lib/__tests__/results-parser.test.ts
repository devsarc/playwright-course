import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { parseResults } from '../results-parser';

const FIXTURES = join(__dirname, 'fixtures');

describe('parseResults', () => {
  it('returns all-true map when all tests pass', () => {
    const result = parseResults(join(FIXTURES, 'results-pass.json'));
    expect(result.get('M00')).toBe(true);
    expect(result.get('M02')).toBe(true);
    expect(result.size).toBe(2);
  });

  it('marks module false when any test in it fails', () => {
    const result = parseResults(join(FIXTURES, 'results-fail.json'));
    expect(result.get('M00')).toBe(true);
    expect(result.get('M02')).toBe(false);
  });

  it('ignores suites whose file path does not match a module', () => {
    const result = parseResults(join(FIXTURES, 'results-pass.json'));
    expect(result.has('M99')).toBe(false);
  });
});
