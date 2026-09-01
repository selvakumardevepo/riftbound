import { ElementType, SynergyManager } from './synergies';
import { Enemy } from './enemy_ai';
import { ParticleEngine } from '../engine/particles';
import { sound } from '../engine/audio';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  element: ElementType;
  color: string;
  isHero: boolean;
  pierce: number;
  life: number;
  active: boolean;
}

export interface PlayerHero {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxHp: number;
  hp: number;
  speed: number;
  iFrameTimer: number;
  dashCooldown: number;
  skill1Cooldown: number;
  skill2Cooldown: number;
  primaryElement: ElementType;
  secondaryElement: ElementType;
  weaponTier: number;
  comboCount: number;
  comboTimer: number;
  skill1Name: string;
  skill2Name: string;
}

export class CombatSystem {
  public projectiles: Projectile[] = [];
  public totalDamageDealt: number = 0;
  public totalDamageTaken: number = 0;
  public resonancesTriggered: number = 0;

  constructor() {
    for (let i = 0; i < 200; i++) {
      this.projectiles.push({
        x: 0, y: 0, vx: 0, vy: 0, radius: 6, damage: 10,
        element: 'PHYSICAL', color: '#fff', isHero: true,
        pierce: 1, life: 1, active: false
      });
    }
  }

  public spawnProjectile(
    x: number, y: number, angle: number, speed: number,
    damage: number, element: ElementType, isHero: boolean = true,
    color: string = '#00f0ff', radius: number = 6, pierce: number = 1
  ) {
    for (const p of this.projectiles) {
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.damage = damage;
        p.element = element;
        p.isHero = isHero;
        p.color = color;
        p.radius = radius;
        p.pierce = pierce;
        p.life = 2.0;
        break;
      }
    }
  }

  public updateProjectiles(dt: number, enemies: Enemy[], hero: PlayerHero, particles: ParticleEngine) {
    for (const p of this.projectiles) {
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Particle trail
        if (Math.random() < 0.35) {
          particles.emit(p.x, p.y, 1, p.color, 0.5, 2);
        }

        if (p.isHero) {
          // Check collision with enemies
          for (const e of enemies) {
            if (!e.isDead) {
              const dx = p.x - e.x;
              const dy = p.y - e.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < p.radius + e.radius) {
                this.hitEnemy(e, p.damage, p.element, hero, particles);
                p.pierce--;
                if (p.pierce <= 0) {
                  p.active = false;
                  break;
                }
              }
            }
          }
        } else {
          // Enemy projectile hitting player
          if (hero.iFrameTimer <= 0) {
            const dx = p.x - hero.x;
            const dy = p.y - hero.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.radius + hero.radius) {
              this.hitHero(hero, p.damage, particles);
              p.active = false;
            }
          }
        }
      }
    }
  }

  public hitEnemy(enemy: Enemy, baseDamage: number, element: ElementType, hero: PlayerHero, particles: ParticleEngine) {
    let finalDamage = baseDamage;
    let isCrit = Math.random() < 0.28;
    if (isCrit) finalDamage = Math.round(finalDamage * 1.65);

    // Check Resonance reaction
    if (enemy.appliedElement && enemy.appliedElement !== element && enemy.elementTimer > 0) {
      const reaction = SynergyManager.checkReaction(enemy.appliedElement, element);
      if (reaction) {
        finalDamage = Math.round(finalDamage * reaction.damageMultiplier);
        this.resonancesTriggered++;
        particles.triggerShake(8);
        particles.emit(enemy.x, enemy.y, 40, reaction.color, 4.5, 5);
        particles.spawnFloatingText(enemy.x, enemy.y - 20, reaction.name.toUpperCase() + '!', reaction.color, true);
        sound.playResonanceDetonation();
        enemy.appliedElement = null;
        enemy.elementTimer = 0;
      }
    } else if (element !== 'PHYSICAL') {
      enemy.appliedElement = element;
      enemy.elementTimer = 3.2; // 3.2s resonance window
    }

    enemy.hp -= finalDamage;
    this.totalDamageDealt += finalDamage;

    // Combo counter increment
    hero.comboCount++;
    hero.comboTimer = 2.5;

    particles.emit(enemy.x, enemy.y, 8, isCrit ? '#ffd600' : '#ffffff', 2.5, 3);
    particles.spawnFloatingText(enemy.x, enemy.y, finalDamage.toString(), isCrit ? '#ffd600' : '#ffffff', isCrit);

    if (enemy.hp <= 0) {
      enemy.isDead = true;
      particles.emit(enemy.x, enemy.y, 30, enemy.color, 3.5, 4);
      sound.playCrystalHarvest();
    }
  }

  public hitHero(hero: PlayerHero, damage: number, particles: ParticleEngine) {
    if (hero.iFrameTimer > 0) return;
    hero.hp = Math.max(0, hero.hp - damage);
    this.totalDamageTaken += damage;
    hero.iFrameTimer = 0.5; // 0.5s invulnerability upon taking damage
    particles.triggerShake(10);
    particles.emit(hero.x, hero.y, 22, '#ef4444', 3, 3);
    particles.spawnFloatingText(hero.x, hero.y, '-' + damage, '#ef4444', true);
  }
}
