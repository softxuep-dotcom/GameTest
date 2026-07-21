export interface AdHooks {
  onStart: () => void | Promise<void>;
  onEnd: () => void | Promise<void>;
}

export interface PlatformAdapter {
  readonly id: 'local' | 'poki' | 'crazygames';
  init(): Promise<void>;
  loadingFinished(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  commercialBreak(hooks: AdHooks): Promise<void>;
  rewardedBreak(hooks: AdHooks): Promise<boolean>;
}
