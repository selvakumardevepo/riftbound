/**
 * Reactive Client State Store with Simple, Intuitive Terms & Tutorial System
 */

export type GameScreen = 'CITADEL' | 'RIFT_COMBAT' | 'EXTRACTION_SUMMARY' | 'ARMORY' | 'LEADERBOARD' | 'GUILD' | 'WORLD_MAP' | 'HERO_ROSTER' | 'BATTLE_PASS' | 'TUTORIAL';

export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  icon: string;
  primaryElement: 'PYRO' | 'GALE' | 'CRYO' | 'VOLT' | 'VOID';
  secondaryElement: 'PYRO' | 'GALE' | 'CRYO' | 'VOLT' | 'VOID';
  baseHp: number;
  baseSpeed: number;
  description: string;
  skill1Name: string;
  skill2Name: string;
  passivePerk: string;
  isUnlocked: boolean;
}

export interface PlayerWeapon {
  id: string;
  itemId: string;
  name: string;
  tier: number;
  baseDamage: number;
  element: 'PYRO' | 'GALE' | 'CRYO' | 'VOLT' | 'VOID';
}

export interface BattlePassTier {
  tier: number;
  freeReward: string;
  freeClaimed: boolean;
  premiumReward: string;
  premiumClaimed: boolean;
  xpRequired: number;
}

export interface GameState {
  screen: GameScreen;
  userId: string;
  username: string;
  token: string | null;
  accountLevel: number;
  masteryXp: number;
  crystals: number;      // Clean simplified name for soft currency
  voidShards: number;    // Rare material
  starCores: number;     // Premium tokens
  currentSeasonScore: number;
  activeHeroId: string;
  heroes: HeroDefinition[];
  skillPointsAllocated: { [heroId: string]: { attack: number; comboRadius: number; health: number } };
  equippedWeapon: PlayerWeapon;
  currentFloor: number;
  currentRunSessionId: string | null;
  currentRunScore: number;
  pendingCrystals: number;
  pendingVoidShards: number;
  battlePassXp: number;
  battlePassTiers: BattlePassTier[];
  isPremiumPassUnlocked: boolean;
  hasCompletedTutorial: boolean;
}

class StateStore {
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    const cached = localStorage.getItem('riftbound_state_v3');
    if (cached) {
      try {
        this.state = JSON.parse(cached);
      } catch {
        this.state = this.getDefaultState();
      }
    } else {
      this.state = this.getDefaultState();
    }
  }

  private getDefaultState(): GameState {
    const heroes: HeroDefinition[] = [
      {
        id: 'hero_blaze',
        name: 'Blaze',
        title: 'Fire Warrior',
        icon: '🔥',
        primaryElement: 'PYRO',
        secondaryElement: 'GALE',
        baseHp: 600,
        baseSpeed: 180,
        description: 'Fast swordfighter. Shoots fire slashes and launches wind whirlwinds.',
        skill1Name: 'Wind Whirlwind',
        skill2Name: 'Fire Blast',
        passivePerk: '+15% Speed after dodging',
        isUnlocked: true
      },
      {
        id: 'hero_frost',
        name: 'Frost',
        title: 'Ice Knight',
        icon: '❄️',
        primaryElement: 'CRYO',
        secondaryElement: 'VOLT',
        baseHp: 850,
        baseSpeed: 155,
        description: 'Heavy tank with ice shield. Freezes enemies and shocks them with lightning.',
        skill1Name: 'Ice Stasis',
        skill2Name: 'Thunder Burst',
        passivePerk: 'Takes 30% less damage when shielding',
        isUnlocked: true
      },
      {
        id: 'hero_shadow',
        name: 'Shadow',
        title: 'Dark Mage',
        icon: '🔮',
        primaryElement: 'VOID',
        secondaryElement: 'PYRO',
        baseHp: 520,
        baseSpeed: 170,
        description: 'Dark magic master. Creates black holes that pull enemies into giant explosions.',
        skill1Name: 'Black Hole',
        skill2Name: 'Dark Nova',
        passivePerk: 'Combos pull nearby enemies together',
        isUnlocked: true
      },
      {
        id: 'hero_volt',
        name: 'Volt',
        title: 'Thunder Hunter',
        icon: '⚡',
        primaryElement: 'VOLT',
        secondaryElement: 'GALE',
        baseHp: 580,
        baseSpeed: 190,
        description: 'High-speed shooter. Fires rapid lightning beams that pierce through multiple enemies.',
        skill1Name: 'Shock Wave',
        skill2Name: 'Lightning Storm',
        passivePerk: 'Attacks pierce through 1 extra enemy',
        isUnlocked: true
      }
    ];

    const battlePassTiers: BattlePassTier[] = [];
    for (let i = 1; i <= 10; i++) {
      battlePassTiers.push({
        tier: i,
        freeReward: `${i * 200} Crystals 💎`,
        freeClaimed: false,
        premiumReward: i % 3 === 0 ? `Costume: Gold ${heroes[i % 4].name}` : `${i * 30} Dark Shards 🌌`,
        premiumClaimed: false,
        xpRequired: i * 500
      });
    }

    return {
      screen: 'CITADEL',
      userId: 'usr_player_' + Math.random().toString(36).substring(2, 7),
      username: 'Hero Vanguard',
      token: null,
      accountLevel: 1,
      masteryXp: 0,
      crystals: 1500,
      voidShards: 80,
      starCores: 15,
      currentSeasonScore: 0,
      activeHeroId: 'hero_blaze',
      heroes,
      skillPointsAllocated: {
        hero_blaze: { attack: 2, comboRadius: 1, health: 1 },
        hero_frost: { attack: 0, comboRadius: 1, health: 3 },
        hero_shadow: { attack: 3, comboRadius: 1, health: 0 },
        hero_volt: { attack: 2, comboRadius: 2, health: 0 }
      },
      equippedWeapon: {
        id: 'wpn_01',
        itemId: 'wpn_flame_sword',
        name: 'Flame Blade',
        tier: 1,
        baseDamage: 80,
        element: 'PYRO'
      },
      currentFloor: 1,
      currentRunSessionId: null,
      currentRunScore: 0,
      pendingCrystals: 0,
      pendingVoidShards: 0,
      battlePassXp: 1200,
      battlePassTiers,
      isPremiumPassUnlocked: false,
      hasCompletedTutorial: false
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public setState(partial: Partial<GameState>) {
    this.state = { ...this.state, ...partial };
    localStorage.setItem('riftbound_state_v3', JSON.stringify(this.state));
    this.notify();
  }

  public subscribe(fn: (state: GameState) => void): () => void {
    this.listeners.push(fn);
    fn(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    const s = this.getState();
    for (const fn of this.listeners) {
      fn(s);
    }
  }
}

export const store = new StateStore();
