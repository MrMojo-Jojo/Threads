import { Vec2 } from '../core/Vec2';
import { VerletBody } from './VerletBody';

export class RopeConstraint {
  public active = false;
  public anchorPos = new Vec2();
  public ropeLength = 0;

  attach(anchorPos: Vec2, body: VerletBody): void {
    this.active = true;
    this.anchorPos.copy(anchorPos);
    this.ropeLength = body.pos.dist(anchorPos);
    // Clamp rope length to reasonable range
    this.ropeLength = Math.max(40, Math.min(250, this.ropeLength));
  }

  detach(): void {
    this.active = false;
  }

  enforce(body: VerletBody): void {
    if (!this.active) return;

    const delta = body.pos.sub(this.anchorPos);
    const dist = delta.length();

    // One-way constraint: only pull back, don't push
    if (dist > this.ropeLength && dist > 0) {
      const correction = delta.scale(1 / dist).scale(this.ropeLength);
      body.pos = this.anchorPos.add(correction);
    }
  }
}
