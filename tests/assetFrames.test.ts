import { describe, expect, it } from 'vitest';
import { CASE_TEMPLATES } from '../src/game/content/cases';
import { monsterFrameForCustomer, parcelFrameForEmblem, xrayFrameForCase } from '../src/phaser/view/assetFrames';

describe('generated art frame mappings', () => {
  it('maps representative customers to their character portraits', () => {
    expect(monsterFrameForCustomer('vesper')).toEqual({ texture: 'monster-customers-v1', frame: 0 });
    expect(monsterFrameForCustomer('gloop')).toEqual({ texture: 'monster-customers-v1', frame: 1 });
    expect(monsterFrameForCustomer('mira-moth')).toEqual({ texture: 'monster-customers-v1', frame: 5 });
    expect(monsterFrameForCustomer('yvonne')).toEqual({ texture: 'monster-customers-v2', frame: 1 });
    expect(monsterFrameForCustomer('opal')).toEqual({ texture: 'monster-customers-v2', frame: 5 });
    expect(monsterFrameForCustomer('unknown-customer')).toEqual({ texture: 'monster-customers-v1', frame: 0 });
  });

  it('maps all parcel emblems to the six atlas frames', () => {
    expect(['moon', 'eye', 'flame', 'leaf', 'star', 'bone'].map((emblem) =>
      parcelFrameForEmblem(emblem as 'moon' | 'eye' | 'flame' | 'leaf' | 'star' | 'bone'),
    )).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('maps every case to its own authored X-ray evidence frame', () => {
    expect(xrayFrameForCase('damaged-vial')).toEqual({ texture: 'xray-evidence-v1', frame: 0 });
    expect(xrayFrameForCase('boots-safe')).toEqual({ texture: 'xray-evidence-v2', frame: 1 });
    expect(xrayFrameForCase('forged-label')).toEqual({ texture: 'xray-evidence-v3', frame: 3 });
    expect(xrayFrameForCase('timepiece')).toEqual({ texture: 'xray-evidence-v4', frame: 1 });
    expect(xrayFrameForCase('phoenix-feather')).toEqual({ texture: 'xray-evidence-v5', frame: 3 });

    const mappedFrames = CASE_TEMPLATES.map(({ id }) => xrayFrameForCase(id));
    expect(mappedFrames.every((frame) => frame !== null)).toBe(true);
    expect(new Set(mappedFrames.map((frame) => `${frame!.texture}:${frame!.frame}`)).size).toBe(CASE_TEMPLATES.length);
    expect(xrayFrameForCase('unknown-case')).toBeNull();
  });
});
