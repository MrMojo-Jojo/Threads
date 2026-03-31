export class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  set(x: number, y: number): Vec2 {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vec2): Vec2 {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vec2 {
    const len = this.length();
    if (len === 0) return new Vec2(0, 0);
    return this.scale(1 / len);
  }

  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  dist(v: Vec2): number {
    return this.sub(v).length();
  }

  distSq(v: Vec2): number {
    return this.sub(v).lengthSq();
  }

  lerp(v: Vec2, t: number): Vec2 {
    return new Vec2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    );
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  rotate(angle: number): Vec2 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
  }

  static fromAngle(angle: number, length: number = 1): Vec2 {
    return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

export function pointToSegmentDistSq(p: Vec2, a: Vec2, b: Vec2): number {
  const ab = b.sub(a);
  const ap = p.sub(a);
  const abLenSq = ab.lengthSq();
  if (abLenSq === 0) return ap.lengthSq();
  const t = Math.max(0, Math.min(1, ap.dot(ab) / abLenSq));
  const closest = a.add(ab.scale(t));
  return p.distSq(closest);
}
