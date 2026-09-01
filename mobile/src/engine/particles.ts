/**
 * High-Performance Object-Pooled Particle & Floating Text Engine
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  active: boolean;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  active: boolean;
  scale: number;
}

export class ParticleEngine {
  private pool: Particle[] = [];
  private textPool: FloatingText[] = [];
  public screenShake: number = 0;

  constructor(poolSize: number = 600) {
    for (let i = 0; i < poolSize; i++) {
      this.pool.push({
        x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#fff', alpha: 1, active: false
      });
    }
    for (let i = 0; i < 50; i++) {
      this.textPool.push({
        x: 0, y: 0, text: '', color: '#fff', life: 0, maxLife: 1, active: false, scale: 1
      });
    }
  }

  public emit(x: number, y: number, count: number, color: string, speed: number = 2, size: number = 4) {
    let emitted = 0;
    for (const p of this.pool) {
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        const angle = Math.random() * Math.PI * 2;
        const s = (Math.random() * 0.8 + 0.2) * speed;
        p.vx = Math.cos(angle) * s;
        p.vy = Math.sin(angle) * s;
        p.maxLife = Math.random() * 0.4 + 0.2;
        p.life = p.maxLife;
        p.color = color;
        p.size = size;
        p.alpha = 1;
        emitted++;
        if (emitted >= count) break;
      }
    }
  }

  public spawnFloatingText(x: number, y: number, text: string, color: string = '#ffd600', isCrit: boolean = false) {
    for (const t of this.textPool) {
      if (!t.active) {
        t.active = true;
        t.x = x + (Math.random() * 20 - 10);
        t.y = y - 10;
        t.text = text;
        t.color = color;
        t.maxLife = 0.6;
        t.life = t.maxLife;
        t.scale = isCrit ? 1.6 : 1.0;
        break;
      }
    }
  }

  public triggerShake(intensity: number = 6) {
    this.screenShake = intensity;
  }

  public update(dt: number) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    for (const p of this.pool) {
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
        } else {
          p.x += p.vx * 60 * dt;
          p.y += p.vy * 60 * dt;
          p.alpha = p.life / p.maxLife;
        }
      }
    }

    for (const t of this.textPool) {
      if (t.active) {
        t.life -= dt;
        if (t.life <= 0) {
          t.active = false;
        } else {
          t.y -= 30 * dt;
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.pool) {
      if (p.active) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const t of this.textPool) {
      if (t.active) {
        const alpha = t.life / t.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = t.color;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(t.text, t.x, t.y);
      }
    }
    ctx.restore();
  }
}
