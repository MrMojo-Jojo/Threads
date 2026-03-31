import { VerletBody } from '../physics/VerletBody';
import { SPIDER_RADIUS } from '../core/Constants';

export type SpiderState = 'falling' | 'swinging' | 'slingshotting' | 'launching' | 'dead' | 'webcatch';

export class Spider {
  public body: VerletBody;
  public state: SpiderState = 'falling';
  public legPhase = 0; // animation phase for legs
  public trailPositions: { x: number; y: number }[] = [];
  private maxTrail = 20;

  constructor(x: number, y: number) {
    this.body = new VerletBody(x, y, SPIDER_RADIUS);
  }

  update(dt: number): void {
    this.legPhase += dt * 8;

    // Record trail
    this.trailPositions.push({ x: this.body.pos.x, y: this.body.pos.y });
    if (this.trailPositions.length > this.maxTrail) {
      this.trailPositions.shift();
    }
  }

  get x(): number { return this.body.pos.x; }
  get y(): number { return this.body.pos.y; }
}
