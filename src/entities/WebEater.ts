import { Vec2 } from '../core/Vec2';
import { WEB_EATER_RADIUS } from '../core/Constants';

export class WebEater {
  public pos: Vec2;
  public radius = WEB_EATER_RADIUS;
  public alive = true;
  public anchorIndex: number; // which anchor this sits on
  public phase: number;

  constructor(x: number, y: number, anchorIndex: number) {
    this.pos = new Vec2(x, y);
    this.anchorIndex = anchorIndex;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt: number): void {
    this.phase += dt * 2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;
    const wobble = Math.sin(this.phase) * 2;

    // Body — small green blob
    ctx.fillStyle = '#44aa44';
    ctx.beginPath();
    ctx.arc(this.pos.x + wobble, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (eating animation)
    const mouthOpen = Math.abs(Math.sin(this.phase * 2)) * 3;
    ctx.fillStyle = '#1a4a1a';
    ctx.beginPath();
    ctx.arc(this.pos.x + wobble, this.pos.y + 2, mouthOpen, 0, Math.PI);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.pos.x + wobble - 3, this.pos.y - 3, 2, 0, Math.PI * 2);
    ctx.arc(this.pos.x + wobble + 3, this.pos.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
