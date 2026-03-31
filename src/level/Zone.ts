import { Anchor } from '../entities/Anchor';
import { Wall } from './Wall';
import { ZoneTheme, ZONE_THEMES } from '../core/Constants';

export interface EnemySpawn {
  type: 'moth' | 'wasp' | 'webEater' | 'bigSpider';
  x: number;
  y: number;
}

export class Zone {
  public index: number;
  public topY: number;
  public bottomY: number;
  public anchors: Anchor[] = [];
  public walls: Wall[] = [];
  public enemies: EnemySpawn[] = [];
  public theme: ZoneTheme;

  constructor(index: number, topY: number, bottomY: number) {
    this.index = index;
    this.topY = topY;
    this.bottomY = bottomY;
    this.theme = ZONE_THEMES[index % ZONE_THEMES.length];
  }
}
