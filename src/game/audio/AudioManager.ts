export type SoundId = 'click' | 'scan' | 'stamp-good' | 'stamp-bad' | 'coin' | 'bell' | 'warning';

export class AudioManager {
  private context: AudioContext | null = null;
  private muted = false;
  private suspendedByAd = false;

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!muted) void this.ensureContext();
  }

  isMuted(): boolean {
    return this.muted;
  }

  async suspendForAd(): Promise<void> {
    this.suspendedByAd = true;
    if (this.context?.state === 'running') await this.context.suspend();
  }

  async resumeAfterAd(): Promise<void> {
    this.suspendedByAd = false;
    if (!this.muted && this.context?.state === 'suspended') await this.context.resume();
  }

  play(id: SoundId): void {
    if (this.muted || this.suspendedByAd) return;
    void this.ensureContext().then((context) => {
      const now = context.currentTime;
      switch (id) {
        case 'click':
          this.tone(context, now, 390, 0.045, 'sine', 0.035);
          break;
        case 'scan':
          this.tone(context, now, 260, 0.08, 'triangle', 0.04, 680);
          this.tone(context, now + 0.09, 720, 0.06, 'sine', 0.025);
          break;
        case 'stamp-good':
          this.tone(context, now, 180, 0.055, 'square', 0.04);
          this.tone(context, now + 0.075, 520, 0.12, 'triangle', 0.055, 680);
          break;
        case 'stamp-bad':
          this.tone(context, now, 170, 0.16, 'sawtooth', 0.05, 90);
          break;
        case 'coin':
          this.tone(context, now, 880, 0.07, 'sine', 0.04);
          this.tone(context, now + 0.065, 1320, 0.12, 'sine', 0.035);
          break;
        case 'bell':
          this.tone(context, now, 620, 0.35, 'sine', 0.045, 420);
          this.tone(context, now, 930, 0.24, 'sine', 0.025, 650);
          break;
        case 'warning':
          this.tone(context, now, 140, 0.12, 'square', 0.045);
          this.tone(context, now + 0.16, 140, 0.12, 'square', 0.045);
          break;
      }
    });
  }

  private async ensureContext(): Promise<AudioContext> {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended' && !this.suspendedByAd) await this.context.resume();
    return this.context;
  }

  private tone(
    context: AudioContext,
    start: number,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endFrequency = frequency,
  ): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}
