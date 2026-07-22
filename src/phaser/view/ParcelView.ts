import Phaser from 'phaser';
import type { ParcelStyle } from '../../game/simulation/types';
import { parcelFrameForEmblem, xrayFrameForCase } from './assetFrames';

export class ParcelView extends Phaser.GameObjects.Container {
  private parcelArt!: Phaser.GameObjects.Sprite;
  private trackingTag!: Phaser.GameObjects.Container;
  private xrayLayer: Phaser.GameObjects.Container | null = null;
  private xrayMaskSource: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, style: ParcelStyle, trackingCode: string) {
    super(scene, x, y);
    scene.add.existing(this);
    this.build(style, trackingCode);
    this.setScale(0.8);
    this.setAlpha(0);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 350, ease: 'Back.Out' });
  }

  showXray(caseId: string): void {
    if (this.xrayLayer) return;

    this.parcelArt.setAlpha(0.25).setTint(0x73bfd0);
    this.trackingTag.setAlpha(0.28);

    const layer = this.scene.add.container(0, 0).setAlpha(0);
    const plate = this.scene.add.graphics();
    plate.fillStyle(0x031624, 0.92);
    plate.fillRoundedRect(-132, -82, 264, 170, 26);
    plate.fillStyle(0x20d9f0, 0.08);
    plate.fillRoundedRect(-124, -75, 248, 156, 21);
    layer.add(plate);

    const evidenceFrame = xrayFrameForCase(caseId);
    if (evidenceFrame === null) {
      layer.add(this.createGenericEvidence(caseId));
    } else {
      const evidence = this.scene.add
        .sprite(0, 2, 'xray-evidence-v1', evidenceFrame)
        .setDisplaySize(184, 184)
        .setBlendMode(Phaser.BlendModes.ADD);
      layer.add(evidence);
      this.scene.tweens.add({
        targets: evidence,
        scaleX: evidence.scaleX * 1.035,
        scaleY: evidence.scaleY * 1.035,
        alpha: 0.8,
        duration: 920,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    const scanGlow = this.scene.add.rectangle(0, -68, 248, 28, 0x4feaff, 0.13);
    const scanLine = this.scene.add.rectangle(0, -68, 248, 4, 0xb8f8ff, 0.9);
    layer.add([scanGlow, scanLine]);

    const maskSource = this.scene.make.graphics({ x: this.x, y: this.y });
    maskSource.fillStyle(0xffffff, 1);
    maskSource.fillRoundedRect(-132, -82, 264, 170, 26);
    layer.setMask(maskSource.createGeometryMask());

    const frame = this.scene.add.graphics();
    frame.lineStyle(4, 0x5cecff, 0.9);
    frame.strokeRoundedRect(-132, -82, 264, 170, 26);
    frame.lineStyle(1, 0xd4fbff, 0.65);
    frame.strokeRoundedRect(-124, -74, 248, 154, 21);
    frame.lineStyle(3, 0xffcf70, 0.75);
    frame.lineBetween(-119, -88, -82, -88);
    frame.lineBetween(82, 94, 119, 94);

    this.add([layer, frame]);
    this.xrayLayer = layer;
    this.xrayMaskSource = maskSource;

    this.scene.tweens.add({ targets: layer, alpha: 1, duration: 230, ease: 'Quad.Out' });
    this.scene.tweens.add({
      targets: [scanGlow, scanLine],
      y: 72,
      duration: 1350,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    this.scene.tweens.add({ targets: frame, alpha: 0.56, duration: 720, yoyo: true, repeat: -1 });
  }

  resolve(correct: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.xrayLayer?.clearMask(true);
    this.xrayMaskSource?.destroy();
    this.xrayMaskSource = null;
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

  destroy(fromScene?: boolean): void {
    this.xrayLayer?.clearMask(true);
    this.xrayMaskSource?.destroy();
    this.xrayMaskSource = null;
    super.destroy(fromScene);
  }

  private build(style: ParcelStyle, trackingCode: string): void {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x080510, 0.5);
    shadow.fillEllipse(0, 104, 294, 34);

    this.parcelArt = this.scene.add
      .sprite(0, 0, 'parcel-atlas-v1', parcelFrameForEmblem(style.emblem))
      .setDisplaySize(340, 340);

    const tagBack = this.scene.add.graphics();
    tagBack.fillStyle(0xf6e7bd, 0.97);
    tagBack.lineStyle(3, 0x503b43, 0.95);
    tagBack.fillRoundedRect(49, 40, 74, 40, 6);
    tagBack.strokeRoundedRect(49, 40, 74, 40, 6);
    const label = this.scene.add.text(86, 60, trackingCode.slice(-4), {
      color: '#2a2030',
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.trackingTag = this.scene.add.container(0, 0, [tagBack, label]);

    this.add([shadow, this.parcelArt, this.trackingTag]);

    if (style.damaged) {
      const damage = this.scene.add.graphics();
      damage.lineStyle(4, 0x2a1821, 0.86);
      damage.beginPath();
      damage.moveTo(-118, -42);
      damage.lineTo(-91, -18);
      damage.lineTo(-109, 4);
      damage.lineTo(-76, 30);
      damage.strokePath();
      damage.lineStyle(2, 0xffb05c, 0.42);
      damage.lineBetween(-116, -40, -93, -19);
      this.add(damage);
    }
  }

  private createGenericEvidence(caseId: string): Phaser.GameObjects.Graphics {
    const seed = [...caseId].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const mode = seed % 3;
    const evidence = this.scene.add.graphics();
    evidence.setBlendMode(Phaser.BlendModes.ADD);
    evidence.lineStyle(4, 0x96f5ff, 0.9);
    evidence.fillStyle(0x35cfe8, 0.16);

    if (mode === 0) {
      evidence.fillRoundedRect(-62, -38, 124, 76, 20);
      evidence.strokeRoundedRect(-62, -38, 124, 76, 20);
      evidence.strokeCircle(-29, 0, 17);
      evidence.strokeCircle(27, 0, 22);
    } else if (mode === 1) {
      evidence.fillEllipse(0, 5, 132, 78);
      evidence.strokeEllipse(0, 5, 132, 78);
      evidence.lineBetween(-48, -22, 42, 27);
      evidence.lineBetween(-45, 25, 48, -18);
      evidence.strokeCircle(0, 2, 18);
    } else {
      evidence.fillRoundedRect(-74, -29, 148, 58, 29);
      evidence.strokeRoundedRect(-74, -29, 148, 58, 29);
      evidence.lineBetween(-42, -29, -42, 29);
      evidence.lineBetween(39, -29, 39, 29);
      evidence.strokeCircle(0, 0, 13);
    }

    evidence.lineStyle(1, 0xd5fcff, 0.55);
    evidence.strokeCircle(-82, -49, 5);
    evidence.strokeCircle(89, 43, 7);
    return evidence;
  }
}
