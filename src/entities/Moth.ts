import { Vec2 } from '../core/Vec2';
import { MOTH_RADIUS } from '../core/Constants';

export class Moth {
  public pos: Vec2;
  public radius = MOTH_RADIUS;
  public alive = true;
  public phase: number;
  public basePos: Vec2;
  public flutterRadius = 30;
  public flutterSpeed = 2;

  constructor(x: number, y: number) {
    this.pos = new Vec2(x, y);
    this.basePos = new Vec2(x, y);
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt: number): void {
    if (!this.alive) return;
    this.phase += this.flutterSpeed * dt;
    this.pos.x = this.basePos.x + Math.sin(this.phase * 2.3) * this.flutterRadius;
    this.pos.y = this.basePos.y + Math.cos(this.phase * 1.7) * this.flutterRadius * 0.5;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;
    const wingFlap = Math.sin(this.phase * 8) * 0.5 + 0.5;

    // Wings
    ctx.fillStyle = 'rgba(204,170,68,0.7)';
    ctx.beginPath();
    ctx.ellipse(
      this.pos.x - 8, this.pos.y,
      6 + wingFlap * 4, 10,
      -0.3, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      this.pos.x + 8, this.pos.y,
      6 + wingFlap * 4, 10,
      0.3, 0, Math.PI * 2
    );
    ctx.fill();

    // Body
    ctx.fillStyle = '#ccaa44';
    ctx.beginPath();
    ctx.ellipse(this.pos.x, this.pos.y, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
