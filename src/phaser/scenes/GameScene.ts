import Phaser from 'phaser';
import type { AudioManager } from '../../game/audio/AudioManager';
import type { GameSession } from '../../game/simulation/GameSession';
import type { GameSnapshot } from '../../game/simulation/types';
import { MonsterView } from '../view/MonsterView';
import { ParcelView } from '../view/ParcelView';

export class GameScene extends Phaser.Scene {
  private readonly session: GameSession;
  private readonly audio: AudioManager;
  private monster: MonsterView | null = null;
  private parcel: ParcelView | null = null;
  private activeCaseId: string | null = null;
  private resolvedCaseId: string | null = null;
  private unsubscribe?: () => void;

  constructor(session: GameSession, audio: AudioManager) {
    super('GameScene');
    this.session = session;
    this.audio = audio;
  }

  create(): void {
    this.add.image(640, 360, 'post-office-night').setDisplaySize(1280, 720);
    this.add.rectangle(640, 360, 1280, 720, 0x0a0712, 0.08);
    this.add.rectangle(640, 704, 1280, 32, 0x08050e, 0.55);
    this.unsubscribe = this.session.subscribe((snapshot) => this.sync(snapshot));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
  }

  update(_time: number, delta: number): void {
    this.session.tick(Math.min(delta, 80));
  }

  private sync(snapshot: GameSnapshot): void {
    const activeCase = snapshot.currentCase;
    if (activeCase && activeCase.id !== this.activeCaseId) {
      this.clearActors();
      this.activeCaseId = activeCase.id;
      this.resolvedCaseId = null;
      this.monster = new MonsterView(this, 640, 300, activeCase.customer);
      this.parcel = new ParcelView(this, 640, 558, activeCase.style, activeCase.trackingCode);
    }

    if (!activeCase && snapshot.phase !== 'resolving') {
      this.clearActors();
      this.activeCaseId = null;
    }

    if (snapshot.phase === 'resolving' && snapshot.lastResult && this.resolvedCaseId !== this.activeCaseId) {
      this.resolvedCaseId = this.activeCaseId;
      const correct = snapshot.lastResult.correct;
      this.audio.play(correct ? 'stamp-good' : 'stamp-bad');
      this.monster?.leave(correct);
      this.parcel?.resolve(correct);
      this.flashResult(correct);
    }
  }

  private flashResult(correct: boolean): void {
    const color = correct ? 0x67e8a2 : 0xff5b72;
    const flash = this.add.rectangle(640, 360, 1280, 720, color, 0.18).setDepth(50);
    this.tweens.add({ targets: flash, alpha: 0, duration: 420, onComplete: () => flash.destroy() });
    if (!correct) this.cameras.main.shake(260, 0.009);
    else {
      for (let index = 0; index < 8; index += 1) {
        const spark = this.add.circle(640, 525, 3 + Math.random() * 4, 0xffd56b, 0.95).setDepth(51);
        this.tweens.add({
          targets: spark,
          x: 640 + (Math.random() - 0.5) * 360,
          y: 450 - Math.random() * 180,
          alpha: 0,
          scale: 0.2,
          duration: 550 + Math.random() * 260,
          ease: 'Quad.Out',
          onComplete: () => spark.destroy(),
        });
      }
    }
  }

  private clearActors(): void {
    this.monster?.destroy();
    this.parcel?.destroy();
    this.monster = null;
    this.parcel = null;
  }
}
