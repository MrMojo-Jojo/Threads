const FIXED_DT = 1 / 60;
const MAX_FRAME_TIME = 0.1; // cap to prevent spiral of death

export class GameLoop {
  private accumulator = 0;
  private lastTime = 0;
  private running = false;
  private rafId = 0;
  public interpolation = 0;

  constructor(
    private update: (dt: number) => void,
    private render: (interp: number) => void
  ) {}

  start(): void {
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.tick();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now() / 1000;
    let frameTime = now - this.lastTime;
    this.lastTime = now;

    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;

    this.accumulator += frameTime;

    while (this.accumulator >= FIXED_DT) {
      this.update(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    this.interpolation = this.accumulator / FIXED_DT;
    this.render(this.interpolation);

    this.rafId = requestAnimationFrame(this.tick);
  };
}
