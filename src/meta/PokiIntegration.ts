// Poki SDK integration stubs
// Replace with real SDK calls when deploying to Poki

export class PokiSDK {
  private initialized = false;

  async init(): Promise<void> {
    console.log('[Poki] SDK initialized (stub)');
    this.initialized = true;
  }

  gameLoadingFinished(): void {
    if (!this.initialized) return;
    console.log('[Poki] Game loading finished');
  }

  gameplayStart(): void {
    if (!this.initialized) return;
    console.log('[Poki] Gameplay start');
  }

  gameplayStop(): void {
    if (!this.initialized) return;
    console.log('[Poki] Gameplay stop');
  }

  async commercialBreak(): Promise<void> {
    if (!this.initialized) return;
    console.log('[Poki] Commercial break (stub - no ad shown)');
  }

  async rewardedBreak(): Promise<boolean> {
    if (!this.initialized) return false;
    console.log('[Poki] Rewarded break (stub - auto-rewarding)');
    // In dev, always reward. In prod, this returns true if user watched the ad.
    return true;
  }
}
