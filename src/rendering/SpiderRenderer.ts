import { Spider } from '../entities/Spider';
import { Vec2 } from '../core/Vec2';
import { COLOR_SPIDER, COLOR_SPIDER_BODY, SPIDER_RADIUS } from '../core/Constants';

export function drawSpider(ctx: CanvasRenderingContext2D, spider: Spider): void {
  const x = spider.body.pos.x;
  const y = spider.body.pos.y;
  const r = SPIDER_RADIUS;
  const phase = spider.legPhase;
  const vel = spider.body.getVelocity();
  const speed = vel.length();

  // Body
  ctx.fillStyle = COLOR_SPIDER_BODY;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen (slightly behind based on velocity)
  const abdomenOffset = vel.length() > 0.5 ? vel.normalize().scale(-r * 0.4) : new Vec2(0, r * 0.3);
  ctx.fillStyle = COLOR_SPIDER;
  ctx.beginPath();
  ctx.ellipse(
    x + abdomenOffset.x,
    y + abdomenOffset.y,
    r * 0.65,
    r * 0.55,
    abdomenOffset.angle(),
    0, Math.PI * 2
  );
  ctx.fill();

  // Eyes
  const eyeDir = vel.length() > 0.5 ? vel.normalize() : new Vec2(0, -1);
  const eyeOffset = eyeDir.scale(r * 0.4);
  const eyeSpread = new Vec2(-eyeDir.y, eyeDir.x).scale(r * 0.25);

  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(x + eyeOffset.x + eyeSpread.x, y + eyeOffset.y + eyeSpread.y, 2, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset.x - eyeSpread.x, y + eyeOffset.y - eyeSpread.y, 2, 0, Math.PI * 2);
  ctx.fill();

  // Legs (4 pairs)
  ctx.strokeStyle = COLOR_SPIDER;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  const legAnimSpeed = speed > 0.5 ? 1 : 0.2;
  for (let i = 0; i < 4; i++) {
    const baseAngle = (i / 4) * Math.PI - Math.PI / 2;
    const animOffset = Math.sin(phase * legAnimSpeed + i * 1.2) * 0.3;

    // Right leg
    drawLeg(ctx, x, y, r, baseAngle + animOffset);
    // Left leg (mirrored)
    drawLeg(ctx, x, y, r, Math.PI - baseAngle - animOffset);
  }
}

function drawLeg(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number): void {
  const joint = Vec2.fromAngle(angle, r * 1.2);
  const tip = Vec2.fromAngle(angle + 0.3, r * 2.0);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + joint.x, y + joint.y);
  ctx.lineTo(x + tip.x, y + tip.y);
  ctx.stroke();
}

export function drawTrail(ctx: CanvasRenderingContext2D, spider: Spider): void {
  if (spider.trailPositions.length < 2) return;

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const first = spider.trailPositions[0];
  ctx.moveTo(first.x, first.y);

  for (let i = 1; i < spider.trailPositions.length; i++) {
    const p = spider.trailPositions[i];
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}
