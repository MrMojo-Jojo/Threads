import { SaveState, loadSave, saveSave } from './SaveData';
import { applyUpgradeEffects, UpgradeEffects } from './UpgradeSystem';
import { SILK_PER_ZONE } from '../core/Constants';

export type GameScreen = 'title' | 'playing' | 'dead' | 'upgrades';

export class RunManager {
  public save: SaveState;
  public effects: UpgradeEffects;
  public screen: GameScreen = 'title';
  public currentHeight = 0;
  public silkEarned = 0;
  public zonesReached = 0;
  public webCatchesLeft = 0;
  public lastRunTrail: { x: number; y: number }[] = [];

  constructor() {
    this.save = loadSave();
    this.effects = applyUpgradeEffects(this.save.upgrades);
  }

  startRun(): void {
    this.screen = 'playing';
    this.currentHeight = 0;
    this.silkEarned = 0;
    this.zonesReached = 0;
    this.webCatchesLeft = 1 + this.effects.extraWebCatches;
    this.effects = applyUpgradeEffects(this.save.upgrades);
  }

  onZoneCleared(zoneIndex: number): void {
    if (zoneIndex > this.zonesReached) {
      this.zonesReached = zoneIndex;
      this.silkEarned += SILK_PER_ZONE;
    }
  }

  onDeath(height: number, trail: { x: number; y: number }[]): void {
    this.currentHeight = height;
    this.save.silk += this.silkEarned;
    this.save.totalRuns++;
    if (height > this.save.bestHeight) {
      this.save.bestHeight = height;
    }
    this.lastRunTrail = trail;
    saveSave(this.save);
    this.screen = 'dead';
  }

  purchaseUpgrade(id: string, cost: number): boolean {
    if (this.save.silk >= cost) {
      this.save.silk -= cost;
      this.save.upgrades[id] = (this.save.upgrades[id] ?? 0) + 1;
      this.effects = applyUpgradeEffects(this.save.upgrades);
      saveSave(this.save);
      return true;
    }
    return false;
  }

  useWebCatch(): boolean {
    if (this.webCatchesLeft > 0) {
      this.webCatchesLeft--;
      return true;
    }
    return false;
  }

  goToUpgrades(): void {
    this.screen = 'upgrades';
  }

  goToTitle(): void {
    this.screen = 'title';
  }
}
