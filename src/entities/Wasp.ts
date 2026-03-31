import { Vec2 } from '../core/Vec2';
import { WASP_RADIUS, WASP_SPEED } from '../core/Constants';

export class Wasp {
  public pos: Vec2;
  public radius = WASP_RADIUS;
  public alive = true;
  public phase: number;
  public chasing = false;
  private vel = new Vec2();

  constructor(x: number, y: number) {
    this.pos = new Vec2(x, y);
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt: number, playerPos: Vec2): void {
    if (!this.alive) return;
    this.phase += dt * 10;

    const toPlayer = playerPos.sub(this.pos);
    const dist = toPlayer.length();

    // Chase if player is within range
    if (dist < 300) {
      this.chasing = true;
      const dir = toPlayer.normalize();
      this.vel = this.vel.lerp(dir.scale(WASP_SPEED), 0.05);
    } else {
      this.chasing = false;
      // Patrol: hover in place
      this.vel = this.vel.scale(0.95);
    }

    this.pos = this.pos.add(this.vel.scale(dt));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;
    const wingFlap = Math.sin(this.phase) * 0.5 + 0.5;

    // Wings
    ctx.fillStyle = 'rgba(255,200,200,0.5)';
    ctx.beginPath();
    ctx.ellipse(this.pos.x - 6, this.pos.y - 4, 5 + wingFlap * 3, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.pos.x + 6, this.pos.y - 4, 5 + wingFlap * 3, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Body (yellow-black stripes)
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.ellipse(this.pos.x, this.pos.y, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.fillStyle = '#220000';
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(this.pos.x - 5, this.pos.y + i * 4 - 1, 10, 2);
    }

    // Stinger
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y + 8);
    ctx.lineTo(this.pos.x, this.pos.y + 13);
    ctx.stroke();

    // Angry eyes when chasing
    if (this.chasing) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.pos.x - 2, this.pos.y - 3, 2, 0, Math.PI * 2);
      ctx.arc(this.pos.x + 2, this.pos.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
