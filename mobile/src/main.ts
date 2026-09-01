import { GameLoop } from './engine/game_loop';
import { ParticleEngine } from './engine/particles';
import { InputManager } from './engine/input';
import { sound } from './engine/audio';
import { CombatSystem, PlayerHero } from './game/combat';
import { DungeonManager, RoomLayout } from './game/dungeon';
import { store } from './state/store';
import { UIManager } from './ui/hud';
import { MenuRenderer } from './ui/menus';
import { ApiClient } from './api/client';

class GameApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ParticleEngine;
  private input: InputManager;
  private combat: CombatSystem;
  private loop: GameLoop;
  
  private currentRoom: RoomLayout | null = null;
  private hero: PlayerHero;
  private attackTimer: number = 0;
  private bossRageTimer: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.particles = new ParticleEngine(800);
    this.input = new InputManager(this.canvas);
    this.combat = new CombatSystem();

    this.hero = {
      id: 'hero_blaze',
      name: 'Blaze',
      x: 300,
      y: 400,
      vx: 0,
      vy: 0,
      radius: 18,
      maxHp: 600,
      hp: 600,
      speed: 180,
      iFrameTimer: 0,
      dashCooldown: 0,
      skill1Cooldown: 0,
      skill2Cooldown: 0,
      primaryElement: 'PYRO',
      secondaryElement: 'GALE',
      weaponTier: 1,
      comboCount: 0,
      comboTimer: 0,
      skill1Name: 'Wind Whirlwind',
      skill2Name: 'Fire Blast'
    };

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );

    this.init();
  }

  private async init() {
    await ApiClient.autoLoginGuest();

    store.subscribe(() => {
      UIManager.renderTopBar();
      UIManager.renderNavigation();
      MenuRenderer.renderCurrentScreen(() => this.startRiftCombat());
      this.updateHUD();
    });

    this.loop.start();
  }

  private handleResize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  public startRiftCombat() {
    const state = store.getState();
    const activeHeroDef = state.heroes.find(h => h.id === state.activeHeroId) || state.heroes[0];
    const skills = state.skillPointsAllocated[activeHeroDef.id] || { attack: 0, comboRadius: 0, health: 0 };

    this.hero.id = activeHeroDef.id;
    this.hero.name = activeHeroDef.name;
    this.hero.maxHp = activeHeroDef.baseHp + (skills.health * 60);
    this.hero.hp = this.hero.maxHp;
    this.hero.speed = activeHeroDef.baseSpeed;
    this.hero.primaryElement = activeHeroDef.primaryElement;
    this.hero.secondaryElement = activeHeroDef.secondaryElement;
    this.hero.skill1Name = activeHeroDef.skill1Name;
    this.hero.skill2Name = activeHeroDef.skill2Name;
    this.hero.weaponTier = state.equippedWeapon.tier;
    
    this.hero.x = window.innerWidth / 2;
    this.hero.y = window.innerHeight / 2 + 100;
    
    this.currentRoom = DungeonManager.generateRoom(state.currentFloor, window.innerWidth, window.innerHeight);
    store.setState({ screen: 'RIFT_COMBAT' });
    sound.playLevelUp();
    UIManager.showToast(`Floor ${state.currentFloor}: Battle Start!`);
  }

  private update(dt: number) {
    const state = store.getState();
    this.particles.update(dt);

    if (state.screen !== 'RIFT_COMBAT' || !this.currentRoom) {
      return;
    }

    // Hero movement
    if (this.input.moveVector.isMoving) {
      this.hero.x += this.input.moveVector.x * this.hero.speed * dt;
      this.hero.y += this.input.moveVector.y * this.hero.speed * dt;

      if (Math.random() < 0.2) {
        this.particles.emit(this.hero.x, this.hero.y + 12, 1, '#00f0ff', 0.5, 2);
      }
    }

    // Clamp hero inside arena
    this.hero.x = Math.max(30, Math.min(window.innerWidth - 30, this.hero.x));
    this.hero.y = Math.max(70, Math.min(window.innerHeight - 70, this.hero.y));

    // Timers
    if (this.hero.iFrameTimer > 0) this.hero.iFrameTimer -= dt;
    if (this.hero.dashCooldown > 0) this.hero.dashCooldown -= dt;
    if (this.hero.skill1Cooldown > 0) this.hero.skill1Cooldown -= dt;
    if (this.hero.skill2Cooldown > 0) this.hero.skill2Cooldown -= dt;

    if (this.hero.comboTimer > 0) {
      this.hero.comboTimer -= dt;
      if (this.hero.comboTimer <= 0) this.hero.comboCount = 0;
    }

    // Dash
    if (this.input.consumeDash() && this.hero.dashCooldown <= 0) {
      this.hero.dashCooldown = 1.1;
      this.hero.iFrameTimer = 0.3; // 0.3s invulnerability
      const angle = this.input.moveVector.isMoving ? Math.atan2(this.input.moveVector.y, this.input.moveVector.x) : 0;
      this.hero.x += Math.cos(angle) * 120;
      this.hero.y += Math.sin(angle) * 120;
      this.particles.emit(this.hero.x, this.hero.y, 22, '#00f0ff', 4.5, 3);
      sound.playSlash();
    }

    // Auto-Target Combat Attacks
    this.attackTimer += dt;
    if (this.attackTimer >= 0.32) {
      this.attackTimer = 0;
      const target = this.findNearestEnemy();
      if (target) {
        const angle = Math.atan2(target.y - this.hero.y, target.x - this.hero.x);
        const baseDmg = 50 + (this.hero.weaponTier - 1) * 16;
        
        let color = '#00f0ff';
        if (this.hero.primaryElement === 'PYRO') color = '#ff5500';
        if (this.hero.primaryElement === 'VOLT') color = '#ffd600';
        if (this.hero.primaryElement === 'CRYO') color = '#76ffff';
        if (this.hero.primaryElement === 'VOID') color = '#a855f7';

        this.combat.spawnProjectile(
          this.hero.x, this.hero.y, angle, 440, baseDmg, this.hero.primaryElement, true, color
        );
        sound.playSlash();
      }
    }

    // Skill 1 (Combos with primary weapon)
    if (this.input.consumeSkill1() && this.hero.skill1Cooldown <= 0) {
      this.hero.skill1Cooldown = 3.6;
      sound.playResonanceDetonation();
      this.particles.triggerShake(8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        this.combat.spawnProjectile(this.hero.x, this.hero.y, a, 320, 65, this.hero.secondaryElement, true, '#76ffff', 8, 2);
      }
    }

    // Skill 2 (Ultimate Blast)
    if (this.input.consumeSkill2() && this.hero.skill2Cooldown <= 0) {
      this.hero.skill2Cooldown = 5.5;
      sound.playResonanceDetonation();
      this.particles.triggerShake(14);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        this.combat.spawnProjectile(this.hero.x, this.hero.y, a, 290, 95, this.hero.primaryElement, true, '#ffd600', 10, 3);
      }
    }

    // Update Enemies AI & Boss Overdrive
    for (const enemy of this.currentRoom.enemies) {
      if (enemy.isDead) continue;

      if (enemy.elementTimer > 0) {
        enemy.elementTimer -= dt;
        if (enemy.elementTimer <= 0) enemy.appliedElement = null;
      }

      const dx = this.hero.x - enemy.x;
      const dy = this.hero.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > enemy.radius + this.hero.radius + 5) {
        enemy.x += (dx / dist) * enemy.speed * dt;
        enemy.y += (dy / dist) * enemy.speed * dt;
      }

      // Boss Spiral Lasers (<50% HP)
      if (enemy.type === 'RIFT_GUARDIAN_BOSS' && enemy.hp < enemy.maxHp * 0.5) {
        this.bossRageTimer += dt;
        if (this.bossRageTimer > 0.38) {
          this.bossRageTimer = 0;
          const a = (Date.now() / 200) % (Math.PI * 2);
          this.combat.spawnProjectile(enemy.x, enemy.y, a, 200, 25, 'VOID', false, '#ef4444', 7);
          this.combat.spawnProjectile(enemy.x, enemy.y, a + Math.PI, 200, 25, 'VOID', false, '#ef4444', 7);
        }
      }

      // Normal Attack
      enemy.attackCooldown -= dt;
      if (enemy.attackCooldown <= 0 && dist < enemy.telegraphRadius + 20) {
        enemy.attackCooldown = 1.8;
        this.combat.hitHero(this.hero, 35, this.particles);
      }
    }

    // Update Projectiles
    this.combat.updateProjectiles(dt, this.currentRoom.enemies, this.hero, this.particles);

    // Check Room Clear
    const remainingEnemies = this.currentRoom.enemies.filter(e => !e.isDead);
    if (remainingEnemies.length === 0 && !this.currentRoom.isCleared) {
      this.currentRoom.isCleared = true;
      sound.playLevelUp();
      UIManager.showToast('ROOM CLEARED! Choose a Portal');
    }

    // Check Player Defeat
    if (this.hero.hp <= 0) {
      UIManager.showToast('Hero Down! Returning to Base.');
      store.setState({
        screen: 'EXTRACTION_SUMMARY',
        currentRunScore: this.combat.totalDamageDealt,
        pendingCrystals: 150,
        pendingVoidShards: 0
      });
    }

    this.updateHUD();
  }

  private findNearestEnemy() {
    if (!this.currentRoom) return null;
    let nearest = null;
    let minDist = 420;
    for (const e of this.currentRoom.enemies) {
      if (!e.isDead) {
        const dist = Math.hypot(e.x - this.hero.x, e.y - this.hero.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = e;
        }
      }
    }
    return nearest;
  }

  private updateHUD() {
    const hud = document.getElementById('hud-container');
    if (!hud) return;

    const state = store.getState();
    if (state.screen !== 'RIFT_COMBAT') {
      hud.innerHTML = '';
      return;
    }

    const hpPct = Math.round((this.hero.hp / this.hero.maxHp) * 100);
    const cd1 = Math.max(0, this.hero.skill1Cooldown).toFixed(1);
    const cd2 = Math.max(0, this.hero.skill2Cooldown).toFixed(1);

    hud.innerHTML = `
      <div class="status-bars">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #00f0ff;">
          <span>${this.hero.name} (Lv. ${state.accountLevel})</span>
          <span>HP: ${this.hero.hp}/${this.hero.maxHp}</span>
        </div>
        <div class="bar-container">
          <div class="hp-fill" style="width: ${hpPct}%;"></div>
        </div>
        ${this.hero.comboCount > 2 ? `
          <div style="font-size: 13px; font-weight: 900; color: #ffd600; text-shadow: 0 0 8px rgba(255,214,0,0.6);">
            🔥 ${this.hero.comboCount}x COMBO!
          </div>
        ` : ''}
      </div>

      <div class="combat-hud interactive">
        <button class="skill-btn" id="btn-skill-1" style="border-color: #76ffff;" title="Tap to trigger Element Combo">
          <span>🌀 ${this.hero.skill1Name.split(' ')[0]}</span>
          <span>${this.hero.skill1Cooldown > 0 ? cd1 + 's' : 'READY'}</span>
        </button>
        <button class="skill-btn" id="btn-skill-2" style="border-color: #ffd600;" title="Ultimate Attack">
          <span>⚡ ${this.hero.skill2Name.split(' ')[0]}</span>
          <span>${this.hero.skill2Cooldown > 0 ? cd2 + 's' : 'READY'}</span>
        </button>
        <button class="skill-btn" id="btn-dash" style="border-color: #00f0ff;" title="Dodge Danger">
          <span>⚡ Dodge</span>
        </button>
      </div>
    `;

    document.getElementById('btn-skill-1')?.addEventListener('click', () => { this.input.isSkill1Triggered = true; });
    document.getElementById('btn-skill-2')?.addEventListener('click', () => { this.input.isSkill2Triggered = true; });
    document.getElementById('btn-dash')?.addEventListener('click', () => { this.input.isDashTriggered = true; });
  }

  private render() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.save();
    if (this.particles.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.particles.screenShake;
      const shakeY = (Math.random() - 0.5) * this.particles.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    this.ctx.fillStyle = '#07090e';
    this.ctx.fillRect(0, 0, width, height);

    // Floor Grid
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    const state = store.getState();
    if (state.screen === 'RIFT_COMBAT' && this.currentRoom) {
      // Room Cleared Portals
      if (this.currentRoom.isCleared) {
        // Safe Exit Portal (Green)
        this.ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(width / 2 - 85, height / 2 - 80, 44, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SAFE EXIT', width / 2 - 85, height / 2 - 85);
        this.ctx.font = '10px sans-serif';
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillText('Keep Loot', width / 2 - 85, height / 2 - 70);

        if (Math.hypot(this.hero.x - (width / 2 - 85), this.hero.y - (height / 2 - 80)) < 45) {
          store.setState({
            screen: 'EXTRACTION_SUMMARY',
            currentRunScore: this.combat.totalDamageDealt + (state.currentFloor * 5000),
            pendingCrystals: 400 + state.currentFloor * 150,
            pendingVoidShards: 20
          });
        }

        // High Risk Portal (Purple)
        this.ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        this.ctx.strokeStyle = '#a855f7';
        this.ctx.beginPath();
        this.ctx.arc(width / 2 + 85, height / 2 - 80, 44, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('NEXT FLOOR', width / 2 + 85, height / 2 - 85);
        this.ctx.font = '10px sans-serif';
        this.ctx.fillStyle = '#c084fc';
        this.ctx.fillText('3x Loot!', width / 2 + 85, height / 2 - 70);

        if (Math.hypot(this.hero.x - (width / 2 + 85), this.hero.y - (height / 2 - 80)) < 45) {
          store.setState({ currentFloor: state.currentFloor + 1 });
          this.startRiftCombat();
        }
      }

      // Draw Enemies
      for (const e of this.currentRoom.enemies) {
        if (!e.isDead) {
          // Danger Telegraph Circle
          if (e.attackCooldown < 0.6) {
            this.ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.telegraphRadius, 0, Math.PI * 2);
            this.ctx.fill();
          }

          // Enemy Body
          this.ctx.fillStyle = e.color;
          this.ctx.beginPath();
          this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          this.ctx.fill();

          // Element Affliction
          if (e.appliedElement) {
            let haloColor = '#ff5500';
            if (e.appliedElement === 'CRYO') haloColor = '#76ffff';
            if (e.appliedElement === 'VOLT') haloColor = '#ffd600';
            if (e.appliedElement === 'VOID') haloColor = '#a855f7';

            this.ctx.strokeStyle = haloColor;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.radius + 6, 0, Math.PI * 2);
            this.ctx.stroke();
          }

          // Mini HP Bar
          const hpRatio = e.hp / e.maxHp;
          this.ctx.fillStyle = '#333';
          this.ctx.fillRect(e.x - 16, e.y - e.radius - 10, 32, 4);
          this.ctx.fillStyle = '#ef4444';
          this.ctx.fillRect(e.x - 16, e.y - e.radius - 10, 32 * hpRatio, 4);
        }
      }

      // Draw Projectiles
      for (const p of this.combat.projectiles) {
        if (p.active) {
          this.ctx.fillStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 8;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        }
      }

      // Draw Hero
      this.ctx.save();
      if (this.hero.iFrameTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        this.ctx.globalAlpha = 0.4;
      }
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 14;
      this.ctx.beginPath();
      this.ctx.arc(this.hero.x, this.hero.y, this.hero.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render Particles & Numbers
    this.particles.render(this.ctx);

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
