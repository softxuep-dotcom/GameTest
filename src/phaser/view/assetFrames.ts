import type { ParcelStyle } from '../../game/simulation/types';

export interface MonsterArtFrame {
  texture: 'monster-customers-v1' | 'monster-customers-v2';
  frame: number;
}

const CUSTOMER_FRAMES: Record<string, MonsterArtFrame> = {
  vesper: { texture: 'monster-customers-v1', frame: 0 },
  gloop: { texture: 'monster-customers-v1', frame: 1 },
  pebble: { texture: 'monster-customers-v1', frame: 2 },
  ember: { texture: 'monster-customers-v1', frame: 3 },
  tock: { texture: 'monster-customers-v1', frame: 4 },
  'mira-moth': { texture: 'monster-customers-v1', frame: 5 },
  bramble: { texture: 'monster-customers-v2', frame: 0 },
  yvonne: { texture: 'monster-customers-v2', frame: 1 },
  nib: { texture: 'monster-customers-v2', frame: 2 },
  sprig: { texture: 'monster-customers-v2', frame: 3 },
  bix: { texture: 'monster-customers-v2', frame: 4 },
  opal: { texture: 'monster-customers-v2', frame: 5 },
};

const PARCEL_FRAMES: Record<ParcelStyle['emblem'], number> = {
  moon: 0,
  eye: 1,
  flame: 2,
  leaf: 3,
  star: 4,
  bone: 5,
};

const XRAY_FRAMES: Record<string, number> = {
  'damaged-vial': 0,
  mimic: 1,
  'live-egg': 2,
  'lava-lamp': 3,
  'phoenix-feather': 3,
};

export function monsterFrameForCustomer(customerId: string): MonsterArtFrame {
  return CUSTOMER_FRAMES[customerId] ?? CUSTOMER_FRAMES.vesper!;
}

export function parcelFrameForEmblem(emblem: ParcelStyle['emblem']): number {
  return PARCEL_FRAMES[emblem];
}

export function xrayFrameForCase(caseId: string): number | null {
  return XRAY_FRAMES[caseId] ?? null;
}
