import Phaser from 'phaser';
import type { ParcelStyle } from '../../game/simulation/types';
import { parcelFrameForEmblem, xrayFrameForCase } from './assetFrames';

export class ParcelView extends Phaser.GameObjects.Container {
  private parcelArt!: Phaser.GameObjects.Sprite;
  private parcelFrame = 0;
  private trackingTag!: Phaser.GameObjects.Container;
  private xrayLayer: Phaser.GameObjects.Container | null = null;
  private xrayMaskedLayer: Phaser.GameObjects.Container | null = null;
  private xrayMaskSource: Phaser.GameObjects.Image | null = null;
  private xrayTweenTargets: Phaser.GameObjects.GameObject[] = [];

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

    const evidenceFrame = xrayFrameForCase(caseId);
    if (evidenceFrame === null) {
      throw new Error(`Missing authored X-ray evidence for case: ${caseId}`);
    }

    this.parcelArt.setAlpha(0.16).setTint(0x73bfd0);
    this.trackingTag.setAlpha(0.16);

    const layer = this.scene.add.container(0, 0).setAlpha(0);
    const outline = this.scene.add.container(0, 0);
    const outlineOffsets: Array<readonly [number, number]> = [
      [-4, 0], [4, 0], [0, -4], [0, 4],
      [-3, -3], [3, -3], [-3, 3], [3, 3],
    ];
    for (const [offsetX, offsetY] of outlineOffsets) {
      outline.add(
        this.scene.add
          .sprite(offsetX, offsetY, 'parcel-atlas-v1', this.parcelFrame)
          .setDisplaySize(340, 340)
          .setTintFill(0x57eaff)
          .setAlpha(0.16),
      );
    }

    const maskedLayer = this.scene.add.container(0, 0);
    const shell = this.scene.add
      .sprite(0, 0, 'parcel-atlas-v1', this.parcelFrame)
      .setDisplaySize(340, 340)
      .setTintFill(0x031621)
      .setAlpha(0.94);
    const innerGlow = this.scene.add
      .sprite(0, 0, 'parcel-atlas-v1', this.parcelFrame)
      .setDisplaySize(330, 330)
      .setTintFill(0x0b7284)
      .setAlpha(0.16);
    const evidence = this.scene.add
      .sprite(0, 0, evidenceFrame.texture, evidenceFrame.frame)
      .setDisplaySize(208, 208)
      .setAlpha(0.96);
    const scanGlow = this.scene.add.rectangle(0, -116, 310, 34, 0x4feaff, 0.14);
    const scanLine = this.scene.add.rectangle(0, -116, 310, 4, 0xc9fbff, 0.92);
    maskedLayer.add([shell, innerGlow, evidence, scanGlow, scanLine]);
    layer.add([outline, maskedLayer]);

    const maskSource = new Phaser.GameObjects.Image(
      this.scene,
      this.x,
      this.y,
      'parcel-atlas-v1',
      this.parcelFrame,
    ).setDisplaySize(340, 340);
    maskedLayer.setMask(maskSource.createBitmapMask());

    this.add(layer);
    this.xrayLayer = layer;
    this.xrayMaskedLayer = maskedLayer;
    this.xrayMaskSource = maskSource;
    this.xrayTweenTargets = [layer, evidence, scanGlow, scanLine, outline];

    this.scene.tweens.add({ targets: layer, alpha: 1, duration: 230, ease: 'Quad.Out' });
    this.scene.tweens.add({
      targets: evidence,
      scaleX: evidence.scaleX * 1.035,
      scaleY: evidence.scaleY * 1.035,
      alpha: 0.82,
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    this.scene.tweens.add({
      targets: [scanGlow, scanLine],
      y: 116,
      duration: 1350,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    this.scene.tweens.add({ targets: outline, alpha: 0.48, duration: 720, yoyo: true, repeat: -1 });
  }

  resolve(correct: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.cleanupXrayRuntime();
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
    this.cleanupXrayRuntime();
    super.destroy(fromScene);
  }

  private build(style: ParcelStyle, trackingCode: string): void {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x080510, 0.5);
    shadow.fillEllipse(0, 104, 294, 34);

    this.parcelFrame = parcelFrameForEmblem(style.emblem);
    this.parcelArt = this.scene.add
      .sprite(0, 0, 'parcel-atlas-v1', this.parcelFrame)
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

  private cleanupXrayRuntime(): void {
    if (this.xrayTweenTargets.length > 0) {
      this.scene.tweens.killTweensOf(this.xrayTweenTargets);
      this.xrayTweenTargets = [];
    }
    this.xrayMaskedLayer?.clearMask(true);
    this.xrayMaskedLayer = null;
    this.xrayMaskSource?.destroy();
    this.xrayMaskSource = null;
  }

}
