import { describe, expect, it } from 'vitest';
import { generateShiftCases, mulberry32 } from '../src/game/content/generator';

describe('case generator', () => {
  it('is deterministic for a seeded night', () => {
    const first = generateShiftCases(3, 8, mulberry32(1307));
    const second = generateShiftCases(3, 8, mulberry32(1307));

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
  });

  it('always teaches all three verdicts in a full shift', () => {
    const cases = generateShiftCases(0, 6, mulberry32(42));
    const verdicts = new Set(cases.map((entry) => entry.verdict));

    expect(verdicts).toEqual(new Set(['accept', 'return', 'quarantine']));
  });

  it('never repeats a case template inside one shift', () => {
    const cases = generateShiftCases(4, 9, mulberry32(991));
    expect(new Set(cases.map((entry) => entry.id)).size).toBe(cases.length);
  });
});
