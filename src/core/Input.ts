import { Vec2 } from './Vec2';

export type InputState = 'none' | 'tap' | 'dragging' | 'released';

export class Input {
  public state: InputState = 'none';
  public pos = new Vec2();
  public startPos = new Vec2();
  public dragDelta = new Vec2();
  public tapFired = false;
  private holdTime = 0;
  private isDown = false;
  private canvas: HTMLCanvasElement;
  public scale = 1;
  public offsetX = 0;
  public offsetY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private getPos(e: MouseEvent | Touch): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return new Vec2(
      (e.clientX - rect.left - this.offsetX) / this.scale,
      (e.clientY - rect.top - this.offsetY) / this.scale
    );
  }

  private bindEvents(): void {
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.onDown(this.getPos(touch));
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.onMove(this.getPos(touch));
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.onUp();
    }, { passive: false });

    // Mouse events (for desktop testing)
    this.canvas.addEventListener('mousedown', (e) => {
      this.onDown(this.getPos(e));
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.onMove(this.getPos(e));
    });

    this.canvas.addEventListener('mouseup', () => {
      this.onUp();
    });
  }

  private onDown(pos: Vec2): void {
    this.isDown = true;
    this.pos.copy(pos);
    this.startPos.copy(pos);
    this.holdTime = 0;
    this.tapFired = false;
    this.state = 'tap';
  }

  private onMove(pos: Vec2): void {
    this.pos.copy(pos);
    if (this.isDown) {
      this.dragDelta = this.pos.sub(this.startPos);
      if (this.dragDelta.length() > 10) {
        this.state = 'dragging';
      }
    }
  }

  private onUp(): void {
    if (this.isDown) {
      if (this.state === 'dragging') {
        this.state = 'released';
      } else {
        this.tapFired = true;
      }
    }
    this.isDown = false;
  }

  update(dt: number): void {
    if (this.isDown) {
      this.holdTime += dt;
    }
    // Clear transient states after they've been consumed
    if (this.state === 'released') {
      this.state = 'none';
    }
  }

  consumeTap(): boolean {
    if (this.tapFired) {
      this.tapFired = false;
      this.state = 'none';
      return true;
    }
    return false;
  }

  consumeRelease(): Vec2 | null {
    if (this.state === 'released') {
      this.state = 'none';
      return this.dragDelta.clone();
    }
    return null;
  }
}
