import { ElementType } from './synergies';

export type EnemyType = 'VOID_WISP' | 'ARMORED_BRUTE' | 'VOID_ARCANIST' | 'RIFT_GUARDIAN_BOSS';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxHp: number;
  hp: number;
  type: EnemyType;
  color: string;
  speed: number;
  attackCooldown: number;
  appliedElement: ElementType | null;
  elementTimer: number;
  telegraphTimer: number;
  isTelegraphing: boolean;
  telegraphRadius: number;
  isDead: boolean;
}

export class EnemyFactory {
  public static create(type: EnemyType, x: number, y: number, floorMultiplier: number = 1.0): Enemy {
    const id = 'en_' + Math.random().toString(36).substring(2, 9);
    
    switch (type) {
      case 'VOID_WISP':
        return {
          id, x, y, vx: 0, vy: 0,
          radius: 14,
          maxHp: Math.round(120 * floorMultiplier),
          hp: Math.round(120 * floorMultiplier),
          type,
          color: '#c084fc',
          speed: 85,
          attackCooldown: 1.0,
          appliedElement: null,
          elementTimer: 0,
          telegraphTimer: 0,
          isTelegraphing: false,
          telegraphRadius: 28,
          isDead: false
        };

      case 'ARMORED_BRUTE':
        return {
          id, x, y, vx: 0, vy: 0,
          radius: 24,
          maxHp: Math.round(380 * floorMultiplier),
          hp: Math.round(380 * floorMultiplier),
          type,
          color: '#f97316',
          speed: 45,
          attackCooldown: 2.2,
          appliedElement: null,
          elementTimer: 0,
          telegraphTimer: 0,
          isTelegraphing: false,
          telegraphRadius: 65,
          isDead: false
        };

      case 'VOID_ARCANIST':
        return {
          id, x, y, vx: 0, vy: 0,
          radius: 18,
          maxHp: Math.round(200 * floorMultiplier),
          hp: Math.round(200 * floorMultiplier),
          type,
          color: '#38bdf8',
          speed: 60,
          attackCooldown: 2.5,
          appliedElement: null,
          elementTimer: 0,
          telegraphTimer: 0,
          isTelegraphing: false,
          telegraphRadius: 40,
          isDead: false
        };

      case 'RIFT_GUARDIAN_BOSS':
        return {
          id, x, y, vx: 0, vy: 0,
          radius: 40,
          maxHp: Math.round(1800 * floorMultiplier),
          hp: Math.round(1800 * floorMultiplier),
          type,
          color: '#ef4444',
          speed: 40,
          attackCooldown: 1.8,
          appliedElement: null,
          elementTimer: 0,
          telegraphTimer: 0,
          isTelegraphing: false,
          telegraphRadius: 120,
          isDead: false
        };
    }
  }
}
