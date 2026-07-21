import type { AudioManager } from '../game/audio/AudioManager';
import type { GameSession } from '../game/simulation/GameSession';
import type { GamePhase, GameSnapshot, ToolId, UpgradeId, Verdict } from '../game/simulation/types';
import type { PlatformAdapter } from '../platform/types';
import type { SaveData, SaveStore } from '../storage/SaveStore';

const TOOL_LABELS: Record<ToolId, { icon: string; name: string; key: string }> = {
  xray: { icon: '▧', name: 'X-RAY', key: '1' },
  resonance: { icon: '◉', name: 'LISTEN', key: '2' },
  aura: { icon: '◌', name: 'AURA', key: '3' },
};

const VERDICT_LABELS: Record<Verdict, { icon: string; name: string; key: string }> = {
  accept: { icon: '✓', name: 'ACCEPT', key: 'A' },
  return: { icon: '↩', name: 'RETURN', key: 'R' },
  quarantine: { icon: '!', name: 'QUARANTINE', key: 'Q' },
};

export class GameUI {
  private readonly root: HTMLElement;
  private readonly session: GameSession;
  private readonly audio: AudioManager;
  private readonly platform: PlatformAdapter;
  private readonly saveStore: SaveStore;
  private save: SaveData;
  private snapshot: GameSnapshot;
  private previousPhase: GamePhase = 'menu';
  private busy = false;
  private rewardUsed = false;
  private resultRecorded = false;
  private lastSavedScore = -1;

  constructor(
    root: HTMLElement,
    session: GameSession,
    audio: AudioManager,
    platform: PlatformAdapter,
    saveStore: SaveStore,
  ) {
    this.root = root;
    this.session = session;
    this.audio = audio;
    this.platform = platform;
    this.saveStore = saveStore;
    this.save = saveStore.load();
    this.snapshot = session.snapshot();
    this.audio.setMuted(this.save.muted);
    this.mount();
    this.bind();
    this.session.subscribe((snapshot) => this.render(snapshot));
  }

  private mount(): void {
    this.root.innerHTML = `
      <div class="vignette" aria-hidden="true"></div>
      <header class="hud" aria-label="Shift status">
        <div class="hud-block shift-chip"><span class="eyebrow">NIGHT</span><strong id="hud-night">1</strong></div>
        <div class="hud-block timer-chip" id="timer-chip"><span class="timer-icon">◷</span><strong id="hud-time">01:20</strong></div>
        <div class="hud-block score-chip"><span class="eyebrow">SCORE</span><strong id="hud-score">0</strong></div>
        <div class="hud-block combo-chip"><span class="eyebrow">STREAK</span><strong id="hud-combo">×0</strong></div>
        <div class="hud-block hearts-chip" id="hud-hearts" aria-label="Mistakes remaining"></div>
        <button class="icon-button sound-button" id="sound-button" aria-label="Toggle sound">♪</button>
      </header>

      <aside class="rules-board play-panel" id="rules-board">
        <div class="pin"></div>
        <p class="eyebrow">TONIGHT'S DIRECTIVE</p>
        <h2 id="rules-title">First Bell</h2>
        <ol id="rules-list"></ol>
        <div class="quota-line"><span>QUOTA</span><strong id="quota-value">0 / 6</strong></div>
      </aside>

      <section class="customer-card play-panel" id="customer-card">
        <p class="eyebrow" id="customer-species">MOON MOTH</p>
        <h2 id="customer-name">Mira</h2>
        <p id="customer-greeting">Handle it gently.</p>
      </section>

      <section class="docket play-panel" id="docket">
        <div class="docket-top"><span>PARCEL DOCKET</span><strong id="tracking-code">MM-01-0000</strong></div>
        <h2 id="parcel-name">Moonpetal Tea</h2>
        <ul id="visible-hints"></ul>
        <div class="scan-results" id="scan-results"></div>
      </section>

      <section class="tool-rack play-panel" aria-label="Inspection tools">
        <p class="eyebrow">INSPECTION</p>
        <div class="tool-buttons" id="tool-buttons">
          ${Object.entries(TOOL_LABELS).map(([id, item]) => `
            <button class="tool-button" data-tool="${id}">
              <span class="keycap">${item.key}</span><span class="tool-icon">${item.icon}</span><span>${item.name}</span>
            </button>`).join('')}
        </div>
      </section>

      <section class="stamp-rack play-panel" aria-label="Decision stamps">
        <p class="eyebrow">FINAL STAMP</p>
        <div class="stamp-buttons" id="stamp-buttons">
          ${Object.entries(VERDICT_LABELS).map(([id, item]) => `
            <button class="stamp-button ${id}" data-verdict="${id}">
              <span class="keycap">${item.key}</span><span class="stamp-icon">${item.icon}</span><span>${item.name}</span>
            </button>`).join('')}
        </div>
      </section>

      <div class="result-toast" id="result-toast" role="status" aria-live="polite">
        <strong id="result-title"></strong><span id="result-copy"></span>
      </div>

      <div class="modal-layer" id="modal-layer">
        <section class="modal-card" id="modal-card" role="dialog" aria-modal="true"></section>
      </div>

      <div class="rotate-notice"><span>↻</span><strong>Rotate for the night shift</strong></div>
    `;
  }

