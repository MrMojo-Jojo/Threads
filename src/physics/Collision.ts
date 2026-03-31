import { Vec2 } from '../core/Vec2';
import { VerletBody } from './VerletBody';
import { WALL_RESTITUTION } from '../core/Constants';

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function resolveCircleAABB(body: VerletBody, box: AABB): boolean {
  const left = box.x;
  const right = box.x + box.width;
  const top = box.y;
  const bottom = box.y + box.height;

  // Find closest point on AABB to circle center
  const closestX = Math.max(left, Math.min(body.pos.x, right));
  const closestY = Math.max(top, Math.min(body.pos.y, bottom));

  const delta = body.pos.sub(new Vec2(closestX, closestY));
  const dist = delta.length();

  if (dist >= body.radius || dist === 0) return false;

  const normal = delta.normalize();
  const penetration = body.radius - dist;

  // Position correction
  body.pos = body.pos.add(normal.scale(penetration));

  // Velocity reflection with restitution
  const vel = body.getVelocity();
  const velAlongNormal = vel.dot(normal);
  if (velAlongNormal < 0) {
    const reflection = vel.sub(normal.scale(velAlongNormal * (1 + WALL_RESTITUTION)));
    body.prevPos = body.pos.sub(reflection);
  }

  return true;
}

export function circlesOverlap(a: Vec2, aRadius: number, b: Vec2, bRadius: number): boolean {
  const minDist = aRadius + bRadius;
  return a.distSq(b) < minDist * minDist;
}

export function segmentIntersectsAABB(a: Vec2, b: Vec2, box: AABB): boolean {
  // Liang-Barsky line clipping
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const left = box.x;
  const right = box.x + box.width;
  const top = box.y;
  const bottom = box.y + box.height;

  const p = [-dx, dx, -dy, dy];
  const q = [a.x - left, right - a.x, a.y - top, bottom - a.y];

  let tMin = 0;
  let tMax = 1;

  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-10) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        tMin = Math.max(tMin, t);
      } else {
        tMax = Math.min(tMax, t);
      }
      if (tMin > tMax) return false;
    }
  }
  return true;
}
