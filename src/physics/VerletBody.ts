import { Vec2 } from '../core/Vec2';
import { GRAVITY, VERLET_DAMPING } from '../core/Constants';

export class VerletBody {
  public pos: Vec2;
  public prevPos: Vec2;
  public radius: number;

  constructor(x: number, y: number, radius: number) {
    this.pos = new Vec2(x, y);
    this.prevPos = new Vec2(x, y);
    this.radius = radius;
  }

  getVelocity(): Vec2 {
    return this.pos.sub(this.prevPos);
  }

  integrate(dt: number): void {
    const vel = this.pos.sub(this.prevPos).scale(VERLET_DAMPING);
    const gravity = new Vec2(0, GRAVITY * dt * dt);
    const newPos = this.pos.add(vel).add(gravity);
    this.prevPos.copy(this.pos);
    this.pos.copy(newPos);
  }

  applyImpulse(impulse: Vec2): void {
    // In Verlet, impulse = adjusting prevPos so velocity changes
    this.prevPos = this.pos.sub(impulse);
  }

  setPosition(x: number, y: number): void {
    const vel = this.getVelocity();
    this.pos.set(x, y);
    this.prevPos = this.pos.sub(vel);
  }
}
