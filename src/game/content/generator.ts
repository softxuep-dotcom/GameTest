import { CASE_TEMPLATES } from './cases';
import { CUSTOMERS } from './customers';
import type { ActiveCase, ParcelCaseTemplate, Verdict } from '../simulation/types';

export type RandomSource = () => number;

export function mulberry32(seed: number): RandomSource {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: T[], random: RandomSource): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const current = copy[index];
    const swapped = copy[target];
    if (current !== undefined && swapped !== undefined) {
      copy[index] = swapped;
      copy[target] = current;
    }
  }
  return copy;
}

export function generateShiftCases(shiftIndex: number, count: number, random: RandomSource): ActiveCase[] {
  const available = CASE_TEMPLATES.filter((entry) => entry.minShift <= shiftIndex);
  const byVerdict = new Map<Verdict, ParcelCaseTemplate[]>([
    ['accept', shuffle(available.filter((entry) => entry.verdict === 'accept'), random)],
    ['return', shuffle(available.filter((entry) => entry.verdict === 'return'), random)],
    ['quarantine', shuffle(available.filter((entry) => entry.verdict === 'quarantine'), random)],
  ]);

  const picked: ParcelCaseTemplate[] = [];
  const minimums: Verdict[] = ['accept', 'return', 'quarantine'];
  for (const verdict of minimums) {
    const candidate = byVerdict.get(verdict)?.shift();
    if (candidate) picked.push(candidate);
  }

  const remainder = shuffle(available.filter((entry) => !picked.includes(entry)), random);
  picked.push(...remainder.slice(0, Math.max(0, count - picked.length)));

  const selectedCustomers = shuffle(CUSTOMERS, random);
  return shuffle(picked.slice(0, count), random).map((template, index) => ({
    ...template,
    customer: selectedCustomers[index % selectedCustomers.length] ?? CUSTOMERS[0]!,
    trackingCode: `MM-${String(shiftIndex + 1).padStart(2, '0')}-${Math.floor(random() * 8999 + 1000)}`,
  }));
}
