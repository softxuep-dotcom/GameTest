import type { ShiftConfig } from '../simulation/types';

export const SHIFTS: ShiftConfig[] = [
  {
    id: 1,
    title: 'First Bell',
    subtitle: 'Learn the three stamps before midnight traffic arrives.',
    quota: 6,
    timeSeconds: 82,
    rules: ['Damaged or invalid parcels are RETURNED.', 'Living cargo is QUARANTINED.', 'Everything lawful and stable is ACCEPTED.'],
  },
  {
    id: 2,
    title: 'Whispers in Wax',
    subtitle: 'Curses hide where ordinary lamps cannot see.',
    quota: 7,
    timeSeconds: 80,
    rules: ['Cursed aura is QUARANTINED.', 'Unpaid postage is RETURNED.', 'Strange is not the same as illegal.'],
  },
  {
    id: 3,
    title: 'Hot Cargo',
    subtitle: 'The furnace district sends its regards.',
    quota: 8,
    timeSeconds: 78,
    rules: ['Volatile cores are QUARANTINED.', 'Wrong labels are RETURNED.', 'Use the X-ray before judging heavy parcels.'],
  },
  {
    id: 4,
    title: 'Echo Hour',
    subtitle: 'Some parcels arrive before they were mailed.',
    quota: 8,
    timeSeconds: 76,
    rules: ['Time echoes are QUARANTINED.', 'Broken seals are RETURNED.', 'A quiet parcel can still be cursed.'],
  },
  {
    id: 5,
    title: 'The Thirteenth Chime',
    subtitle: 'Every rule is active. Keep the city sleeping.',
    quota: 9,
    timeSeconds: 74,
    rules: ['Living, cursed, volatile, or temporal cargo: QUARANTINE.', 'Damage, forgery, or unpaid postage: RETURN.', 'Clear lawful mail: ACCEPT.'],
  },
];
