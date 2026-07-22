import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('post-office-night', 'assets/environment/post-office-night.webp');
    this.load.spritesheet('monster-customers-v1', 'assets/characters/monster-customers-v1.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('monster-customers-v2', 'assets/characters/monster-customers-v2.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('parcel-atlas-v1', 'assets/parcels/parcel-atlas-v1.png', {
      frameWidth: 512,
      frameHeight: 512,
    });
    this.load.spritesheet('xray-evidence-v1', 'assets/fx/xray-evidence-v1.png', {
      frameWidth: 627,
      frameHeight: 627,
    });
    for (let version = 2; version <= 5; version += 1) {
      this.load.spritesheet(`xray-evidence-v${version}`, `assets/fx/xray-evidence-v${version}.png`, {
        frameWidth: 627,
        frameHeight: 627,
      });
    }
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
