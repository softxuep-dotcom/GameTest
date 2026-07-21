import { describe, expect, it } from 'vitest';
import { CASE_TEMPLATES } from '../src/game/content/cases';
import { CUSTOMERS } from '../src/game/content/customers';
import { SHIFTS } from '../src/game/content/shifts';
import { UPGRADES } from '../src/game/content/upgrades';
import {
  caseTranslation,
  customerTranslation,
  detectLocale,
  message,
  shiftTranslation,
  upgradeTranslation,
} from '../src/i18n/i18n';

describe('localization', () => {
  it('detects Simplified Chinese and falls back to English', () => {
    expect(detectLocale(['zh-CN', 'en'])).toBe('zh-CN');
    expect(detectLocale(['en-GB', 'fr'])).toBe('en');
  });

  it('interpolates translated UI messages', () => {
    expect(message('zh-CN', 'nightOf', { night: 2, total: 5 })).toBe('第 2 / 5 夜');
    expect(message('en', 'correctCount', { correct: 6, total: 6 })).toBe('6 / 6 CORRECT');
  });

  it('has complete Chinese translations for every content entry', () => {
    for (const entry of CASE_TEMPLATES) {
      const translation = caseTranslation('zh-CN', entry.id);
      expect(translation?.parcelName, entry.id).toBeTruthy();
      expect(translation?.visibleHints, entry.id).toHaveLength(entry.visibleHints.length);
      expect(Object.keys(translation?.clues ?? {}), entry.id).toHaveLength(3);
    }
    for (const customer of CUSTOMERS) expect(customerTranslation('zh-CN', customer.id), customer.id).toBeTruthy();
    for (const shift of SHIFTS) expect(shiftTranslation('zh-CN', shift.id)?.rules, String(shift.id)).toHaveLength(shift.rules.length);
    for (const upgrade of UPGRADES) expect(upgradeTranslation('zh-CN', upgrade.id), upgrade.id).toBeTruthy();
  });
});
