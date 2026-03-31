import { VerletBody } from './VerletBody';
import { RopeConstraint } from './RopeConstraint';
import { Slingshot } from './Slingshot';
import { WebShooter, AnchorPoint } from './WebShooter';
import { resolveCircleAABB, AABB } from './Collision';
import { CONSTRAINT_ITERATIONS } from '../core/Constants';
import { Camera } from '../core/Camera';
import { Input } from '../core/Input';

export class PhysicsWorld {
  public body: VerletBody;
  public rope = new RopeConstraint();
  public slingshot = new Slingshot();
  public webShooter = new WebShooter();
  public walls: AABB[] = [];
  public anchors: AnchorPoint[] = [];
  public isDead = false;
  public webCatchAvailable = true;
  public webCatchTimer = 0;
  public isInWebCatch = false;

  constructor(body: VerletBody) {
    this.body = body;
  }

  update(dt: number, input: Input, camera: Camera): void {
    if (this.isDead) return;

    // Web catch timer
    if (this.isInWebCatch) {
      this.webCatchTimer -= dt;
      if (this.webCatchTimer <= 0) {
        this.isDead = true;
        this.isInWebCatch = false;
        return;
      }
      // During web catch, still process tap input to save
      if (input.consumeTap()) {
        const anchor = this.webShooter.findBestAnchor(this.body, this.anchors);
        if (anchor) {
          this.webShooter.shootWeb(this.body, anchor);
          this.isInWebCatch = false;
        }
      }
    }

    this.processInput(dt, input, camera);

    // Skip physics integration during slingshot drag
    if (this.slingshot.active) return;

    // Verlet integration
    this.body.integrate(dt);

    // Web projectile update
    this.webShooter.update(dt, this.body, this.rope);

    // Rope constraint
    if (this.rope.active) {
      for (let i = 0; i < CONSTRAINT_ITERATIONS; i++) {
        this.rope.enforce(this.body);
      }
    }

    // Wall collisions
    for (const wall of this.walls) {
      resolveCircleAABB(this.body, wall);
    }

    // Camera update
    const vel = this.body.getVelocity().scale(60); // per-frame to per-second
    camera.update(dt, this.body.pos, vel);
  }

  private processInput(_dt: number, input: Input, camera: Camera): void {
    // Handle slingshot drag
    if (this.slingshot.active) {
      if (input.state === 'dragging') {
        const worldPos = camera.screenToWorld(input.pos);
        this.slingshot.updateDrag(this.body, this.rope, worldPos);
      }
      const release = input.consumeRelease();
      if (release || input.state === 'none') {
        const impulse = this.slingshot.release(this.body, this.rope);
        if (impulse) {
          // Slingshot launched!
        }
      }
      return;
    }

    // Tap to shoot web
    if (input.consumeTap()) {
      if (this.rope.active) {
        // Detach current rope (release swing)
        this.rope.detach();
      }
      const anchor = this.webShooter.findBestAnchor(this.body, this.anchors);
      if (anchor) {
        this.webShooter.shootWeb(this.body, anchor);
      }
    }

    // Start slingshot drag while attached
    if (input.state === 'dragging' && this.rope.active && !this.slingshot.active) {
      this.slingshot.startDrag(this.body, this.rope);
    }
  }

  triggerWebCatch(): void {
    if (this.webCatchAvailable) {
      this.isInWebCatch = true;
      this.webCatchTimer = 0.4;
      this.webCatchAvailable = false;
    } else {
      this.isDead = true;
    }
  }

  reset(x: number, y: number): void {
    this.body.pos.set(x, y);
    this.body.prevPos.set(x, y);
    this.rope.detach();
    this.slingshot.active = false;
    this.webShooter.cancel();
    this.isDead = false;
    this.isInWebCatch = false;
    this.webCatchAvailable = true;
  }
}
