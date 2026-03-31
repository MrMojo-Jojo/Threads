import { Vec2 } from '../core/Vec2';
import { BIG_SPIDER_RADIUS, SHAFT_WIDTH } from '../core/Constants';

export class BigSpider {
  public pos: Vec2;
  public radius = BIG_SPIDER_RADIUS;
  public alive = true;
  public health = 3;
  public phase: number;
  public weakPointAngle = 0;
  public stunTimer = 0;
  public isStunned = false;

  constructor(x: number, y: number) {
    this.pos = new Vec2(x, y);
    this.phase = Math.random() * Math.PI * 2;
    this.weakPointAngle = Math.random() * Math.PI * 2;
  }

  update(dt: number): void {
    if (!this.alive) return;
    this.phase += dt * 1.5;

    if (this.isStunned) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.weakPointAngle = Math.random() * Math.PI * 2;
      }
      return;
    }

    // Slowly move side to side, blocking the shaft
    this.pos.x = SHAFT_WIDTH / 2 + Math.sin(this.phase * 0.5) * (SHAFT_WIDTH / 4);
    this.weakPointAngle += dt * 1.2;
  }

  getWeakPointPos(): Vec2 {
    return this.pos.add(Vec2.fromAngle(this.weakPointAngle, this.radius + 10));
  }

  hit(): boolean {
    this.health--;
    this.isStunned = true;
    this.stunTimer = 1.5;
    if (this.health <= 0) {
      this.alive = false;
      return true; // killed
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    const shake = this.isStunned ? Math.sin(this.phase * 20) * 3 : 0;

    // Large body
    ctx.fillStyle = this.isStunned ? '#664466' : '#884488';
    ctx.beginPath();
    ctx.arc(this.pos.x + shake, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Pattern on body
    ctx.strokeStyle = '#aa66aa';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + this.phase * 0.3;
      const r = this.radius * 0.5;
      ctx.beginPath();
      ctx.arc(
        this.pos.x + shake + Math.cos(angle) * r,
        this.pos.y + Math.sin(angle) * r,
        8, 0, Math.PI * 2
      );
      ctx.stroke();
    }

    // Legs
    ctx.strokeStyle = '#884488';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const baseAngle = (i / 6) * Math.PI * 2;
      const legPhase = Math.sin(this.phase * 2 + i) * 0.2;
      const joint = Vec2.fromAngle(baseAngle + legPhase, this.radius * 1.3);
      const tip = Vec2.fromAngle(baseAngle + legPhase + 0.4, this.radius * 2);
      ctx.beginPath();
      ctx.moveTo(this.pos.x + shake, this.pos.y);
      ctx.lineTo(this.pos.x + shake + joint.x, this.pos.y + joint.y);
      ctx.lineTo(this.pos.x + shake + tip.x, this.pos.y + tip.y);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#ff4444';
    const eyeSpread = 12;
    ctx.beginPath();
    ctx.arc(this.pos.x + shake - eyeSpread, this.pos.y - 8, 5, 0, Math.PI * 2);
    ctx.arc(this.pos.x + shake + eyeSpread, this.pos.y - 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.pos.x + shake - eyeSpread, this.pos.y - 8, 2, 0, Math.PI * 2);
    ctx.arc(this.pos.x + shake + eyeSpread, this.pos.y - 8, 2, 0, Math.PI * 2);
    ctx.fill();

    // Weak point (glowing spot the player should hit with slingshot)
    if (!this.isStunned) {
      const wp = this.getWeakPointPos();
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(wp.x + shake, wp.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,204,0,0.3)';
      ctx.beginPath();
      ctx.arc(wp.x + shake, wp.y, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health pips
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < this.health ? '#ff4444' : '#333333';
      ctx.beginPath();
      ctx.arc(this.pos.x + shake + (i - 1) * 15, this.pos.y + this.radius + 15, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
