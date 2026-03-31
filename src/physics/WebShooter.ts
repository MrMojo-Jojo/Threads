import { Vec2 } from '../core/Vec2';
import { VerletBody } from './VerletBody';
import { RopeConstraint } from './RopeConstraint';
import {
  WEB_SPEED,
  WEB_MAX_RANGE,
  ANCHOR_WEIGHT_DIRECTION,
  ANCHOR_WEIGHT_DISTANCE,
  ANCHOR_WEIGHT_HEIGHT,
} from '../core/Constants';

export interface AnchorPoint {
  pos: Vec2;
  active: boolean;
  breakable?: boolean;
  usesLeft?: number;
}

export interface WebProjectile {
  pos: Vec2;
  target: Vec2;
  speed: number;
}

export class WebShooter {
  public projectile: WebProjectile | null = null;
  private pendingAnchor: AnchorPoint | null = null;

  findBestAnchor(body: VerletBody, anchors: AnchorPoint[]): AnchorPoint | null {
    const vel = body.getVelocity();
    const velDir = vel.length() > 0.5 ? vel.normalize() : new Vec2(0, -1);
    let bestScore = -Infinity;
    let best: AnchorPoint | null = null;

    for (const anchor of anchors) {
      if (!anchor.active) continue;

      const toAnchor = anchor.pos.sub(body.pos);
      const dist = toAnchor.length();
      if (dist > WEB_MAX_RANGE || dist < 20) continue;

      const dir = toAnchor.normalize();

      // Direction alignment (favor where spider is heading)
      const dirScore = dir.dot(velDir) * 0.5 + 0.5; // normalize to 0..1

      // Distance (closer is better)
      const distScore = 1 - (dist / WEB_MAX_RANGE);

      // Height bonus (favor anchors above)
      const heightScore = toAnchor.y < 0 ? Math.min(1, Math.abs(toAnchor.y) / WEB_MAX_RANGE) : 0;

      const score = ANCHOR_WEIGHT_DIRECTION * dirScore +
                    ANCHOR_WEIGHT_DISTANCE * distScore +
                    ANCHOR_WEIGHT_HEIGHT * heightScore;

      if (score > bestScore) {
        bestScore = score;
        best = anchor;
      }
    }

    return best;
  }

  shootWeb(body: VerletBody, anchor: AnchorPoint): void {
    this.projectile = {
      pos: body.pos.clone(),
      target: anchor.pos.clone(),
      speed: WEB_SPEED,
    };
    this.pendingAnchor = anchor;
  }

  update(dt: number, body: VerletBody, rope: RopeConstraint): boolean {
    if (!this.projectile || !this.pendingAnchor) return false;

    const toTarget = this.projectile.target.sub(this.projectile.pos);
    const dist = toTarget.length();
    const step = this.projectile.speed * dt;

    if (step >= dist) {
      // Arrived at anchor
      rope.attach(this.pendingAnchor.pos, body);
      this.projectile = null;
      this.pendingAnchor = null;
      return true;
    }

    this.projectile.pos = this.projectile.pos.add(toTarget.normalize().scale(step));
    return false;
  }

  cancel(): void {
    this.projectile = null;
    this.pendingAnchor = null;
  }
}
