import { describe, expect, it } from 'vitest';
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

  it('uses authored X-ray evidence only for matching cases', () => {
    expect(xrayFrameForCase('damaged-vial')).toBe(0);
    expect(xrayFrameForCase('mimic')).toBe(1);
    expect(xrayFrameForCase('live-egg')).toBe(2);
    expect(xrayFrameForCase('lava-lamp')).toBe(3);
    expect(xrayFrameForCase('tea-safe')).toBeNull();
  });
});
