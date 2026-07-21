import { describe, expect, it } from 'vitest';
import { GameSession } from '../src/game/simulation/GameSession';
import type { Verdict } from '../src/game/simulation/types';

const OTHER_VERDICT: Record<Verdict, Verdict> = {
  accept: 'return',
  return: 'quarantine',
  quarantine: 'accept',
};

function startSession(seed = 123): GameSession {
  const session = new GameSession();
  session.startRun(seed);
  session.startShift();
  return session;
}

describe('game session', () => {
  it('starts with a playable parcel and full hearts', () => {
    const snapshot = startSession().snapshot();

    expect(snapshot.phase).toBe('playing');
    expect(snapshot.currentCase).not.toBeNull();
    expect(snapshot.hearts).toBe(3);
    expect(snapshot.processed).toBe(0);
  });

  it('awards score and combo for the correct stamp', () => {
    const session = startSession();
    const activeCase = session.snapshot().currentCase!;
    const result = session.decide(activeCase.verdict);

    expect(result?.correct).toBe(true);
    expect(result?.points).toBeGreaterThan(0);
    expect(session.snapshot().combo).toBe(1);
    expect(session.snapshot().hearts).toBe(3);
  });

  it('removes one heart for an incorrect stamp', () => {
    const session = startSession();
    const activeCase = session.snapshot().currentCase!;
    const result = session.decide(OTHER_VERDICT[activeCase.verdict]);

    expect(result?.correct).toBe(false);
    expect(session.snapshot().hearts).toBe(2);
    expect(session.snapshot().combo).toBe(0);
  });

  it('charges time only the first time each inspection tool is used', () => {
    const session = startSession();
    const before = session.snapshot().timeRemainingMs;

    expect(session.inspect('xray')).toBe(true);
    const afterFirstScan = session.snapshot().timeRemainingMs;
    expect(afterFirstScan).toBeLessThan(before);
    expect(session.inspect('xray')).toBe(false);
    expect(session.snapshot().timeRemainingMs).toBe(afterFirstScan);
  });

  it('advances to the next parcel after the result animation', () => {
    const session = startSession();
    const firstCase = session.snapshot().currentCase!;
    session.decide(firstCase.verdict);
    session.tick(1_500);

    const snapshot = session.snapshot();
    expect(snapshot.phase).toBe('playing');
    expect(snapshot.processed).toBe(1);
    expect(snapshot.currentCase?.id).not.toBe(firstCase.id);
  });
});
