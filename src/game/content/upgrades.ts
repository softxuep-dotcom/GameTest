import type { UpgradeDefinition } from '../simulation/types';

export const UPGRADES: UpgradeDefinition[] = [
  { id: 'clock', icon: '⏱', title: 'Union Break', description: '+8 seconds at the start of every future shift.' },
  { id: 'heart', icon: '♥', title: 'Reinforced Glass', description: '+1 maximum heart and repair one mistake.' },
  { id: 'streak', icon: '✦', title: 'Golden Stamp', description: 'Correct streaks award 20% more score.' },
  { id: 'tools', icon: '⌁', title: 'Calibrated Tools', description: 'Inspection tools consume less shift time.' },
  { id: 'tips', icon: '¢', title: 'Tip Jar', description: 'Correct inspections award 25% more coins.' },
];
