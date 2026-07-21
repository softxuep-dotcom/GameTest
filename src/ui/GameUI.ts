import type { AudioManager } from '../game/audio/AudioManager';
import type { GameSession } from '../game/simulation/GameSession';
import type { GamePhase, GameSnapshot, ToolId, UpgradeId, Verdict } from '../game/simulation/types';
import {
  caseTranslation,
  customerTranslation,
  message,
  oppositeLocale,
  shiftTranslation,
  toolName,
  upgradeTranslation,
  verdictName,
  type SupportedLocale,
  type UiMessageKey,
} from '../i18n/i18n';
import type { PlatformAdapter } from '../platform/types';
import type { SaveData, SaveStore } from '../storage/SaveStore';

const TOOL_META: Record<ToolId, { icon: string; key: string }> = {
  xray: { icon: '▧', key: '1' },
  resonance: { icon: '◉', key: '2' },
  aura: { icon: '◌', key: '3' },
};

const VERDICT_META: Record<Verdict, { icon: string; key: string }> = {
  accept: { icon: '✓', key: 'A' },
  return: { icon: '↩', key: 'R' },
  quarantine: { icon: '!', key: 'Q' },
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
  private locale: SupportedLocale;

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
    this.locale = this.save.language;
    this.snapshot = session.snapshot();
    this.audio.setMuted(this.save.muted);
    this.applyDocumentLanguage();
    this.mount();
    this.bind();
    this.session.subscribe((snapshot) => this.render(snapshot));
  }

  private mount(): void {
    this.root.dataset.locale = this.locale;
    this.root.innerHTML = `
      <div class="vignette" aria-hidden="true"></div>
      <header class="hud" aria-label="${this.m('shiftStatus')}">
        <div class="hud-block shift-chip"><span class="eyebrow">${this.m('night')}</span><strong id="hud-night">1</strong></div>
        <div class="hud-block timer-chip" id="timer-chip"><span class="timer-icon">◷</span><strong id="hud-time">01:20</strong></div>
        <div class="hud-block score-chip"><span class="eyebrow">${this.m('score')}</span><strong id="hud-score">0</strong></div>
        <div class="hud-block combo-chip"><span class="eyebrow">${this.m('streak')}</span><strong id="hud-combo">×0</strong></div>
        <div class="hud-block hearts-chip" id="hud-hearts" aria-label="${this.m('mistakesRemaining')}"></div>
        <button class="icon-button language-button" id="language-button" aria-label="${this.m('language')}">${this.m('languageSwitch')}</button>
        <button class="icon-button sound-button" id="sound-button" aria-label="${this.m('toggleSound')}">♪</button>
      </header>

      <aside class="rules-board play-panel" id="rules-board">
        <div class="pin"></div>
        <p class="eyebrow">${this.m('tonightDirective')}</p>
        <h2 id="rules-title"></h2>
        <ol id="rules-list"></ol>
        <div class="quota-line"><span>${this.m('quota')}</span><strong id="quota-value">0 / 6</strong></div>
      </aside>

      <section class="customer-card play-panel" id="customer-card">
        <p class="eyebrow" id="customer-species"></p>
        <h2 id="customer-name">Mira</h2>
        <p id="customer-greeting"></p>
      </section>

      <section class="docket play-panel" id="docket">
        <div class="docket-top"><span>${this.m('parcelDocket')}</span><strong id="tracking-code">MM-01-0000</strong></div>
        <h2 id="parcel-name"></h2>
        <ul id="visible-hints"></ul>
        <div class="scan-results" id="scan-results"></div>
      </section>

      <section class="tool-rack play-panel" aria-label="${this.m('inspection')}">
        <p class="eyebrow">${this.m('inspection')}</p>
        <div class="tool-buttons" id="tool-buttons">
          ${Object.entries(TOOL_META).map(([id, item]) => `
            <button class="tool-button" data-tool="${id}" data-used-label="${this.m('scanned')}">
              <span class="keycap">${item.key}</span><span class="tool-icon">${item.icon}</span><span>${toolName(this.locale, id as ToolId)}</span>
            </button>`).join('')}
        </div>
      </section>

      <section class="stamp-rack play-panel" aria-label="${this.m('finalStamp')}">
        <p class="eyebrow">${this.m('finalStamp')}</p>
        <div class="stamp-buttons" id="stamp-buttons">
          ${Object.entries(VERDICT_META).map(([id, item]) => `
            <button class="stamp-button ${id}" data-verdict="${id}">
              <span class="keycap">${item.key}</span><span class="stamp-icon">${item.icon}</span><span>${verdictName(this.locale, id as Verdict)}</span>
            </button>`).join('')}
        </div>
      </section>

      <div class="result-toast" id="result-toast" role="status" aria-live="polite">
        <strong id="result-title"></strong><span id="result-copy"></span>
      </div>

      <div class="modal-layer" id="modal-layer">
        <section class="modal-card" id="modal-card" role="dialog" aria-modal="true"></section>
      </div>
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
      } else if (target.id === 'language-button' || target.id === 'modal-language-button') {
        this.locale = oppositeLocale(this.locale);
        this.save = this.saveStore.setLanguage(this.locale);
        this.applyDocumentLanguage();
        this.mount();
        this.render(this.snapshot);
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
    this.root.dataset.locale = this.locale;
    const localizedShift = shiftTranslation(this.locale, snapshot.shift.id);
    this.setText('hud-night', String(snapshot.shift.id));
    this.setText('hud-time', this.formatTime(snapshot.timeRemainingMs));
    this.setText('hud-score', snapshot.score.toLocaleString(this.locale));
    this.setText('hud-combo', `×${snapshot.combo}`);
    this.setText('rules-title', localizedShift?.title ?? snapshot.shift.title);
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
    const rules = shiftTranslation(this.locale, snapshot.shift.id)?.rules ?? snapshot.shift.rules;
    if (list) list.innerHTML = rules.map((rule) => `<li>${rule}</li>`).join('');
  }

  private renderCase(snapshot: GameSnapshot): void {
    const activeCase = snapshot.currentCase;
    if (!activeCase) return;
    const localizedCase = caseTranslation(this.locale, activeCase.id);
    const localizedCustomer = customerTranslation(this.locale, activeCase.customer.id);
    this.setText('customer-species', (localizedCustomer?.species ?? activeCase.customer.species).toUpperCase());
    this.setText('customer-name', activeCase.customer.name);
    this.setText('customer-greeting', `“${localizedCustomer?.greeting ?? activeCase.customer.greeting}”`);
    this.setText('tracking-code', activeCase.trackingCode);
    this.setText('parcel-name', localizedCase?.parcelName ?? activeCase.parcelName);
    const hints = this.root.querySelector('#visible-hints');
    const visibleHints = localizedCase?.visibleHints ?? activeCase.visibleHints;
    if (hints) hints.innerHTML = visibleHints.map((hint) => `<li><span>◆</span>${hint}</li>`).join('');
    const results = this.root.querySelector('#scan-results');
    if (results) {
      results.innerHTML = Object.entries(snapshot.revealedClues).map(([tool, clue]) => `
        <div class="scan-line"><strong>${toolName(this.locale, tool as ToolId)}</strong><span>${localizedCase?.clues[tool as ToolId] ?? clue}</span></div>`).join('');
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
    const localizedCase = snapshot.currentCase ? caseTranslation(this.locale, snapshot.currentCase.id) : undefined;
    this.setText(
      'result-title',
      result.correct
        ? `${this.m('cleared')}  +${result.points}`
        : `${this.m('incorrect')} — ${verdictName(this.locale, result.expected)}`,
    );
    this.setText('result-copy', `${localizedCase?.explanation ?? result.explanation} ${localizedCase?.incident ?? result.incident}`);
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

    const localizedShift = shiftTranslation(this.locale, snapshot.shift.id);
    const shiftTitle = localizedShift?.title ?? snapshot.shift.title;
    const shiftSubtitle = localizedShift?.subtitle ?? snapshot.shift.subtitle;
    const shiftRules = localizedShift?.rules ?? snapshot.shift.rules;
    const formattedScore = snapshot.score.toLocaleString(this.locale);
    const languageControl = `<button class="modal-language-button" id="modal-language-button" aria-label="${this.m('language')}">${this.m('languageSwitch')}</button>`;

    if (snapshot.phase === 'menu') {
      card.innerHTML = `
        ${languageControl}
        <div class="title-mark">${this.locale === 'zh-CN' ? '邮' : 'M'}</div>
        <p class="eyebrow">${this.m('service')}</p>
        <h1>${this.m('brand')}</h1><h2 class="night-title">${this.m('nightShift')}</h2>
        <p class="modal-lead">${this.m('menuLead')}</p>
        <div class="record-row"><span>${this.m('bestScore')} <strong>${this.save.bestScore.toLocaleString(this.locale)}</strong></span><span>${this.m('bestNight')} <strong>${this.save.bestNight}</strong></span></div>
        <button class="primary-button" id="start-button">${this.m('clockIn')} <span>→</span></button>
        <p class="microcopy">${this.m('controls')}</p>`;
    } else if (snapshot.phase === 'briefing') {
      card.innerHTML = `
        ${languageControl}
        <p class="eyebrow">${this.m('nightOf', { night: snapshot.shift.id, total: 5 })}</p>
        <h1>${shiftTitle}</h1>
        <p class="modal-lead">${shiftSubtitle}</p>
        <div class="brief-grid"><span><strong>${snapshot.shift.quota}</strong>${this.m('parcels')}</span><span><strong>${snapshot.shift.timeSeconds}</strong>${this.m('seconds')}</span><span><strong>${snapshot.hearts}</strong>${this.m('mistakesLeft')}</span></div>
        <div class="brief-rules">${shiftRules.map((rule) => `<p><span>◆</span>${rule}</p>`).join('')}</div>
        <button class="primary-button" id="begin-shift-button">${this.m('ringBell')} <span>↗</span></button>`;
    } else if (snapshot.phase === 'shift-complete') {
      card.innerHTML = `
        ${languageControl}
        <p class="eyebrow">${this.m('shiftCleared')}</p>
        <h1>${this.m('correctCount', { correct: snapshot.correct, total: snapshot.shift.quota })}</h1>
        <p class="modal-lead">${this.m('chooseBenefit')}</p>
        <div class="upgrade-grid">${snapshot.upgrades.map((upgrade) => `
          <button class="upgrade-card" data-upgrade="${upgrade.id}" ${this.busy ? 'disabled' : ''}>
            <span class="upgrade-icon">${upgrade.icon}</span><strong>${upgradeTranslation(this.locale, upgrade.id)?.title ?? upgrade.title}</strong><small>${upgradeTranslation(this.locale, upgrade.id)?.description ?? upgrade.description}</small>
          </button>`).join('')}</div>
        <div class="summary-line"><span>${this.m('score')} <strong>${formattedScore}</strong></span><span>${this.m('coins')} <strong>${snapshot.coins}</strong></span><span>${this.m('bestStreak')} <strong>×${snapshot.bestCombo}</strong></span></div>`;
    } else if (snapshot.phase === 'game-over') {
      card.innerHTML = `
        ${languageControl}
        <p class="eyebrow">${this.m('shiftTerminated')}</p>
        <h1>${this.m('mailWon')}</h1>
        <p class="modal-lead">${this.m('nightScore', { night: snapshot.shift.id, score: formattedScore })}</p>
        <div class="modal-actions">
          ${this.rewardUsed ? '' : `<button class="secondary-button reward" id="revive-button">${this.m('reviveWithAd')}</button>`}
          <button class="primary-button" id="retry-button">${this.m('startNewRun')}</button>
          <button class="text-button" id="menu-button">${this.m('mainMenu')}</button>
        </div>`;
    } else {
      card.innerHTML = `
        ${languageControl}
        <p class="eyebrow">${this.m('dawnComplete')}</p>
        <h1>${this.m('citySecured')}</h1>
        <p class="modal-lead">${this.m('victoryLead', { score: formattedScore })}</p>
        <div class="victory-seal">★<span>${this.m('masterInspector').replace('\n', '<br>')}</span>★</div>
        <div class="modal-actions"><button class="primary-button" id="retry-button">${this.m('workAnotherNight')}</button><button class="text-button" id="menu-button">${this.m('mainMenu')}</button></div>`;
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
      button.setAttribute('aria-label', this.audio.isMuted() ? this.m('enableSound') : this.m('muteSound'));
    }
  }

  private m(key: UiMessageKey, variables: Record<string, string | number> = {}): string {
    return message(this.locale, key, variables);
  }

  private applyDocumentLanguage(): void {
    document.documentElement.lang = this.locale;
    document.title = this.locale === 'zh-CN' ? '怪物邮件：夜班' : 'Monster Mail: Night Shift';
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
