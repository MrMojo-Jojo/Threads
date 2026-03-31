import { Zone } from './Zone';
import { Anchor } from '../entities/Anchor';
import { Wall } from './Wall';
import { SHAFT_WIDTH, ZONE_HEIGHT } from '../core/Constants';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export class ZoneGenerator {
  private rand: () => number;

  constructor(seed: number = Date.now()) {
    this.rand = seededRandom(seed);
  }

  generate(index: number): Zone {
    const topY = -(index + 1) * ZONE_HEIGHT;
    const bottomY = -index * ZONE_HEIGHT;
    const zone = new Zone(index, topY, bottomY);

    // Difficulty scaling
    const difficulty = Math.min(1, index / 10);

    // Generate walls (shaft boundaries + internal obstacles)
    this.generateWalls(zone, difficulty);

    // Generate anchors
    this.generateAnchors(zone, difficulty);

    // Generate enemies (none in zone 0)
    if (index > 0) {
      this.generateEnemies(zone, difficulty);
    }

    return zone;
  }

  private generateWalls(zone: Zone, difficulty: number): void {
    const wallThickness = 30;

    // Shaft walls
    for (let y = zone.topY; y < zone.bottomY; y += 200) {
      zone.walls.push(new Wall(-wallThickness, y, wallThickness, 200));
      zone.walls.push(new Wall(SHAFT_WIDTH, y, wallThickness, 200));
    }

    // Internal obstacles (more as difficulty increases)
    const obstacleCount = Math.floor(difficulty * 6);
    for (let i = 0; i < obstacleCount; i++) {
      const w = 30 + this.rand() * 60;
      const h = 15 + this.rand() * 30;
      const x = 30 + this.rand() * (SHAFT_WIDTH - 60 - w);
      const y = zone.topY + (zone.bottomY - zone.topY) * this.rand();
      zone.walls.push(new Wall(x, y, w, h));
    }
  }

  private generateAnchors(zone: Zone, difficulty: number): void {
    const spacing = 120 - difficulty * 30; // tighter spacing = harder
    const anchorCount = Math.floor((zone.bottomY - zone.topY) / spacing);

    for (let i = 0; i < anchorCount; i++) {
      const x = 40 + this.rand() * (SHAFT_WIDTH - 80);
      const y = zone.topY + (i / anchorCount) * (zone.bottomY - zone.topY);

      // Anchor types vary with difficulty
      const roll = this.rand();
      if (roll < difficulty * 0.15) {
        // Moving anchor
        const anchor = Anchor.createMoving(
          x, y,
          20 + this.rand() * 40,
          1 + this.rand() * 2
        );
        zone.anchors.push(anchor);
      } else if (roll < difficulty * 0.25) {
        // Breakable anchor
        zone.anchors.push(new Anchor(x, y, 'breakable'));
      } else {
        // Static anchor
        zone.anchors.push(new Anchor(x, y, 'static'));
      }
    }
  }

  private generateEnemies(zone: Zone, difficulty: number): void {
    const zoneHeight = zone.bottomY - zone.topY;

    // Moths (appear from zone 1)
    if (difficulty > 0.1) {
      const mothCount = Math.floor(1 + difficulty * 4);
      for (let i = 0; i < mothCount; i++) {
        zone.enemies.push({
          type: 'moth',
          x: 40 + this.rand() * (SHAFT_WIDTH - 80),
          y: zone.topY + this.rand() * zoneHeight,
        });
      }
    }

    // Wasps (appear from zone 2)
    if (difficulty > 0.2) {
      const waspCount = Math.floor(difficulty * 3);
      for (let i = 0; i < waspCount; i++) {
        zone.enemies.push({
          type: 'wasp',
          x: 40 + this.rand() * (SHAFT_WIDTH - 80),
          y: zone.topY + this.rand() * zoneHeight,
        });
      }
    }

    // Web Eaters (appear from zone 2)
    if (difficulty > 0.2) {
      const weCount = Math.floor(difficulty * 2);
      for (let i = 0; i < weCount; i++) {
        zone.enemies.push({
          type: 'webEater',
          x: 40 + this.rand() * (SHAFT_WIDTH - 80),
          y: zone.topY + this.rand() * zoneHeight,
        });
      }
    }

    // Big Spider boss every 3 zones
    if (zone.index > 0 && zone.index % 3 === 0) {
      zone.enemies.push({
        type: 'bigSpider',
        x: SHAFT_WIDTH / 2,
        y: zone.topY + zoneHeight * 0.3,
      });
    }
  }
}
