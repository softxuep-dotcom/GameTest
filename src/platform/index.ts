import type { AdHooks, PlatformAdapter } from './types';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.append(script);
  });
}

class LocalAdapter implements PlatformAdapter {
  readonly id = 'local' as const;
  async init(): Promise<void> {}
  loadingFinished(): void {}
  gameplayStart(): void {}
  gameplayStop(): void {}
  async commercialBreak(hooks: AdHooks): Promise<void> {
    await hooks.onStart();
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    await hooks.onEnd();
  }
  async rewardedBreak(hooks: AdHooks): Promise<boolean> {
    await this.commercialBreak(hooks);
    return true;
  }
}

class PokiAdapter implements PlatformAdapter {
  readonly id = 'poki' as const;

  async init(): Promise<void> {
    try {
      await loadScript('https://game-cdn.poki.com/scripts/v2/poki-sdk.js');
      await window.PokiSDK?.init();
    } catch (error) {
      console.warn('Poki SDK unavailable; continuing without it.', error);
    }
  }

  loadingFinished(): void { window.PokiSDK?.gameLoadingFinished(); }
  gameplayStart(): void { window.PokiSDK?.gameplayStart(); }
  gameplayStop(): void { window.PokiSDK?.gameplayStop(); }

  async commercialBreak(hooks: AdHooks): Promise<void> {
    const sdk = window.PokiSDK;
    if (!sdk) return;
    await hooks.onStart();
    try { await sdk.commercialBreak(); } finally { await hooks.onEnd(); }
  }

  async rewardedBreak(hooks: AdHooks): Promise<boolean> {
    const sdk = window.PokiSDK;
    if (!sdk) return false;
    await hooks.onStart();
    try { return await sdk.rewardedBreak({ size: 'medium' }); } finally { await hooks.onEnd(); }
  }
}

class CrazyGamesAdapter implements PlatformAdapter {
  readonly id = 'crazygames' as const;

  async init(): Promise<void> {
    try {
      await loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js');
      await window.CrazyGames?.SDK.init();
    } catch (error) {
      console.warn('CrazyGames SDK unavailable; continuing without it.', error);
    }
  }

  loadingFinished(): void {}
  gameplayStart(): void { window.CrazyGames?.SDK.game.gameplayStart(); }
  gameplayStop(): void { window.CrazyGames?.SDK.game.gameplayStop(); }

  commercialBreak(hooks: AdHooks): Promise<void> {
    return this.requestAd('midgame', hooks).then(() => undefined);
  }

  rewardedBreak(hooks: AdHooks): Promise<boolean> {
    return this.requestAd('rewarded', hooks);
  }

  private requestAd(type: 'midgame' | 'rewarded', hooks: AdHooks): Promise<boolean> {
    const sdk = window.CrazyGames?.SDK;
    if (!sdk) return Promise.resolve(false);
    return new Promise((resolve) => {
      let started = false;
      const finish = async (success: boolean) => {
        if (started) await hooks.onEnd();
        resolve(success);
      };
      sdk.ad.requestAd(type, {
        adStarted: () => {
          started = true;
          void hooks.onStart();
        },
        adFinished: () => void finish(true),
        adError: () => void finish(false),
      });
    });
  }
}

export function createPlatformAdapter(): PlatformAdapter {
  const platform = import.meta.env.VITE_PLATFORM;
  if (platform === 'poki') return new PokiAdapter();
  if (platform === 'crazygames') return new CrazyGamesAdapter();
  return new LocalAdapter();
}
