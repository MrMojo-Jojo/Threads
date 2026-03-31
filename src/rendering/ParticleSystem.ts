import { Vec2 } from '../core/Vec2';

interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(pos: Vec2, count: number, speed: number, color: string, direction?: Vec2): void {
    for (let i = 0; i < count; i++) {
      let angle: number;
      if (direction) {
        angle = direction.angle() + (Math.random() - 0.5) * 1.2;
      } else {
        angle = Math.random() * Math.PI * 2;
      }
      const spd = speed * (0.5 + Math.random() * 0.5);
      const life = 0.3 + Math.random() * 0.5;

      this.particles.push({
        pos: pos.clone(),
        vel: Vec2.fromAngle(angle, spd),
        life,
        maxLife: life,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
      });
    }
  }

  emitBurst(pos: Vec2, count: number, speed: number, color: string): void {
    this.emit(pos, count, speed, color);
  }

  emitSlingshot(pos: Vec2, direction: Vec2, power: number): void {
    const count = Math.floor(5 + power * 15);
    const speed = 100 + power * 300;
    this.emit(pos, count, speed, '#ff6644', direction);
    this.emit(pos, Math.floor(count / 2), speed * 0.5, '#ffcc44', direction);
  }

  emitWebSnap(pos: Vec2): void {
    this.emit(pos, 8, 80, '#ffffff');
  }

  emitDeath(pos: Vec2): void {
    this.emit(pos, 20, 150, '#ff4444');
    this.emit(pos, 10, 100, '#ffffff');
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.pos = p.pos.add(p.vel.scale(dt));
      p.vel = p.vel.scale(0.97); // drag
      p.vel.y += 200 * dt; // gravity
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      p.size *= 0.99;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  get count(): number {
    return this.particles.length;
  }
}
