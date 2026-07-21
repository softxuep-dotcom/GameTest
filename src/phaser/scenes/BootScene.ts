import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('post-office-night', 'assets/environment/post-office-night.webp');
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
