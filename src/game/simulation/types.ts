export type Verdict = 'accept' | 'return' | 'quarantine';
export type ToolId = 'xray' | 'resonance' | 'aura';
export type GamePhase =
  | 'menu'
  | 'briefing'
  | 'playing'
  | 'resolving'
  | 'shift-complete'
  | 'game-over'
  | 'victory';

export type MonsterFeature = 'horns' | 'ears' | 'antennae' | 'fins' | 'none';

export interface CustomerTemplate {
  id: string;
  name: string;
  species: string;
  bodyColor: number;
  accentColor: number;
  eyeColor: number;
  eyeCount: 1 | 2 | 3;
  feature: MonsterFeature;
  greeting: string;
}

export interface ParcelStyle {
  bodyColor: number;
  ribbonColor: number;
  shape: 'box' | 'tube' | 'satchel';
  emblem: 'moon' | 'eye' | 'flame' | 'leaf' | 'star' | 'bone';
  damaged?: boolean;
}

export interface ParcelCaseTemplate {
  id: string;
  parcelName: string;
  minShift: number;
  verdict: Verdict;
  issue: string;
  explanation: string;
  visibleHints: string[];
  decisiveTool?: ToolId;
  clues: Record<ToolId, string>;
  incident: string;
  style: ParcelStyle;
}

export interface ActiveCase extends ParcelCaseTemplate {
  customer: CustomerTemplate;
  trackingCode: string;
}

export interface ShiftConfig {
  id: number;
  title: string;
  subtitle: string;
  quota: number;
  timeSeconds: number;
  rules: string[];
}

export interface CaseResult {
  correct: boolean;
  chosen: Verdict;
  expected: Verdict;
  explanation: string;
  incident: string;
  points: number;
  coins: number;
}

export type UpgradeId = 'clock' | 'heart' | 'streak' | 'tools' | 'tips';

export interface UpgradeDefinition {
  id: UpgradeId;
  title: string;
  description: string;
  icon: string;
}

export interface GameSnapshot {
  phase: GamePhase;
  shiftIndex: number;
  shift: ShiftConfig;
  score: number;
  coins: number;
  hearts: number;
  maxHearts: number;
  combo: number;
  bestCombo: number;
  processed: number;
  correct: number;
  timeRemainingMs: number;
  currentCase: ActiveCase | null;
  usedTools: ToolId[];
  revealedClues: Partial<Record<ToolId, string>>;
  lastResult: CaseResult | null;
  upgrades: UpgradeDefinition[];
  ownedUpgrades: Partial<Record<UpgradeId, number>>;
}
