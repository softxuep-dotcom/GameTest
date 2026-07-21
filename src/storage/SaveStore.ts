import { detectLocale, isSupportedLocale, type SupportedLocale } from '../i18n/i18n';

export interface SaveData {
  version: 1;
  bestScore: number;
  bestNight: number;
  gamesPlayed: number;
  muted: boolean;
  language: SupportedLocale;
}

const SAVE_KEY = 'monster_mail_save_v1';

const DEFAULT_SAVE: SaveData = {
  version: 1,
  bestScore: 0,
  bestNight: 0,
  gamesPlayed: 0,
  muted: false,
  language: detectLocale(),
};

export class SaveStore {
  load(): SaveData {
    try {
      const value = localStorage.getItem(SAVE_KEY);
      if (!value) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(value) as Partial<SaveData>;
      const merged: SaveData = {
        ...DEFAULT_SAVE,
        ...parsed,
        version: 1,
      };
      merged.language = isSupportedLocale(parsed.language) ? parsed.language : detectLocale();
      return merged;
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  save(data: SaveData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // A private browser session may reject storage. The game still remains playable.
    }
  }

  updateResult(score: number, nightReached: number, incrementGames = true): SaveData {
    const current = this.load();
    const updated: SaveData = {
      ...current,
      bestScore: Math.max(current.bestScore, score),
      bestNight: Math.max(current.bestNight, nightReached),
      gamesPlayed: current.gamesPlayed + (incrementGames ? 1 : 0),
    };
    this.save(updated);
    return updated;
  }

  setMuted(muted: boolean): SaveData {
    const updated = { ...this.load(), muted };
    this.save(updated);
    return updated;
  }

  setLanguage(language: SupportedLocale): SaveData {
    const updated = { ...this.load(), language };
    this.save(updated);
    return updated;
  }
}
