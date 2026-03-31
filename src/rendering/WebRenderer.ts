import { Vec2 } from '../core/Vec2';
import { RopeConstraint } from '../physics/RopeConstraint';
import { Slingshot } from '../physics/Slingshot';
import { WebShooter } from '../physics/WebShooter';
import { AnchorPoint } from '../physics/WebShooter';
import { Camera } from '../core/Camera';
import {
  COLOR_WEB,
  COLOR_ANCHOR,
  COLOR_ANCHOR_GLOW,
  WEB_MAX_RANGE,
} from '../core/Constants';

export function drawWeb(
  ctx: CanvasRenderingContext2D,
  spiderPos: Vec2,
  rope: RopeConstraint,
  slingshot: Slingshot
): void {
  if (!rope.active) return;

  const stretch = slingshot.active ? slingshot.stretchAmount : 0;
  const maxStretch = slingshot.maxStretch;
  const t = Math.min(1, stretch / maxStretch);

  // Interpolate color from white to orange-red based on stretch
  const r = Math.round(255);
  const g = Math.round(255 - t * 155);
  const b = Math.round(255 - t * 211);

  ctx.strokeStyle = `rgb(${r},${g},${b})`;
  ctx.lineWidth = slingshot.active ? 2 + t * 2 : 2;
  ctx.setLineDash(slingshot.active ? [4, 4] : []);

  ctx.beginPath();
  ctx.moveTo(spiderPos.x, spiderPos.y);
  ctx.lineTo(rope.anchorPos.x, rope.anchorPos.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Stretch indicator glow
  if (slingshot.active && t > 0.1) {
    ctx.strokeStyle = `rgba(255,100,68,${t * 0.5})`;
    ctx.lineWidth = 4 + t * 6;
    ctx.beginPath();
    ctx.moveTo(spiderPos.x, spiderPos.y);
    ctx.lineTo(rope.anchorPos.x, rope.anchorPos.y);
    ctx.stroke();
  }
}

export function drawWebProjectile(
  ctx: CanvasRenderingContext2D,
  webShooter: WebShooter,
  spiderPos: Vec2
): void {
  if (!webShooter.projectile) return;

  ctx.strokeStyle = COLOR_WEB;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(spiderPos.x, spiderPos.y);
  ctx.lineTo(webShooter.projectile.pos.x, webShooter.projectile.pos.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Projectile dot
  ctx.fillStyle = COLOR_WEB;
  ctx.beginPath();
  ctx.arc(webShooter.projectile.pos.x, webShooter.projectile.pos.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

export function drawAnchors(
  ctx: CanvasRenderingContext2D,
  anchors: AnchorPoint[],
  camera: Camera,
  spiderPos: Vec2,
  time: number
): void {
  for (const anchor of anchors) {
    if (!anchor.active) continue;
    if (!camera.isVisible(anchor.pos, 100)) continue;

    const dist = anchor.pos.dist(spiderPos);
    const inRange = dist < WEB_MAX_RANGE;
    const pulse = Math.sin(time * 3 + anchor.pos.x * 0.01) * 0.3 + 0.7;

    // Glow for in-range anchors
    if (inRange) {
      const glowRadius = 15 + pulse * 5;
      ctx.fillStyle = COLOR_ANCHOR_GLOW;
      ctx.beginPath();
      ctx.arc(anchor.pos.x, anchor.pos.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anchor point
    const baseRadius = inRange ? 5 + pulse * 2 : 4;
    ctx.fillStyle = inRange ? COLOR_ANCHOR : 'rgba(102,204,255,0.4)';
    ctx.beginPath();
    ctx.arc(anchor.pos.x, anchor.pos.y, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Breakable indicator
    if (anchor.breakable) {
      ctx.strokeStyle = '#ff6644';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(anchor.pos.x, anchor.pos.y, baseRadius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: { x: number; y: number; width: number; height: number }[],
  camera: Camera,
  wallColor: string
): void {
  ctx.fillStyle = wallColor;
  for (const wall of walls) {
    if (!camera.isVisible(new Vec2(wall.x + wall.width / 2, wall.y + wall.height / 2), Math.max(wall.width, wall.height))) continue;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  }
}
