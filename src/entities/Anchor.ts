import { Vec2 } from '../core/Vec2';
import { AnchorPoint } from '../physics/WebShooter';

export type AnchorType = 'static' | 'moving' | 'breakable';

export class Anchor implements AnchorPoint {
  public pos: Vec2;
  public active = true;
  public type: AnchorType;
  public breakable: boolean;
  public usesLeft: number;
  public pulsePhase: number;

  // Moving anchor properties
  public moveCenter: Vec2;
  public moveRadius = 0;
  public moveSpeed = 0;
  public moveAngle = 0;

  constructor(x: number, y: number, type: AnchorType = 'static') {
    this.pos = new Vec2(x, y);
    this.type = type;
    this.breakable = type === 'breakable';
    this.usesLeft = type === 'breakable' ? 1 : Infinity;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.moveCenter = new Vec2(x, y);
  }

  update(dt: number): void {
    this.pulsePhase += dt * 3;

    if (this.type === 'moving') {
      this.moveAngle += this.moveSpeed * dt;
      this.pos.x = this.moveCenter.x + Math.cos(this.moveAngle) * this.moveRadius;
      this.pos.y = this.moveCenter.y + Math.sin(this.moveAngle) * this.moveRadius;
    }
  }

  onUsed(): void {
    if (this.breakable) {
      this.usesLeft--;
      if (this.usesLeft <= 0) {
        this.active = false;
      }
    }
  }

  static createMoving(x: number, y: number, radius: number, speed: number): Anchor {
    const a = new Anchor(x, y, 'moving');
    a.moveCenter = new Vec2(x, y);
    a.moveRadius = radius;
    a.moveSpeed = speed;
    return a;
  }
}
