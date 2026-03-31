import { Vec2 } from './Vec2';
import {
  CAMERA_SPEED,
  CAMERA_LOOKAHEAD_X,
  CAMERA_LOOKAHEAD_Y,
  CAMERA_MAX_LOOKAHEAD,
  GAME_WIDTH,
  GAME_HEIGHT,
} from './Constants';

export class Camera {
  public pos = new Vec2();
  public viewWidth = GAME_WIDTH;
  public viewHeight = GAME_HEIGHT;

  public levelTop = -Infinity;
  public levelBottom = Infinity;
  public levelLeft = 0;
  public levelRight = GAME_WIDTH;

  update(dt: number, targetPos: Vec2, targetVel: Vec2): void {
    // Predictive look-ahead
    const lookAhead = new Vec2(
      targetVel.x * CAMERA_LOOKAHEAD_X,
      targetVel.y * CAMERA_LOOKAHEAD_Y
    );
    const lookAheadLen = lookAhead.length();
    const clampedLookAhead = lookAheadLen > CAMERA_MAX_LOOKAHEAD
      ? lookAhead.scale(CAMERA_MAX_LOOKAHEAD / lookAheadLen)
      : lookAhead;

    const target = targetPos.add(clampedLookAhead);

    // Frame-rate independent exponential lerp
    const smooth = 1 - Math.exp(-CAMERA_SPEED * dt);
    this.pos = this.pos.lerp(target, smooth);

    // Clamp to level bounds
    const halfW = this.viewWidth / 2;
    const halfH = this.viewHeight / 2;
    this.pos.x = Math.max(this.levelLeft + halfW, Math.min(this.levelRight - halfW, this.pos.x));
    if (this.levelTop > -Infinity) {
      this.pos.y = Math.max(this.levelTop + halfH, this.pos.y);
    }
    if (this.levelBottom < Infinity) {
      this.pos.y = Math.min(this.levelBottom - halfH, this.pos.y);
    }
  }

  worldToScreen(worldPos: Vec2): Vec2 {
    return new Vec2(
      worldPos.x - this.pos.x + this.viewWidth / 2,
      worldPos.y - this.pos.y + this.viewHeight / 2
    );
  }

  screenToWorld(screenPos: Vec2): Vec2 {
    return new Vec2(
      screenPos.x + this.pos.x - this.viewWidth / 2,
      screenPos.y + this.pos.y - this.viewHeight / 2
    );
  }

  isVisible(worldPos: Vec2, margin: number = 50): boolean {
    const screen = this.worldToScreen(worldPos);
    return screen.x > -margin && screen.x < this.viewWidth + margin &&
           screen.y > -margin && screen.y < this.viewHeight + margin;
  }
}
