import type { CustomerTemplate } from '../simulation/types';

export const CUSTOMERS: CustomerTemplate[] = [
  {
    id: 'mira-moth', name: 'Mira', species: 'Moon Moth', bodyColor: 0xb8a2ff,
    accentColor: 0xffd36a, eyeColor: 0x1b1734, eyeCount: 2, feature: 'antennae',
    greeting: 'Handle it gently. It hums when nervous.',
  },
  {
    id: 'gloop', name: 'Gloop', species: 'Gelatinous Citizen', bodyColor: 0x52d8c0,
    accentColor: 0xa9fff0, eyeColor: 0x14253a, eyeCount: 2, feature: 'none',
    greeting: 'No leaks from me. Probably the parcel.',
  },
  {
    id: 'bramble', name: 'Bramble', species: 'Bogling', bodyColor: 0x7da05a,
    accentColor: 0xd9bb62, eyeColor: 0x182213, eyeCount: 3, feature: 'ears',
    greeting: 'Fresh from the swamp. Mind the moss.',
  },
  {
    id: 'ember', name: 'Ember', species: 'Ash Newt', bodyColor: 0xd9684f,
    accentColor: 0xffc45c, eyeColor: 0x301317, eyeCount: 2, feature: 'fins',
    greeting: 'If you smell smoke, that is entirely normal.',
  },
  {
    id: 'tock', name: 'Tock', species: 'Clockwork Goblin', bodyColor: 0x8d7864,
    accentColor: 0x63d1dc, eyeColor: 0x161b28, eyeCount: 1, feature: 'ears',
    greeting: 'Paid in exact change. Down to the second.',
  },
  {
    id: 'yvonne', name: 'Yvonne', species: 'Frost Yeti', bodyColor: 0xcce8f2,
    accentColor: 0x5f8cae, eyeColor: 0x13253f, eyeCount: 2, feature: 'horns',
    greeting: 'It was already cold when I found it.',
  },
  {
    id: 'nib', name: 'Nib', species: 'Ink Imp', bodyColor: 0x46416d,
    accentColor: 0xe86a9b, eyeColor: 0xfce9b8, eyeCount: 2, feature: 'horns',
    greeting: 'The address is smudged artistically.',
  },
  {
    id: 'pebble', name: 'Pebble', species: 'Stonekin', bodyColor: 0x8f93a2,
    accentColor: 0xc6a56b, eyeColor: 0x241d2d, eyeCount: 2, feature: 'none',
    greeting: 'Heavy? No. The counter is simply weak.',
  },
  {
    id: 'vesper', name: 'Vesper', species: 'Velvet Bat', bodyColor: 0x713c71,
    accentColor: 0xe6b0d3, eyeColor: 0xffdf78, eyeCount: 2, feature: 'ears',
    greeting: 'Daylight delivery was not an option.',
  },
  {
    id: 'sprig', name: 'Sprig', species: 'Root Sprite', bodyColor: 0x769b55,
    accentColor: 0xe1d47a, eyeColor: 0x192815, eyeCount: 1, feature: 'antennae',
    greeting: 'It needs water. Or absolutely must avoid water.',
  },
  {
    id: 'bix', name: 'Bix', species: 'Marsh Gremlin', bodyColor: 0x3cae8f,
    accentColor: 0xff8d66, eyeColor: 0x10261f, eyeCount: 3, feature: 'ears',
    greeting: 'I did not shake it. Much.',
  },
  {
    id: 'opal', name: 'Opal', species: 'Crystal Wisp', bodyColor: 0x7dc9e8,
    accentColor: 0xf4b7ff, eyeColor: 0x20213d, eyeCount: 2, feature: 'fins',
    greeting: 'The parcel reflects futures. Ignore the rude ones.',
  },
];
