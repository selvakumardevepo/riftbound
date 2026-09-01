/**
 * Fixed-Timestep 60 FPS Game Loop
 */

export class GameLoop {
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private updateFn: (dt: number) => void;
  private renderFn: () => void;

  constructor(update: (dt: number) => void, render: () => void) {
    this.updateFn = update;
    this.renderFn = render;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  public stop() {
    this.isRunning = false;
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    let dt = (currentTime - this.lastTime) / 1000.0;
    this.lastTime = currentTime;

    // Cap delta time to prevent physics spiral on tab switch
    if (dt > 0.1) dt = 0.1;

    this.updateFn(dt);
    this.renderFn();

    requestAnimationFrame(this.loop.bind(this));
  }
}
