/**
 * Simple, Powerful Elemental Combo Matrix
 */

export type ElementType = 'PYRO' | 'GALE' | 'CRYO' | 'VOLT' | 'VOID' | 'PHYSICAL';

export interface ResonanceEffect {
  name: string;
  damageMultiplier: number;
  aoeRadius: number;
  color: string;
  effectType: string;
  description: string;
}

export class SynergyManager {
  private static reactions: { [key: string]: ResonanceEffect } = {
    'PYRO+GALE': {
      name: 'FIRE TORNADO',
      damageMultiplier: 2.5,
      aoeRadius: 170,
      color: '#ff5500',
      effectType: 'VORTEX',
      description: 'Massive spinning flame cyclone that burns all nearby enemies!'
    },
    'CRYO+VOLT': {
      name: 'SUPER SHOCK',
      damageMultiplier: 2.8,
      aoeRadius: 150,
      color: '#00e5ff',
      effectType: 'SHATTER',
      description: 'Freezes and electrifies enemies, breaking their armor!'
    },
    'PYRO+VOID': {
      name: 'DARK EXPLOSION',
      damageMultiplier: 3.2,
      aoeRadius: 210,
      color: '#a855f7',
      effectType: 'COLLAPSE',
      description: 'Sucks enemies into a black hole that explodes for huge damage!'
    },
    'CRYO+GALE': {
      name: 'BLIZZARD FREEZE',
      damageMultiplier: 2.2,
      aoeRadius: 180,
      color: '#76ffff',
      effectType: 'FREEZE',
      description: 'Freezes the entire room and boosts critical strike chance!'
    },
    'VOLT+VOID': {
      name: 'MEGA PULSE',
      damageMultiplier: 2.6,
      aoeRadius: 160,
      color: '#ffd600',
      effectType: 'EMP',
      description: 'Shockwave that silences enemy attacks and cools down your skills!'
    }
  };

  public static checkReaction(elemA: ElementType, elemB: ElementType): ResonanceEffect | null {
    if (elemA === 'PHYSICAL' || elemB === 'PHYSICAL' || elemA === elemB) return null;
    const key1 = `${elemA}+${elemB}`;
    const key2 = `${elemB}+${elemA}`;
    return this.reactions[key1] || this.reactions[key2] || null;
  }
}