  private bind(): void {
    this.root.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!target || target.disabled) return;
      this.audio.play('click');
      const tool = target.dataset.tool as ToolId | undefined;
      const verdict = target.dataset.verdict as Verdict | undefined;
      const upgrade = target.dataset.upgrade as UpgradeId | undefined;
      if (tool) {
        if (this.session.inspect(tool)) this.audio.play('scan');
      } else if (verdict) {
        this.session.decide(verdict);
      } else if (upgrade) {
        void this.selectUpgrade(upgrade);
      } else if (target.id === 'start-button') {
        this.rewardUsed = false;
        this.resultRecorded = false;
        this.lastSavedScore = -1;
        this.session.startRun();
      } else if (target.id === 'begin-shift-button') {
        this.session.startShift();
        this.platform.gameplayStart();
        this.audio.play('bell');
      } else if (target.id === 'retry-button') {
        this.rewardUsed = false;
        this.resultRecorded = false;
        this.lastSavedScore = -1;
        this.session.startRun();
      } else if (target.id === 'menu-button') {
        this.session.returnToMenu();
      } else if (target.id === 'revive-button') {
        void this.tryRevive();
      } else if (target.id === 'sound-button') {
        this.save = this.saveStore.setMuted(!this.audio.isMuted());
        this.audio.setMuted(this.save.muted);
        this.updateSoundButton();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.repeat || this.snapshot.phase !== 'playing') return;
      const key = event.key.toLowerCase();
      const toolByKey: Partial<Record<string, ToolId>> = { '1': 'xray', '2': 'resonance', '3': 'aura' };
      const verdictByKey: Partial<Record<string, Verdict>> = { a: 'accept', r: 'return', q: 'quarantine' };
      const tool = toolByKey[key];
      const verdict = verdictByKey[key];
      if (tool) {
        if (this.session.inspect(tool)) this.audio.play('scan');
      } else if (verdict) {
        this.session.decide(verdict);
      }
    });
  }

  private render(snapshot: GameSnapshot): void {
    this.snapshot = snapshot;
    this.root.dataset.phase = snapshot.phase;
    this.setText('hud-night', String(snapshot.shift.id));
    this.setText('hud-time', this.formatTime(snapshot.timeRemainingMs));
    this.setText('hud-score', snapshot.score.toLocaleString('en-US'));
    this.setText('hud-combo', `×${snapshot.combo}`);
    this.setText('rules-title', snapshot.shift.title);
    this.setText('quota-value', `${snapshot.processed} / ${snapshot.shift.quota}`);
    this.renderHearts(snapshot);
    this.renderRules(snapshot);
    this.renderCase(snapshot);
    this.renderActions(snapshot);
    this.renderResult(snapshot);
    this.renderModal(snapshot);
    this.updateSoundButton();

    const timer = this.root.querySelector('#timer-chip');
    timer?.classList.toggle('danger', snapshot.timeRemainingMs <= 10_000 && snapshot.phase === 'playing');

    if (this.previousPhase === 'playing' && snapshot.phase !== 'playing' && snapshot.phase !== 'resolving') {
      this.platform.gameplayStop();
    }
    if (
      (snapshot.phase === 'game-over' || snapshot.phase === 'victory')
      && (!this.resultRecorded || this.lastSavedScore !== snapshot.score)
    ) {
      this.save = this.saveStore.updateResult(snapshot.score, snapshot.shift.id, !this.resultRecorded);
      this.resultRecorded = true;
      this.lastSavedScore = snapshot.score;
    }
    this.previousPhase = snapshot.phase;
  }

  private renderHearts(snapshot: GameSnapshot): void {
    const hearts = this.root.querySelector('#hud-hearts');
    if (!hearts) return;
    hearts.innerHTML = Array.from({ length: snapshot.maxHearts }, (_, index) =>
      `<span class="heart ${index < snapshot.hearts ? 'full' : 'empty'}">♥</span>`).join('');
  }

  private renderRules(snapshot: GameSnapshot): void {
    const list = this.root.querySelector('#rules-list');
    if (list) list.innerHTML = snapshot.shift.rules.map((rule) => `<li>${rule}</li>`).join('');
  }

  private renderCase(snapshot: GameSnapshot): void {
    const activeCase = snapshot.currentCase;
    if (!activeCase) return;
    this.setText('customer-species', activeCase.customer.species.toUpperCase());
    this.setText('customer-name', activeCase.customer.name);
    this.setText('customer-greeting', `“${activeCase.customer.greeting}”`);
    this.setText('tracking-code', activeCase.trackingCode);
    this.setText('parcel-name', activeCase.parcelName);
    const hints = this.root.querySelector('#visible-hints');
    if (hints) hints.innerHTML = activeCase.visibleHints.map((hint) => `<li><span>◆</span>${hint}</li>`).join('');
    const results = this.root.querySelector('#scan-results');
    if (results) {
      results.innerHTML = Object.entries(snapshot.revealedClues).map(([tool, clue]) => `
        <div class="scan-line"><strong>${TOOL_LABELS[tool as ToolId].name}</strong><span>${clue}</span></div>`).join('');
    }
  }

  private renderActions(snapshot: GameSnapshot): void {
    this.root.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
      const tool = button.dataset.tool as ToolId;
      button.disabled = snapshot.phase !== 'playing' || snapshot.usedTools.includes(tool);
      button.classList.toggle('used', snapshot.usedTools.includes(tool));
    });
    this.root.querySelectorAll<HTMLButtonElement>('[data-verdict]').forEach((button) => {
      button.disabled = snapshot.phase !== 'playing';
    });
  }

  private renderResult(snapshot: GameSnapshot): void {
    const toast = this.root.querySelector('#result-toast');
    const result = snapshot.lastResult;
    const visible = snapshot.phase === 'resolving' && result;
    toast?.classList.toggle('visible', Boolean(visible));
    toast?.toggleAttribute('hidden', !visible);
    toast?.setAttribute('aria-hidden', String(!visible));
    toast?.classList.toggle('correct', Boolean(visible && result.correct));
    toast?.classList.toggle('wrong', Boolean(visible && !result.correct));
    if (!visible || !result) return;
    this.setText('result-title', result.correct ? `CLEARED  +${result.points}` : `INCORRECT — ${result.expected.toUpperCase()}`);
    this.setText('result-copy', `${result.explanation} ${result.incident}`);
  }

  private renderModal(snapshot: GameSnapshot): void {
    const layer = this.root.querySelector('#modal-layer');
    const card = this.root.querySelector('#modal-card');
    if (!layer || !card) return;
    const visible = ['menu', 'briefing', 'shift-complete', 'game-over', 'victory'].includes(snapshot.phase);
    layer.classList.toggle('visible', visible);
    layer.toggleAttribute('hidden', !visible);
    layer.setAttribute('aria-hidden', String(!visible));
    if (!visible) return;

    if (snapshot.phase === 'menu') {
      card.innerHTML = `
        <div class="title-mark">M</div>
        <p class="eyebrow">NOCTURNAL POSTAL SERVICE</p>
        <h1>MONSTER MAIL</h1><h2 class="night-title">NIGHT SHIFT</h2>
        <p class="modal-lead">Inspect suspicious parcels. Stamp the truth. Keep the city sleeping.</p>
        <div class="record-row"><span>BEST SCORE <strong>${this.save.bestScore.toLocaleString('en-US')}</strong></span><span>BEST NIGHT <strong>${this.save.bestNight}</strong></span></div>
        <button class="primary-button" id="start-button">CLOCK IN <span>→</span></button>
        <p class="microcopy">Mouse / touch · Keyboard shortcuts supported</p>`;
    } else if (snapshot.phase === 'briefing') {
      card.innerHTML = `
        <p class="eyebrow">NIGHT ${snapshot.shift.id} OF 5</p>
        <h1>${snapshot.shift.title}</h1>
        <p class="modal-lead">${snapshot.shift.subtitle}</p>
        <div class="brief-grid"><span><strong>${snapshot.shift.quota}</strong> parcels</span><span><strong>${snapshot.shift.timeSeconds}</strong> seconds</span><span><strong>${snapshot.hearts}</strong> mistakes left</span></div>
        <div class="brief-rules">${snapshot.shift.rules.map((rule) => `<p><span>◆</span>${rule}</p>`).join('')}</div>
        <button class="primary-button" id="begin-shift-button">RING THE BELL <span>↗</span></button>`;
    } else if (snapshot.phase === 'shift-complete') {
      card.innerHTML = `
        <p class="eyebrow">SHIFT CLEARED</p>
        <h1>${snapshot.correct} / ${snapshot.shift.quota} CORRECT</h1>
        <p class="modal-lead">Choose one union benefit before the next bell.</p>
        <div class="upgrade-grid">${snapshot.upgrades.map((upgrade) => `
          <button class="upgrade-card" data-upgrade="${upgrade.id}" ${this.busy ? 'disabled' : ''}>
            <span class="upgrade-icon">${upgrade.icon}</span><strong>${upgrade.title}</strong><small>${upgrade.description}</small>
          </button>`).join('')}</div>
        <div class="summary-line"><span>SCORE <strong>${snapshot.score.toLocaleString('en-US')}</strong></span><span>COINS <strong>${snapshot.coins}</strong></span><span>BEST STREAK <strong>×${snapshot.bestCombo}</strong></span></div>`;
    } else if (snapshot.phase === 'game-over') {
      card.innerHTML = `
        <p class="eyebrow">SHIFT TERMINATED</p>
        <h1>THE MAIL WON.</h1>
        <p class="modal-lead">Night ${snapshot.shift.id} · Score ${snapshot.score.toLocaleString('en-US')}</p>
        <div class="modal-actions">
          ${this.rewardUsed ? '' : '<button class="secondary-button reward" id="revive-button">▶ REVIVE WITH AD</button>'}
          <button class="primary-button" id="retry-button">START NEW RUN</button>
          <button class="text-button" id="menu-button">Main menu</button>
        </div>`;
    } else {
      card.innerHTML = `
        <p class="eyebrow">DAWN DELIVERY COMPLETE</p>
        <h1>CITY SECURED.</h1>
        <p class="modal-lead">You survived all five bells with a score of ${snapshot.score.toLocaleString('en-US')}.</p>
        <div class="victory-seal">★<span>MASTER<br>INSPECTOR</span>★</div>
        <div class="modal-actions"><button class="primary-button" id="retry-button">WORK ANOTHER NIGHT</button><button class="text-button" id="menu-button">Main menu</button></div>`;
    }
  }

  private async selectUpgrade(upgradeId: UpgradeId): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.renderModal(this.snapshot);
    if (this.snapshot.shiftIndex >= 2) {
      await this.platform.commercialBreak({
        onStart: () => this.audio.suspendForAd(),
        onEnd: () => this.audio.resumeAfterAd(),
      });
    }
    this.busy = false;
    this.session.chooseUpgrade(upgradeId);
  }

  private async tryRevive(): Promise<void> {
    if (this.busy || this.rewardUsed) return;
    this.busy = true;
    const granted = await this.platform.rewardedBreak({
      onStart: () => this.audio.suspendForAd(),
      onEnd: () => this.audio.resumeAfterAd(),
    });
    this.busy = false;
    if (granted) {
      this.rewardUsed = true;
      this.session.revive();
      this.platform.gameplayStart();
    } else {
      this.renderModal(this.snapshot);
    }
  }

  private updateSoundButton(): void {
    const button = this.root.querySelector('#sound-button');
    if (button) {
      button.textContent = this.audio.isMuted() ? '×' : '♪';
      button.setAttribute('aria-label', this.audio.isMuted() ? 'Enable sound' : 'Mute sound');
    }
  }

  private setText(id: string, value: string): void {
    const element = this.root.querySelector(`#${id}`);
    if (element && element.textContent !== value) element.textContent = value;
  }

  private formatTime(milliseconds: number): string {
    const total = Math.max(0, Math.ceil(milliseconds / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
