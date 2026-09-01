/**
 * Multi-Touch Virtual Joystick & Gesture Input Manager
 */

export interface InputVector {
  x: number;
  y: number;
  isMoving: boolean;
}

export class InputManager {
  public moveVector: InputVector = { x: 0, y: 0, isMoving: false };
  public isAttackPressed: boolean = false;
  public isDashTriggered: boolean = false;
  public isSkill1Triggered: boolean = false;
  public isSkill2Triggered: boolean = false;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private activeTouchId: number | null = null;
  private keys: { [key: string]: boolean } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.setupTouch(canvas);
    this.setupKeyboard();
  }

  private setupTouch(canvas: HTMLCanvasElement) {
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      if (this.activeTouchId === null && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this.activeTouchId = touch.identifier;
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.moveVector.isMoving = true;
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.activeTouchId) {
          const dx = touch.clientX - this.touchStartX;
          const dy = touch.clientY - this.touchStartY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = 45;
          
          if (dist > 5) {
            const angle = Math.atan2(dy, dx);
            const clampedDist = Math.min(dist, maxRadius);
            this.moveVector.x = Math.cos(angle) * (clampedDist / maxRadius);
            this.moveVector.y = Math.sin(angle) * (clampedDist / maxRadius);
          }
          break;
        }
      }
    }, { passive: false });

    const endTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.activeTouchId) {
          this.activeTouchId = null;
          this.moveVector.x = 0;
          this.moveVector.y = 0;
          this.moveVector.isMoving = false;
          break;
        }
      }
    };

    canvas.addEventListener('touchend', endTouch);
    canvas.addEventListener('touchcancel', endTouch);
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') this.isDashTriggered = true;
      if (e.code === 'KeyJ') this.isAttackPressed = true;
      if (e.code === 'KeyK') this.isSkill1Triggered = true;
      if (e.code === 'KeyL') this.isSkill2Triggered = true;
      this.updateKeyboardVector();
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyJ') this.isAttackPressed = false;
      this.updateKeyboardVector();
    });
  }

  private updateKeyboardVector() {
    let kx = 0;
    let ky = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) ky -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) ky += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) kx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) kx += 1;

    if (kx !== 0 || ky !== 0) {
      const len = Math.sqrt(kx * kx + ky * ky);
      this.moveVector.x = kx / len;
      this.moveVector.y = ky / len;
      this.moveVector.isMoving = true;
    } else if (this.activeTouchId === null) {
      this.moveVector.x = 0;
      this.moveVector.y = 0;
      this.moveVector.isMoving = false;
    }
  }

  public consumeDash(): boolean {
    const triggered = this.isDashTriggered;
    this.isDashTriggered = false;
    return triggered;
  }

  public consumeSkill1(): boolean {
    const triggered = this.isSkill1Triggered;
    this.isSkill1Triggered = false;
    return triggered;
  }

  public consumeSkill2(): boolean {
    const triggered = this.isSkill2Triggered;
    this.isSkill2Triggered = false;
    return triggered;
  }
}
