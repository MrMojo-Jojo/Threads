import { Vec2 } from '../core/Vec2';
import { VerletBody } from './VerletBody';
import { RopeConstraint } from './RopeConstraint';
import { SLINGSHOT_MAX_STRETCH, SLINGSHOT_FORCE } from '../core/Constants';

export class Slingshot {
  public active = false;
  public stretchAmount = 0;
  public dragPos = new Vec2();
  public maxStretch: number = SLINGSHOT_MAX_STRETCH;

  startDrag(body: VerletBody, rope: RopeConstraint): void {
    if (!rope.active) return;
    this.active = true;
    this.dragPos.copy(body.pos);
  }

  updateDrag(body: VerletBody, rope: RopeConstraint, dragWorldPos: Vec2): void {
    if (!this.active || !rope.active) return;

    // Move spider to drag position, constrained by max stretch from anchor
    const toAnchor = rope.anchorPos.sub(dragWorldPos);
    const dist = toAnchor.length();
    const maxDist = rope.ropeLength + this.maxStretch;

    if (dist > maxDist) {
      // Clamp to max stretch distance
      body.pos = rope.anchorPos.sub(toAnchor.normalize().scale(maxDist));
    } else {
      body.pos.copy(dragWorldPos);
    }

    // Keep prevPos = pos so spider is "frozen" during drag
    body.prevPos.copy(body.pos);

    this.stretchAmount = Math.max(0, body.pos.dist(rope.anchorPos) - rope.ropeLength);
    this.dragPos.copy(body.pos);
  }

  release(body: VerletBody, rope: RopeConstraint): Vec2 | null {
    if (!this.active || !rope.active) {
      this.active = false;
      return null;
    }

    this.active = false;

    if (this.stretchAmount < 5) return null;

    // Impulse direction: from spider toward anchor (slingshot effect)
    const dir = rope.anchorPos.sub(body.pos).normalize();
    const power = (this.stretchAmount / this.maxStretch) * SLINGSHOT_FORCE;
    const impulse = dir.scale(power);

    // Detach rope and apply impulse
    rope.detach();
    body.applyImpulse(impulse);

    this.stretchAmount = 0;
    return impulse;
  }
}
