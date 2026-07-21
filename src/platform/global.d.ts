interface PokiSdkApi {
  init(): Promise<void>;
  gameLoadingFinished(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  commercialBreak(options?: (() => void) | { onStart?: () => void }): Promise<void>;
  rewardedBreak(options?: (() => void) | { size?: 'small' | 'medium' | 'large'; onStart?: () => void }): Promise<boolean>;
}

interface CrazyGamesSdkApi {
  init(): Promise<void>;
  game: {
    gameplayStart(): void;
    gameplayStop(): void;
  };
  ad: {
    requestAd(type: 'midgame' | 'rewarded', callbacks: {
      adStarted?: () => void;
      adFinished?: () => void;
      adError?: (error: unknown) => void;
    }): void;
  };
}

interface Window {
  PokiSDK?: PokiSdkApi;
  CrazyGames?: { SDK: CrazyGamesSdkApi };
}
