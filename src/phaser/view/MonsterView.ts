import Phaser from 'phaser';
import type { CustomerTemplate } from '../../game/simulation/types';
import { monsterFrameForCustomer } from './assetFrames';

export class MonsterView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, customer: CustomerTemplate) {
    super(scene, x, y);
    scene.add.existing(this);
    this.build(customer);
    this.setAlpha(0);
    this.setScale(0.9);
    scene.tweens.add({ targets: this, alpha: 1, scale: 1, y, duration: 430, ease: 'Back.Out' });
    scene.tweens.add({ targets: this, y: y - 7, duration: 1650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  leave(correct: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      x: correct ? this.x + 190 : this.x - 190,
      alpha: 0,
      angle: correct ? 2 : -4,
      duration: 390,
      ease: 'Quad.In',
      onComplete: () => this.destroy(),
    });
  }

  private build(customer: CustomerTemplate): void {
    const artFrame = monsterFrameForCustomer(customer.id);
    const atmosphere = this.scene.add.graphics();
    atmosphere.fillStyle(customer.accentColor, 0.08);
    atmosphere.fillEllipse(0, 16, 334, 324);
    atmosphere.fillStyle(0x070510, 0.42);
    atmosphere.fillEllipse(0, 194, 286, 30);

    const portrait = this.scene.add
      .sprite(0, 0, artFrame.texture, artFrame.frame)
      .setDisplaySize(410, 410);

    const rim = this.scene.add.graphics();
    rim.lineStyle(2, customer.accentColor, 0.22);
    rim.strokeEllipse(0, 10, 344, 334);

    this.add([atmosphere, portrait, rim]);
  }
}
