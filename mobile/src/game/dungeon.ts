import { Enemy, EnemyFactory } from './enemy_ai';

export interface RoomLayout {
  floorNumber: number;
  width: number;
  height: number;
  enemies: Enemy[];
  isCleared: boolean;
  biome: string;
  hazardType: string | null;
}

export class DungeonManager {
  public static generateRoom(floorNum: number, arenaWidth: number, arenaHeight: number): RoomLayout {
    const enemies: Enemy[] = [];
    const count = 4 + floorNum * 2;
    const isBossFloor = (floorNum % 5 === 0);

    if (isBossFloor) {
      // Spawn Rift Guardian Boss
      enemies.push(EnemyFactory.create('RIFT_GUARDIAN_BOSS', arenaWidth / 2, arenaHeight / 2 - 100, 1.0 + floorNum * 0.2));
      // Spawn two Brute minions
      enemies.push(EnemyFactory.create('ARMORED_BRUTE', arenaWidth / 2 - 120, arenaHeight / 2 - 50, 1.0));
      enemies.push(EnemyFactory.create('ARMORED_BRUTE', arenaWidth / 2 + 120, arenaHeight / 2 - 50, 1.0));
    } else {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * (arenaWidth - 160) + 80;
        const y = Math.random() * (arenaHeight - 240) + 80;
        const roll = Math.random();
        if (roll < 0.5) {
          enemies.push(EnemyFactory.create('VOID_WISP', x, y, 1.0 + floorNum * 0.1));
        } else if (roll < 0.8) {
          enemies.push(EnemyFactory.create('ARMORED_BRUTE', x, y, 1.0 + floorNum * 0.1));
        } else {
          enemies.push(EnemyFactory.create('VOID_ARCANIST', x, y, 1.0 + floorNum * 0.1));
        }
      }
    }

    return {
      floorNumber: floorNum,
      width: arenaWidth,
      height: arenaHeight,
      enemies,
      isCleared: false,
      biome: isBossFloor ? 'VOID_CORE' : 'FRACTURED_CHASM',
      hazardType: floorNum > 2 ? 'AETHER_INSTABILITY' : null
    };
  }
}
