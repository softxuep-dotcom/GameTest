import Phaser from 'phaser';
import './style.css';
import { AudioManager } from './game/audio/AudioManager';
import { createGameConfig } from './game/config';
import { GameSession } from './game/simulation/GameSession';
import { createPlatformAdapter } from './platform';
import { SaveStore } from './storage/SaveStore';
import { GameUI } from './ui/GameUI';

async function bootstrap(): Promise<void> {
  const root = document.querySelector<HTMLElement>('#game-ui');
  if (!root) throw new Error('Missing game UI root.');

  const platform = createPlatformAdapter();
  await platform.init();

  const session = new GameSession();
  const audio = new AudioManager();
  const saveStore = new SaveStore();
  new GameUI(root, session, audio, platform, saveStore);

  const game = new Phaser.Game(createGameConfig(session, audio));
  game.events.once(Phaser.Core.Events.READY, () => platform.loadingFinished());
  window.setTimeout(() => platform.loadingFinished(), 1800);

  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', ' '].includes(event.key)) event.preventDefault();
  }, { passive: false });
  window.addEventListener('wheel', (event) => event.preventDefault(), { passive: false });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) platform.gameplayStop();
    else if (session.snapshot().phase === 'playing') platform.gameplayStart();
  });
}

void bootstrap();
