import Phaser from 'phaser';
import type { CustomerTemplate } from '../../game/simulation/types';

export class MonsterView extends Phaser.GameObjects.Container {
  private readonly customer: CustomerTemplate;

  constructor(scene: Phaser.Scene, x: number, y: number, customer: CustomerTemplate) {
    super(scene, x, y);
    this.customer = customer;
    scene.add.existing(this);
    this.build();
    this.setAlpha(0);
    this.setScale(0.88);
    scene.tweens.add({ targets: this, alpha: 1, scale: 1, y, duration: 420, ease: 'Back.Out' });
    scene.tweens.add({ targets: this, y: y - 7, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  leave(correct: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      x: correct ? this.x + 170 : this.x - 170,
      alpha: 0,
      angle: correct ? 2 : -4,
      duration: 380,
      ease: 'Quad.In',
      onComplete: () => this.destroy(),
    });
  }

  private build(): void {
    const graphics = this.scene.add.graphics();
    const body = this.customer.bodyColor;
    const accent = this.customer.accentColor;

    graphics.fillStyle(0x0b0815, 0.34);
    graphics.fillEllipse(0, 137, 210, 34);
    graphics.fillStyle(body, 1);
    graphics.lineStyle(6, 0x21152f, 1);
    graphics.fillEllipse(0, 78, 176, 185);
    graphics.strokeEllipse(0, 78, 176, 185);
    graphics.fillCircle(0, 2, 76);
    graphics.strokeCircle(0, 2, 76);

    graphics.fillStyle(accent, 1);
    if (this.customer.feature === 'horns') {
      graphics.fillTriangle(-54, -45, -82, -108, -18, -59);
      graphics.fillTriangle(54, -45, 82, -108, 18, -59);
    } else if (this.customer.feature === 'ears') {
      graphics.fillTriangle(-60, -33, -111, -70, -71, 5);
      graphics.fillTriangle(60, -33, 111, -70, 71, 5);
    } else if (this.customer.feature === 'antennae') {
      graphics.lineStyle(8, accent, 1);
      graphics.beginPath();
      graphics.moveTo(-28, -61);
      graphics.lineTo(-55, -108);
      graphics.moveTo(28, -61);
      graphics.lineTo(55, -108);
      graphics.strokePath();
      graphics.fillCircle(-58, -112, 11);
      graphics.fillCircle(58, -112, 11);
    } else if (this.customer.feature === 'fins') {
      graphics.fillTriangle(-66, -5, -118, 28, -72, 56);
      graphics.fillTriangle(66, -5, 118, 28, 72, 56);
    }

    const eyePositions = this.customer.eyeCount === 1
      ? [[0, -7]]
      : this.customer.eyeCount === 2
        ? [[-26, -8], [26, -8]]
        : [[-35, 0], [0, -19], [35, 0]];
    for (const [eyeX, eyeY] of eyePositions) {
      graphics.fillStyle(0xfff8dc, 1);
      graphics.fillEllipse(eyeX!, eyeY!, 34, 42);
      graphics.fillStyle(this.customer.eyeColor, 1);
      graphics.fillCircle(eyeX! + 2, eyeY! + 2, 9);
      graphics.fillStyle(0xffffff, 0.8);
      graphics.fillCircle(eyeX! - 1, eyeY! - 2, 3);
    }

    graphics.lineStyle(5, 0x36213e, 1);
    graphics.beginPath();
    graphics.arc(0, 25, 24, 0.15, Math.PI - 0.15);
    graphics.strokePath();
    graphics.fillStyle(accent, 0.88);
    graphics.fillRoundedRect(-68, 86, 136, 34, 14);
    graphics.fillStyle(0xffffff, 0.16);
    graphics.fillEllipse(-30, 55, 34, 58);

    this.add(graphics);
  }
}
