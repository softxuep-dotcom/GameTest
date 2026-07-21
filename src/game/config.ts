import Phaser from 'phaser';
import type { AudioManager } from './audio/AudioManager';
import type { GameSession } from './simulation/GameSession';
import { BootScene } from '../phaser/scenes/BootScene';
import { GameScene } from '../phaser/scenes/GameScene';

export function createGameConfig(session: GameSession, audio: AudioManager): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 1280,
    height: 720,
    backgroundColor: '#100d20',
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'high-performance',
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    scene: [new BootScene(), new GameScene(session, audio)],
    banner: false,
  };
}
