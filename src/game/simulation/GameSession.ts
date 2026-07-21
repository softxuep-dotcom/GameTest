import { generateShiftCases, mulberry32, type RandomSource } from '../content/generator';
import { SHIFTS } from '../content/shifts';
import { UPGRADES } from '../content/upgrades';
import type {
  ActiveCase,
  CaseResult,
  GamePhase,
  GameSnapshot,
  ToolId,
  UpgradeDefinition,
  UpgradeId,
  Verdict,
} from './types';

type SessionListener = (snapshot: GameSnapshot) => void;

export class GameSession {
  private phase: GamePhase = 'menu';
  private shiftIndex = 0;
  private score = 0;
  private coins = 0;
  private hearts = 3;
  private maxHearts = 3;
  private combo = 0;
  private bestCombo = 0;
  private processed = 0;
  private correct = 0;
  private timeRemainingMs = SHIFTS[0]!.timeSeconds * 1000;
  private currentCase: ActiveCase | null = null;
  private caseDeck: ActiveCase[] = [];
  private usedTools = new Set<ToolId>();
  private revealedClues: Partial<Record<ToolId, string>> = {};
  private lastResult: CaseResult | null = null;
  private listeners = new Set<SessionListener>();
  private resolveRemainingMs = 0;
  private caseElapsedMs = 0;
  private random: RandomSource = mulberry32(Date.now());
  private ownedUpgrades: Partial<Record<UpgradeId, number>> = {};
  private upgradeChoices: UpgradeDefinition[] = [];

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): GameSnapshot {
    return {
      phase: this.phase,
      shiftIndex: this.shiftIndex,
      shift: SHIFTS[this.shiftIndex] ?? SHIFTS[SHIFTS.length - 1]!,
      score: this.score,
      coins: this.coins,
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      combo: this.combo,
      bestCombo: this.bestCombo,
      processed: this.processed,
      correct: this.correct,
      timeRemainingMs: this.timeRemainingMs,
      currentCase: this.currentCase,
      usedTools: [...this.usedTools],
      revealedClues: { ...this.revealedClues },
      lastResult: this.lastResult,
      upgrades: [...this.upgradeChoices],
      ownedUpgrades: { ...this.ownedUpgrades },
    };
  }

  startRun(seed = Date.now()): void {
    this.random = mulberry32(seed);
    this.shiftIndex = 0;
    this.score = 0;
    this.coins = 0;
    this.maxHearts = 3;
    this.hearts = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.ownedUpgrades = {};
    this.lastResult = null;
    this.prepareBriefing();
    this.emit();
  }

  startShift(): void {
    if (this.phase !== 'briefing') return;
    const shift = SHIFTS[this.shiftIndex];
    if (!shift) return;
    this.processed = 0;
    this.correct = 0;
    const clockStacks = this.ownedUpgrades.clock ?? 0;
    this.timeRemainingMs = (shift.timeSeconds + clockStacks * 8) * 1000;
    this.caseDeck = generateShiftCases(this.shiftIndex, shift.quota, this.random);
    this.phase = 'playing';
    this.loadNextCase();
    this.emit();
  }

  tick(deltaMs: number): void {
    if (this.phase === 'playing') {
      const previousSecond = Math.ceil(this.timeRemainingMs / 1000);
      this.timeRemainingMs = Math.max(0, this.timeRemainingMs - deltaMs);
      this.caseElapsedMs += deltaMs;
      if (this.timeRemainingMs <= 0) {
        this.phase = 'game-over';
        this.currentCase = null;
        this.emit();
      } else if (Math.ceil(this.timeRemainingMs / 1000) !== previousSecond) {
        this.emit();
      }
      return;
    }

    if (this.phase === 'resolving') {
      this.resolveRemainingMs -= deltaMs;
      if (this.resolveRemainingMs <= 0) this.advanceAfterResult();
    }
  }

  inspect(tool: ToolId): boolean {
    if (this.phase !== 'playing' || !this.currentCase || this.usedTools.has(tool)) return false;
    this.usedTools.add(tool);
    this.revealedClues[tool] = this.currentCase.clues[tool];
    const toolStacks = this.ownedUpgrades.tools ?? 0;
    const cost = Math.max(250, 1100 - toolStacks * 300);
    this.timeRemainingMs = Math.max(0, this.timeRemainingMs - cost);
    this.emit();
    return true;
  }

  decide(verdict: Verdict): CaseResult | null {
    if (this.phase !== 'playing' || !this.currentCase) return null;
    const isCorrect = verdict === this.currentCase.verdict;
    const streakMultiplier = 1 + (this.ownedUpgrades.streak ?? 0) * 0.2;
    const speedBonus = Math.max(0, 60 - Math.floor(this.caseElapsedMs / 160));
    const points = isCorrect ? Math.round((100 + speedBonus + this.combo * 18) * streakMultiplier) : 0;
    const earnedCoins = isCorrect ? Math.round(12 * (1 + (this.ownedUpgrades.tips ?? 0) * 0.25)) : 0;

    if (isCorrect) {
      this.combo += 1;
      this.correct += 1;
      this.score += points;
      this.coins += earnedCoins;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
    } else {
      this.combo = 0;
      this.hearts = Math.max(0, this.hearts - 1);
    }

    this.lastResult = {
      correct: isCorrect,
      chosen: verdict,
      expected: this.currentCase.verdict,
      explanation: this.currentCase.explanation,
      incident: this.currentCase.incident,
      points,
      coins: earnedCoins,
    };
    this.phase = 'resolving';
    this.resolveRemainingMs = 1450;
    this.emit();
    return this.lastResult;
  }

  chooseUpgrade(upgradeId: UpgradeId): void {
    if (this.phase !== 'shift-complete' || !this.upgradeChoices.some((choice) => choice.id === upgradeId)) return;
    this.ownedUpgrades[upgradeId] = (this.ownedUpgrades[upgradeId] ?? 0) + 1;
    if (upgradeId === 'heart') {
      this.maxHearts += 1;
      this.hearts = Math.min(this.maxHearts, this.hearts + 1);
    }
    this.shiftIndex += 1;
    if (this.shiftIndex >= SHIFTS.length) {
      this.phase = 'victory';
      this.currentCase = null;
    } else {
      this.prepareBriefing();
    }
    this.emit();
  }

  returnToMenu(): void {
    this.phase = 'menu';
    this.currentCase = null;
    this.emit();
  }

  revive(): boolean {
    if (this.phase !== 'game-over') return false;
    this.hearts = 1;
    this.timeRemainingMs = Math.max(this.timeRemainingMs, 20_000);
    this.phase = 'playing';
    this.loadNextCase();
    this.emit();
    return true;
  }

  private prepareBriefing(): void {
    this.phase = 'briefing';
    this.processed = 0;
    this.correct = 0;
    this.currentCase = null;
    this.usedTools.clear();
    this.revealedClues = {};
  }

  private loadNextCase(): void {
    this.currentCase = this.caseDeck[this.processed] ?? null;
    this.usedTools.clear();
    this.revealedClues = {};
    this.lastResult = null;
    this.caseElapsedMs = 0;
  }

  private advanceAfterResult(): void {
    this.processed += 1;
    if (this.hearts <= 0) {
      this.phase = 'game-over';
      this.currentCase = null;
      this.emit();
      return;
    }
    const shift = SHIFTS[this.shiftIndex]!;
    if (this.processed >= shift.quota) {
      this.score += Math.floor(this.timeRemainingMs / 1000) * 10;
      this.coins += this.correct * 2;
      this.phase = 'shift-complete';
      this.currentCase = null;
      this.upgradeChoices = this.pickUpgradeChoices();
      this.emit();
      return;
    }
    this.phase = 'playing';
    this.loadNextCase();
    this.emit();
  }

  private pickUpgradeChoices(): UpgradeDefinition[] {
    const shuffled = [...UPGRADES].sort(() => this.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  private emit(): void {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
