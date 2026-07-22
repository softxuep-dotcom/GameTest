import type { ParcelStyle } from '../../game/simulation/types';

export interface MonsterArtFrame {
  texture: 'monster-customers-v1' | 'monster-customers-v2';
  frame: number;
}

export interface XrayArtFrame {
  texture:
    | 'xray-evidence-v1'
    | 'xray-evidence-v2'
    | 'xray-evidence-v3'
    | 'xray-evidence-v4'
    | 'xray-evidence-v5';
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

const XRAY_FRAMES: Record<string, XrayArtFrame> = {
  'damaged-vial': { texture: 'xray-evidence-v1', frame: 0 },
  mimic: { texture: 'xray-evidence-v1', frame: 1 },
  'live-egg': { texture: 'xray-evidence-v1', frame: 2 },
  'lava-lamp': { texture: 'xray-evidence-v1', frame: 3 },
  'tea-safe': { texture: 'xray-evidence-v2', frame: 0 },
  'boots-safe': { texture: 'xray-evidence-v2', frame: 1 },
  'cookies-safe': { texture: 'xray-evidence-v2', frame: 2 },
  'broken-seal': { texture: 'xray-evidence-v2', frame: 3 },
  underpaid: { texture: 'xray-evidence-v3', frame: 0 },
  'cursed-doll': { texture: 'xray-evidence-v3', frame: 1 },
  'lucky-moss': { texture: 'xray-evidence-v3', frame: 2 },
  'forged-label': { texture: 'xray-evidence-v3', frame: 3 },
  'cold-candle': { texture: 'xray-evidence-v4', frame: 0 },
  timepiece: { texture: 'xray-evidence-v4', frame: 1 },
  'future-cake': { texture: 'xray-evidence-v4', frame: 2 },
  'singing-stone': { texture: 'xray-evidence-v4', frame: 3 },
  'shadow-bottle': { texture: 'xray-evidence-v5', frame: 0 },
  'star-seeds': { texture: 'xray-evidence-v5', frame: 1 },
  'fizz-root': { texture: 'xray-evidence-v5', frame: 2 },
  'phoenix-feather': { texture: 'xray-evidence-v5', frame: 3 },
};

export function monsterFrameForCustomer(customerId: string): MonsterArtFrame {
  return CUSTOMER_FRAMES[customerId] ?? CUSTOMER_FRAMES.vesper!;
}

export function parcelFrameForEmblem(emblem: ParcelStyle['emblem']): number {
  return PARCEL_FRAMES[emblem];
}

export function xrayFrameForCase(caseId: string): XrayArtFrame | null {
  return XRAY_FRAMES[caseId] ?? null;
}
