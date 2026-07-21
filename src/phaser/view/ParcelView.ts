import Phaser from 'phaser';
import type { ParcelStyle } from '../../game/simulation/types';

export class ParcelView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, style: ParcelStyle, trackingCode: string) {
    super(scene, x, y);
    scene.add.existing(this);
    this.build(style, trackingCode);
    this.setScale(0.78);
    this.setAlpha(0);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 340, ease: 'Back.Out' });
  }

  resolve(correct: boolean): void {
    this.scene.tweens.add({
      targets: this,
      x: correct ? this.x + 420 : this.x - 420,
      angle: correct ? 5 : -8,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.In',
      onComplete: () => this.destroy(),
    });
  }

  private build(style: ParcelStyle, trackingCode: string): void {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x120d1b, 0.4);
    graphics.fillEllipse(0, 74, 250, 32);
    graphics.lineStyle(5, 0x2b1831, 1);
    graphics.fillStyle(style.bodyColor, 1);

    if (style.shape === 'tube') {
      graphics.fillRoundedRect(-70, -62, 140, 132, 55);
      graphics.strokeRoundedRect(-70, -62, 140, 132, 55);
    } else if (style.shape === 'satchel') {
      graphics.fillRoundedRect(-112, -55, 224, 126, 22);
      graphics.strokeRoundedRect(-112, -55, 224, 126, 22);
      graphics.lineStyle(10, style.ribbonColor, 1);
      graphics.beginPath();
      graphics.arc(0, -44, 58, Math.PI, 0);
      graphics.strokePath();
    } else {
      const skew = style.damaged ? 12 : 0;
      graphics.beginPath();
      graphics.moveTo(-116 + skew, -66);
      graphics.lineTo(112, -66);
      graphics.lineTo(120 - skew, 72);
      graphics.lineTo(-120, 72);
      graphics.closePath();
      graphics.fillPath();
      graphics.strokePath();
    }

    graphics.fillStyle(style.ribbonColor, 1);
    graphics.fillRect(-13, -65, 26, 136);
    graphics.fillRect(-116, -10, 234, 24);
    graphics.fillStyle(0xf4e4b8, 1);
    graphics.lineStyle(3, 0x503b43, 1);
    graphics.fillRoundedRect(30, 19, 76, 42, 6);
    graphics.strokeRoundedRect(30, 19, 76, 42, 6);

    this.drawEmblem(graphics, style.emblem);
    this.add(graphics);

    const label = this.scene.add.text(68, 40, trackingCode.slice(-4), {
      color: '#2a2030', fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(label);
  }

  private drawEmblem(graphics: Phaser.GameObjects.Graphics, emblem: ParcelStyle['emblem']): void {
    graphics.fillStyle(0xf8e8b6, 0.95);
    if (emblem === 'moon') {
      graphics.fillCircle(-55, -34, 21);
      graphics.fillStyle(0x3a2b48, 1);
      graphics.fillCircle(-45, -42, 19);
    } else if (emblem === 'eye') {
      graphics.fillEllipse(-55, -34, 48, 28);
      graphics.fillStyle(0x34213e, 1);
      graphics.fillCircle(-55, -34, 9);
    } else if (emblem === 'flame') {
      graphics.fillTriangle(-55, -61, -75, -20, -35, -20);
      graphics.fillCircle(-55, -25, 20);
    } else if (emblem === 'leaf') {
      graphics.fillEllipse(-55, -34, 28, 48);
      graphics.lineStyle(3, 0x4b6546, 1);
      graphics.lineBetween(-55, -54, -55, -14);
    } else if (emblem === 'bone') {
      graphics.fillRoundedRect(-76, -41, 42, 14, 7);
      graphics.fillCircle(-76, -42, 9);
      graphics.fillCircle(-34, -27, 9);
    } else {
      const points: Phaser.Geom.Point[] = [];
      for (let index = 0; index < 10; index += 1) {
        const radius = index % 2 === 0 ? 24 : 10;
        const angle = -Math.PI / 2 + index * Math.PI / 5;
        points.push(new Phaser.Geom.Point(-55 + Math.cos(angle) * radius, -34 + Math.sin(angle) * radius));
      }
      graphics.fillPoints(points, true);
    }
  }
}
