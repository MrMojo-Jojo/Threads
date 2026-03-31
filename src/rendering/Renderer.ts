import { Camera } from '../core/Camera';
import { GAME_WIDTH, GAME_HEIGHT } from '../core/Constants';

export class Renderer {
  public ctx: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;
  public scale = 1;
  public offsetX = 0;
  public offsetY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    // Fit game to screen maintaining aspect ratio
    const gameAspect = GAME_WIDTH / GAME_HEIGHT;
    const windowAspect = windowW / windowH;

    if (windowAspect < gameAspect) {
      this.scale = windowW / GAME_WIDTH;
    } else {
      this.scale = windowH / GAME_HEIGHT;
    }

    this.offsetX = (windowW - GAME_WIDTH * this.scale) / 2;
    this.offsetY = (windowH - GAME_HEIGHT * this.scale) / 2;

    this.canvas.width = windowW * dpr;
    this.canvas.height = windowH * dpr;
    this.canvas.style.width = windowW + 'px';
    this.canvas.style.height = windowH + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  beginFrame(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
  }

  endFrame(): void {
    this.ctx.restore();
  }

  applyCamera(camera: Camera): void {
    this.ctx.translate(GAME_WIDTH / 2 - camera.pos.x, GAME_HEIGHT / 2 - camera.pos.y);
  }
}
