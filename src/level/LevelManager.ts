import { Zone } from './Zone';
import { ZoneGenerator } from './ZoneGenerator';
import { Anchor } from '../entities/Anchor';
import { AnchorPoint } from '../physics/WebShooter';
import { AABB } from '../physics/Collision';

export class LevelManager {
  private generator: ZoneGenerator;
  private zones: Zone[] = [];
  private highestZoneGenerated = -1;
  public currentZoneIndex = 0;

  // Flat lists for physics
  public allAnchors: AnchorPoint[] = [];
  public allWalls: AABB[] = [];

  // Track zone entries for silk rewards
  public zonesCleared: Set<number> = new Set();

  constructor(seed?: number) {
    this.generator = new ZoneGenerator(seed);
  }

  reset(seed?: number): void {
    this.generator = new ZoneGenerator(seed ?? Date.now());
    this.zones = [];
    this.highestZoneGenerated = -1;
    this.currentZoneIndex = 0;
    this.allAnchors = [];
    this.allWalls = [];
    this.zonesCleared = new Set();
    this.ensureZonesAround(0);
  }

  ensureZonesAround(playerY: number): void {
    // Determine which zone the player is in
    const zoneIndex = this.getZoneIndexAtY(playerY);
    this.currentZoneIndex = zoneIndex;

    // Generate zones ahead (2 above current)
    const targetZone = zoneIndex + 2;
    while (this.highestZoneGenerated < targetZone) {
      this.highestZoneGenerated++;
      const zone = this.generator.generate(this.highestZoneGenerated);
      this.zones.push(zone);
      this.rebuildFlatLists();
    }
  }

  getZoneIndexAtY(y: number): number {
    for (const zone of this.zones) {
      if (y >= zone.topY && y < zone.bottomY) {
        return zone.index;
      }
    }
    return 0;
  }

  getCurrentZone(): Zone | null {
    return this.zones.find(z => z.index === this.currentZoneIndex) ?? null;
  }

  getZone(index: number): Zone | null {
    return this.zones.find(z => z.index === index) ?? null;
  }

  getActiveZones(): Zone[] {
    return this.zones;
  }

  markZoneCleared(index: number): boolean {
    if (this.zonesCleared.has(index)) return false;
    this.zonesCleared.add(index);
    return true;
  }

  private rebuildFlatLists(): void {
    this.allAnchors = [];
    this.allWalls = [];
    for (const zone of this.zones) {
      for (const anchor of zone.anchors) {
        this.allAnchors.push(anchor);
      }
      for (const wall of zone.walls) {
        this.allWalls.push(wall);
      }
    }
  }

  updateAnchors(dt: number): void {
    for (const zone of this.zones) {
      for (const anchor of zone.anchors) {
        if (anchor instanceof Anchor) {
          anchor.update(dt);
        }
      }
    }
  }

  getEnemySpawns(): Zone[] {
    return this.zones;
  }
}
