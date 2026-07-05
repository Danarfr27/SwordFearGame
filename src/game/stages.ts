import type { StageData, EnemySpawn, CollectibleSpawn, Platform, Hazard } from './types';

export const STAGE_COUNT = 20;

function makePlatforms(stageId: number, stageWidth: number): Platform[] {
  const platforms: Platform[] = [];

  switch (stageId) {
    case 1: // Green Plains - flat terrain with small gaps
      for (let i = 0; i < 12; i++) {
        if (i === 4 || i === 9) continue; // gaps
        platforms.push({ x: i * 250, y: 600, w: 250, h: 80, type: 'grass' });
      }
      break;
    case 2: // Wooden Forts - multiple tiers
      platforms.push({ x: 0, y: 600, w: 400, h: 80, type: 'wood' });
      platforms.push({ x: 450, y: 500, w: 300, h: 60, type: 'wood' });
      platforms.push({ x: 800, y: 400, w: 250, h: 60, type: 'wood' });
      platforms.push({ x: 1100, y: 500, w: 300, h: 60, type: 'wood' });
      platforms.push({ x: 1450, y: 600, w: 400, h: 80, type: 'wood' });
      platforms.push({ x: 0, y: 700, w: 2000, h: 100, type: 'grass' });
      break;
    case 3: // Spiked Path - fully connected platforms so enemies stay on the map
      platforms.push({ x: 0, y: 600, w: 2500, h: 60, type: 'stone' });
      platforms.push({ x: 0, y: 520, w: 2500, h: 60, type: 'stone' });
      break;
    case 4: // Moving Towers - moving platforms
      platforms.push({ x: 0, y: 600, w: 300, h: 60, type: 'stone' });
      platforms.push({ x: 400, y: 500, w: 150, h: 40, type: 'moving', moveAxis: 'y', moveSpeed: 60, moveRange: 100, moveOrigin: 500 });
      platforms.push({ x: 650, y: 400, w: 150, h: 40, type: 'moving', moveAxis: 'x', moveSpeed: 50, moveRange: 100, moveOrigin: 650 });
      platforms.push({ x: 900, y: 350, w: 150, h: 40, type: 'moving', moveAxis: 'y', moveSpeed: 70, moveRange: 80, moveOrigin: 350 });
      platforms.push({ x: 1150, y: 450, w: 200, h: 60, type: 'stone' });
      platforms.push({ x: 1400, y: 550, w: 200, h: 40, type: 'moving', moveAxis: 'y', moveSpeed: 50, moveRange: 120, moveOrigin: 550 });
      platforms.push({ x: 1700, y: 600, w: 500, h: 80, type: 'grass' });
      break;
    case 5: // Guard Captain - flat arena
      platforms.push({ x: 0, y: 600, w: 1500, h: 100, type: 'stone' });
      break;
    case 6: // Lava Caverns - platforms over lava
      platforms.push({ x: 0, y: 600, w: 250, h: 60, type: 'stone' });
      platforms.push({ x: 350, y: 550, w: 200, h: 50, type: 'stone' });
      platforms.push({ x: 650, y: 500, w: 180, h: 50, type: 'stone' });
      platforms.push({ x: 900, y: 450, w: 200, h: 50, type: 'stone' });
      platforms.push({ x: 1200, y: 500, w: 180, h: 50, type: 'stone' });
      platforms.push({ x: 1450, y: 550, w: 200, h: 50, type: 'stone' });
      platforms.push({ x: 1750, y: 600, w: 250, h: 60, type: 'stone' });
      platforms.push({ x: 2100, y: 550, w: 200, h: 50, type: 'stone' });
      platforms.push({ x: 2400, y: 600, w: 400, h: 80, type: 'stone' });
      break;
    case 7: // Dual Blades - symmetrical arena
      platforms.push({ x: 0, y: 600, w: 800, h: 100, type: 'stone' });
      platforms.push({ x: 1000, y: 600, w: 800, h: 100, type: 'stone' });
      // Center pit - no platform
      platforms.push({ x: 300, y: 400, w: 200, h: 40, type: 'stone' });
      platforms.push({ x: 1300, y: 400, w: 200, h: 40, type: 'stone' });
      break;
    case 8: // Windy Cliffs
      platforms.push({ x: 0, y: 600, w: 300, h: 60, type: 'grass' });
      platforms.push({ x: 400, y: 550, w: 200, h: 50, type: 'grass' });
      platforms.push({ x: 700, y: 500, w: 250, h: 50, type: 'grass' });
      platforms.push({ x: 1050, y: 450, w: 200, h: 50, type: 'grass' });
      platforms.push({ x: 1350, y: 500, w: 250, h: 50, type: 'grass' });
      platforms.push({ x: 1700, y: 550, w: 200, h: 50, type: 'grass' });
      platforms.push({ x: 2000, y: 600, w: 500, h: 80, type: 'grass' });
      break;
    case 9: // The Gauntlet - long stage with mini fights
      // Section 1
      platforms.push({ x: 0, y: 600, w: 400, h: 80, type: 'stone' });
      // Section 2
      platforms.push({ x: 500, y: 550, w: 300, h: 60, type: 'stone' });
      platforms.push({ x: 900, y: 500, w: 300, h: 60, type: 'stone' });
      // Section 3
      platforms.push({ x: 1300, y: 600, w: 400, h: 80, type: 'stone' });
      // Section 4
      platforms.push({ x: 1800, y: 550, w: 300, h: 60, type: 'stone' });
      platforms.push({ x: 2200, y: 500, w: 300, h: 60, type: 'stone' });
      // Final
      platforms.push({ x: 2600, y: 600, w: 600, h: 80, type: 'stone' });
      break;
    case 10: // Sword King Throne
      platforms.push({ x: 0, y: 600, w: 500, h: 80, type: 'stone' });
      platforms.push({ x: 600, y: 500, w: 200, h: 40, type: 'moving', moveAxis: 'x', moveSpeed: 60, moveRange: 80, moveOrigin: 600 });
      platforms.push({ x: 900, y: 450, w: 300, h: 60, type: 'stone' });
      platforms.push({ x: 1300, y: 500, w: 200, h: 40, type: 'moving', moveAxis: 'y', moveSpeed: 50, moveRange: 100, moveOrigin: 500 });
      platforms.push({ x: 1600, y: 600, w: 500, h: 80, type: 'stone' });
      break;
    case 11: // Crystal Mine
      platforms.push({ x: 0, y: 620, w: 2800, h: 80, type: 'stone' });
      platforms.push({ x: 400, y: 520, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 800, y: 460, w: 200, h: 40, type: 'stone' });
      platforms.push({ x: 1200, y: 520, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1700, y: 460, w: 240, h: 40, type: 'stone' });
      platforms.push({ x: 2150, y: 520, w: 180, h: 40, type: 'stone' });
      break;
    case 12: // Frost Spire
      platforms.push({ x: 0, y: 620, w: 2400, h: 80, type: 'stone' });
      platforms.push({ x: 450, y: 520, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 800, y: 430, w: 160, h: 40, type: 'stone' });
      platforms.push({ x: 1050, y: 350, w: 160, h: 40, type: 'stone' });
      platforms.push({ x: 1350, y: 280, w: 160, h: 40, type: 'stone' });
      platforms.push({ x: 1700, y: 430, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 2050, y: 520, w: 200, h: 40, type: 'stone' });
      break;
    case 13: // Thunder Fields
      platforms.push({ x: 0, y: 600, w: 1400, h: 80, type: 'grass' });
      platforms.push({ x: 1500, y: 560, w: 300, h: 60, type: 'grass' });
      platforms.push({ x: 1900, y: 520, w: 250, h: 50, type: 'grass' });
      platforms.push({ x: 2300, y: 580, w: 300, h: 60, type: 'grass' });
      platforms.push({ x: 2700, y: 520, w: 220, h: 50, type: 'grass' });
      break;
    case 14: // Iron Keep
      platforms.push({ x: 0, y: 600, w: 900, h: 100, type: 'stone' });
      platforms.push({ x: 1100, y: 520, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1500, y: 520, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1900, y: 450, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 2200, y: 600, w: 800, h: 100, type: 'stone' });
      break;
    case 15: // Shadow Labyrinth
      platforms.push({ x: 0, y: 600, w: 1000, h: 80, type: 'stone' });
      platforms.push({ x: 1100, y: 520, w: 200, h: 40, type: 'stone' });
      platforms.push({ x: 1350, y: 450, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 1600, y: 520, w: 200, h: 40, type: 'stone' });
      platforms.push({ x: 1850, y: 450, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 2100, y: 520, w: 250, h: 40, type: 'stone' });
      platforms.push({ x: 2400, y: 600, w: 600, h: 80, type: 'stone' });
      break;
    case 16: // Sky Fortress
      platforms.push({ x: 0, y: 560, w: 300, h: 60, type: 'stone' });
      platforms.push({ x: 420, y: 480, w: 220, h: 40, type: 'moving', moveAxis: 'x', moveSpeed: 70, moveRange: 140, moveOrigin: 420 });
      platforms.push({ x: 900, y: 420, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1250, y: 350, w: 180, h: 40, type: 'moving', moveAxis: 'y', moveSpeed: 60, moveRange: 120, moveOrigin: 350 });
      platforms.push({ x: 1600, y: 460, w: 260, h: 50, type: 'stone' });
      platforms.push({ x: 2050, y: 520, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 2300, y: 560, w: 500, h: 80, type: 'stone' });
      break;
    case 17: // Infernal Depths
      platforms.push({ x: 0, y: 580, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 320, y: 520, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 580, y: 460, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 900, y: 520, w: 200, h: 40, type: 'stone' });
      platforms.push({ x: 1220, y: 460, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1550, y: 520, w: 260, h: 40, type: 'stone' });
      platforms.push({ x: 1900, y: 580, w: 900, h: 80, type: 'stone' });
      break;
    case 18: // Storm Citadel
      platforms.push({ x: 0, y: 620, w: 2600, h: 80, type: 'stone' });
      platforms.push({ x: 500, y: 520, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 900, y: 460, w: 180, h: 40, type: 'moving', moveAxis: 'x', moveSpeed: 80, moveRange: 120, moveOrigin: 900 });
      platforms.push({ x: 1350, y: 400, w: 160, h: 40, type: 'stone' });
      platforms.push({ x: 1700, y: 520, w: 200, h: 40, type: 'stone' });
      platforms.push({ x: 2050, y: 440, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 2400, y: 600, w: 400, h: 80, type: 'stone' });
      break;
    case 19: // Arcane Cathedral
      platforms.push({ x: 0, y: 600, w: 1000, h: 80, type: 'stone' });
      platforms.push({ x: 1050, y: 500, w: 260, h: 40, type: 'stone' });
      platforms.push({ x: 1350, y: 420, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1650, y: 340, w: 180, h: 40, type: 'stone' });
      platforms.push({ x: 1950, y: 460, w: 240, h: 40, type: 'stone' });
      platforms.push({ x: 2250, y: 580, w: 520, h: 80, type: 'stone' });
      break;
    case 20: // Dragon's Lair
      platforms.push({ x: 0, y: 600, w: 1200, h: 100, type: 'stone' });
      platforms.push({ x: 1350, y: 520, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1650, y: 470, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 1950, y: 520, w: 220, h: 40, type: 'stone' });
      platforms.push({ x: 2200, y: 600, w: 800, h: 100, type: 'stone' });
      break;
  }

  const hasBottomFloor = platforms.some(p => p.y >= 650 && p.w >= stageWidth * 0.9);
  if (!hasBottomFloor) {
    const floorType = stageId === 2 ? 'wood' : stageId === 1 || stageId === 8 ? 'grass' : 'stone';
    platforms.push({ x: 0, y: 700, w: stageWidth, h: 100, type: floorType });
  }

  return platforms;
}

function makeHazards(stageId: number): Hazard[] {
  const hazards: Hazard[] = [];

  switch (stageId) {
    case 3: // Spikes on platforms
      hazards.push({ x: 260, y: 580, w: 40, h: 20, type: 'spike', damage: 20 });
      hazards.push({ x: 700, y: 480, w: 40, h: 20, type: 'spike', damage: 20 });
      hazards.push({ x: 1530, y: 580, w: 40, h: 20, type: 'spike', damage: 20 });
      break;
    case 6: // Lava floor
      // Lava is handled by hasLavaFloor flag
      hazards.push({ x: 250, y: 650, w: 100, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 550, y: 650, w: 100, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 880, y: 650, w: 100, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 1380, y: 650, w: 100, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 1700, y: 650, w: 100, h: 30, type: 'lava', damage: 30 });
      break;
    case 12: // Frost spikes
      hazards.push({ x: 500, y: 500, w: 40, h: 20, type: 'spike', damage: 20 });
      hazards.push({ x: 950, y: 410, w: 40, h: 20, type: 'spike', damage: 20 });
      hazards.push({ x: 1350, y: 330, w: 40, h: 20, type: 'spike', damage: 20 });
      break;
    case 17: // Infernal lava floor
      hazards.push({ x: 0, y: 640, w: 220, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 320, y: 640, w: 180, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 580, y: 640, w: 220, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 900, y: 640, w: 200, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 1220, y: 640, w: 220, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 1550, y: 640, w: 260, h: 30, type: 'lava', damage: 30 });
      hazards.push({ x: 1900, y: 640, w: 900, h: 30, type: 'lava', damage: 30 });
      break;
    case 20: // Dragon's arena
      hazards.push({ x: 600, y: 560, w: 50, h: 50, type: 'saw', damage: 25, moveAxis: 'y', moveSpeed: 80, moveRange: 150 });
      hazards.push({ x: 1500, y: 520, w: 50, h: 50, type: 'saw', damage: 25, moveAxis: 'x', moveSpeed: 70, moveRange: 120 });
      break;
    case 10: // Castle hazards - saw blades
      hazards.push({ x: 550, y: 400, w: 50, h: 50, type: 'saw', damage: 25, moveAxis: 'y', moveSpeed: 80, moveRange: 150 });
      hazards.push({ x: 1250, y: 350, w: 50, h: 50, type: 'saw', damage: 25, moveAxis: 'x', moveSpeed: 70, moveRange: 100 });
      break;
  }

  return hazards;
}

function makeEnemies(stageId: number): EnemySpawn[] {
  const enemies: EnemySpawn[] = [];

  switch (stageId) {
    case 1:
      enemies.push({ type: 'rookie', x: 800, y: 500, level: 1 });
      enemies.push({ type: 'rookie', x: 1500, y: 500, level: 1 });
      enemies.push({ type: 'rookie', x: 2200, y: 500, level: 2, isBoss: true });
      break;
    case 2:
      enemies.push({ type: 'rookie', x: 600, y: 400, level: 2 });
      enemies.push({ type: 'spearman', x: 1200, y: 400, level: 2 });
      enemies.push({ type: 'spearman', x: 1800, y: 500, level: 3, isBoss: true });
      break;
    case 3:
      enemies.push({ type: 'rogue', x: 500, y: 450, level: 3 });
      enemies.push({ type: 'rogue', x: 1100, y: 450, level: 3 });
      enemies.push({ type: 'rogue', x: 1800, y: 420, level: 3, isBoss: true });
      break;
    case 4:
      enemies.push({ type: 'archer', x: 800, y: 300, level: 4 });
      enemies.push({ type: 'spearman', x: 1300, y: 400, level: 4 });
      enemies.push({ type: 'archer', x: 1900, y: 500, level: 5, isBoss: true });
      break;
    case 5:
      enemies.push({ type: 'captain', x: 1000, y: 500, level: 5, isBoss: true });
      break;
    case 6:
      enemies.push({ type: 'berserker', x: 500, y: 450, level: 6 });
      enemies.push({ type: 'rogue', x: 1000, y: 350, level: 5 });
      enemies.push({ type: 'berserker', x: 1900, y: 450, level: 7, isBoss: true });
      break;
    case 7:
      enemies.push({ type: 'assassin', x: 300, y: 500, level: 6 });
      enemies.push({ type: 'assassin', x: 1400, y: 500, level: 6 });
      break;
    case 8:
      enemies.push({ type: 'mage', x: 800, y: 400, level: 8 });
      enemies.push({ type: 'rogue', x: 1400, y: 400, level: 7 });
      enemies.push({ type: 'mage', x: 2200, y: 500, level: 9, isBoss: true });
      break;
    case 9:
      enemies.push({ type: 'berserker', x: 300, y: 500, level: 7 });
      enemies.push({ type: 'assassin', x: 700, y: 400, level: 7 });
      enemies.push({ type: 'paladin', x: 1500, y: 500, level: 8 });
      enemies.push({ type: 'mage', x: 2000, y: 400, level: 8 });
      enemies.push({ type: 'paladin', x: 2800, y: 500, level: 9, isBoss: true });
      break;
    case 10:
      enemies.push({ type: 'assassin', x: 800, y: 400, level: 9 });
      enemies.push({ type: 'boss', x: 1800, y: 500, level: 10, isBoss: true });
      break;
    case 11:
      enemies.push({ type: 'rogue', x: 600, y: 520, level: 9 });
      enemies.push({ type: 'archer', x: 1100, y: 420, level: 10 });
      enemies.push({ type: 'spearman', x: 1500, y: 520, level: 10 });
      enemies.push({ type: 'paladin', x: 2150, y: 520, level: 12, isBoss: true });
      break;
    case 12:
      enemies.push({ type: 'mage', x: 700, y: 430, level: 12 });
      enemies.push({ type: 'rogue', x: 1000, y: 430, level: 11 });
      enemies.push({ type: 'assassin', x: 1450, y: 350, level: 12 });
      enemies.push({ type: 'mage', x: 1800, y: 430, level: 13, isBoss: true });
      break;
    case 13:
      enemies.push({ type: 'rogue', x: 400, y: 550, level: 12 });
      enemies.push({ type: 'rogue', x: 900, y: 520, level: 13 });
      enemies.push({ type: 'archer', x: 1600, y: 520, level: 13 });
      enemies.push({ type: 'berserker', x: 2350, y: 520, level: 14, isBoss: true });
      break;
    case 14:
      enemies.push({ type: 'captain', x: 700, y: 520, level: 14 });
      enemies.push({ type: 'paladin', x: 1200, y: 520, level: 15 });
      enemies.push({ type: 'mage', x: 1750, y: 450, level: 14 });
      enemies.push({ type: 'paladin', x: 2150, y: 520, level: 16, isBoss: true });
      break;
    case 15:
      enemies.push({ type: 'assassin', x: 500, y: 520, level: 14 });
      enemies.push({ type: 'rogue', x: 950, y: 520, level: 15 });
      enemies.push({ type: 'mage', x: 1300, y: 450, level: 15 });
      enemies.push({ type: 'boss', x: 2100, y: 520, level: 17, isBoss: true });
      break;
    case 16:
      enemies.push({ type: 'rogue', x: 350, y: 520, level: 15 });
      enemies.push({ type: 'archer', x: 850, y: 450, level: 15 });
      enemies.push({ type: 'mage', x: 1300, y: 350, level: 16 });
      enemies.push({ type: 'assassin', x: 1750, y: 520, level: 16 });
      enemies.push({ type: 'paladin', x: 2150, y: 520, level: 17, isBoss: true });
      break;
    case 17:
      enemies.push({ type: 'berserker', x: 250, y: 540, level: 16 });
      enemies.push({ type: 'assassin', x: 700, y: 480, level: 16 });
      enemies.push({ type: 'mage', x: 1150, y: 420, level: 17 });
      enemies.push({ type: 'paladin', x: 1600, y: 520, level: 18 });
      enemies.push({ type: 'boss', x: 2000, y: 560, level: 18, isBoss: true });
      break;
    case 18:
      enemies.push({ type: 'rogue', x: 500, y: 520, level: 17 });
      enemies.push({ type: 'mage', x: 950, y: 460, level: 17 });
      enemies.push({ type: 'assassin', x: 1350, y: 400, level: 17 });
      enemies.push({ type: 'paladin', x: 1850, y: 520, level: 18 });
      enemies.push({ type: 'boss', x: 2350, y: 520, level: 19, isBoss: true });
      break;
    case 19:
      enemies.push({ type: 'mage', x: 800, y: 520, level: 18 });
      enemies.push({ type: 'archer', x: 1200, y: 460, level: 18 });
      enemies.push({ type: 'rogue', x: 1600, y: 420, level: 18 });
      enemies.push({ type: 'paladin', x: 2000, y: 520, level: 19 });
      enemies.push({ type: 'boss', x: 2350, y: 520, level: 20, isBoss: true });
      break;
    case 20:
      enemies.push({ type: 'paladin', x: 700, y: 520, level: 19 });
      enemies.push({ type: 'mage', x: 1100, y: 450, level: 19 });
      enemies.push({ type: 'assassin', x: 1500, y: 520, level: 19 });
      enemies.push({ type: 'boss', x: 2050, y: 520, level: 22, isBoss: true });
      break;
  }

  return enemies;
}

function makeCollectibles(stageId: number): CollectibleSpawn[] {
  const items: CollectibleSpawn[] = [];
  const stageWidth = getStageWidth(stageId);

  // Add coins throughout the stage
  for (let x = 200; x < stageWidth - 200; x += 150) {
    if (Math.random() > 0.5) {
      items.push({ type: 'coin', x, y: 400 + Math.random() * 100 });
    }
  }

  // Add hearts at key points
  items.push({ type: 'heart', x: stageWidth * 0.3, y: 400 });
  items.push({ type: 'heart', x: stageWidth * 0.7, y: 400 });

  // Add special orb before boss
  const bossX = stageWidth * 0.85;
  items.push({ type: 'special', x: bossX - 100, y: 450 });

  return items;
}

function getStageWidth(stageId: number): number {
  const widths = [2500, 2000, 2500, 2300, 1500, 2800, 1800, 2600, 3300, 2200,
    2800, 2400, 3000, 2500, 2600, 2600, 2800, 2700, 2600, 3000];
  return widths[stageId - 1] || 2000;
}

export function createStageData(stageId: number): StageData {
  const bgImages: Record<number, string> = {
    1: '/assets/bg_title.jpg',
    2: '/assets/bg_title.jpg',
    3: '/assets/bg_cave.jpg',
    4: '/assets/bg_title.jpg',
    5: '/assets/bg_castle.jpg',
    6: '/assets/bg_cave.jpg',
    7: '/assets/bg_castle.jpg',
    8: '/assets/bg_title.jpg',
    9: '/assets/bg_cave.jpg',
    10: '/assets/bg_castle.jpg',
    11: '/assets/bg_crystal.jpg',
    12: '/assets/bg_snow.jpg',
    13: '/assets/bg_thunder.jpg',
    14: '/assets/bg_keep.jpg',
    15: '/assets/bg_shadow.jpg',
    16: '/assets/bg_sky.jpg',
    17: '/assets/bg_infernal.jpg',
    18: '/assets/bg_storm.jpg',
    19: '/assets/bg_arcane.jpg',
    20: '/assets/bg_dragon.jpg',
  };

  const bgColors: Record<number, string> = {
    1: '#87CEEB',
    2: '#DEB887',
    3: '#4A4A4A',
    4: '#87CEEB',
    5: '#696969',
    6: '#8B2500',
    7: '#483D8B',
    8: '#4682B4',
    9: '#2F4F4F',
    10: '#4B0082',
    11: '#6CC7D1',
    12: '#E0F2FF',
    13: '#1F3A93',
    14: '#5B5B5B',
    15: '#1F1F2B',
    16: '#7C9ED4',
    17: '#9B2C00',
    18: '#2A3D66',
    19: '#641E8A',
    20: '#3A1206',
  };

  const stageNames: Record<number, string> = {
    1: 'Green Plains',
    2: 'Wooden Forts',
    3: 'Spiked Path',
    4: 'Moving Towers',
    5: 'Guard Captain',
    6: 'Lava Caverns',
    7: 'Dual Blades',
    8: 'Windy Cliffs',
    9: 'The Gauntlet',
    10: 'Sword King Throne',
    11: 'Crystal Mine',
    12: 'Frost Spire',
    13: 'Thunder Fields',
    14: 'Iron Keep',
    15: 'Shadow Labyrinth',
    16: 'Sky Fortress',
    17: 'Infernal Depths',
    18: 'Storm Citadel',
    19: 'Arcane Cathedral',
    20: 'Dragon\'s Lair',
  };

  const themes: Record<number, string> = {
    1: 'grass',
    2: 'wood',
    3: 'cave',
    4: 'sky',
    5: 'arena',
    6: 'fire',
    7: 'temple',
    8: 'storm',
    9: 'dungeon',
    10: 'castle',
    11: 'crystal',
    12: 'ice',
    13: 'storm',
    14: 'fort',
    15: 'shadow',
    16: 'sky',
    17: 'inferno',
    18: 'storm',
    19: 'arcane',
    20: 'dragon',
  };

  const width = getStageWidth(stageId);
  const platforms = makePlatforms(stageId, width);
  const exitX = getStageExitX(platforms, width);

  return {
    id: stageId,
    name: stageNames[stageId],
    theme: themes[stageId],
    width,
    height: 800,
    bgImage: bgImages[stageId],
    bgColor: bgColors[stageId],
    platforms,
    hazards: makeHazards(stageId),
    enemies: makeEnemies(stageId),
    collectibles: makeCollectibles(stageId),
    playerStart: { x: 100, y: 450 },
    exitX,
    windForce: stageId === 8 ? -150 : 0,
    hasLavaFloor: stageId === 6,
  };
}

function getStageExitX(platforms: Platform[], width: number): number {
  if (platforms.length === 0) {
    return Math.max(150, width - 100);
  }

  const bestPlatform = platforms.reduce((best, plat) => {
    const bestRight = best.x + best.w;
    const platRight = plat.x + plat.w;
    return platRight > bestRight ? plat : best;
  }, platforms[0]);

  return Math.max(150, Math.min(width - 100, bestPlatform.x + bestPlatform.w - 100));
}

export function getEnemyStats(type: string, level: number) {
  const baseStats: Record<string, { hp: number; damage: number; defense: number; speed: number; attackRange: number; goldDrop: number }> = {
    rookie: { hp: 50, damage: 8, defense: 2, speed: 80, attackRange: 60, goldDrop: 15 },
    spearman: { hp: 70, damage: 12, defense: 4, speed: 90, attackRange: 80, goldDrop: 20 },
    rogue: { hp: 45, damage: 15, defense: 1, speed: 150, attackRange: 50, goldDrop: 25 },
    archer: { hp: 40, damage: 18, defense: 1, speed: 100, attackRange: 200, goldDrop: 25 },
    captain: { hp: 150, damage: 20, defense: 8, speed: 70, attackRange: 70, goldDrop: 50 },
    berserker: { hp: 120, damage: 25, defense: 3, speed: 120, attackRange: 60, goldDrop: 40 },
    assassin: { hp: 60, damage: 22, defense: 2, speed: 180, attackRange: 50, goldDrop: 35 },
    mage: { hp: 80, damage: 30, defense: 2, speed: 60, attackRange: 250, goldDrop: 45 },
    paladin: { hp: 200, damage: 28, defense: 10, speed: 60, attackRange: 70, goldDrop: 60 },
    boss: { hp: 500, damage: 35, defense: 12, speed: 90, attackRange: 90, goldDrop: 200 },
  };

  const base = baseStats[type] || baseStats.rookie;
  const levelMult = 1 + (level - 1) * 0.3;

  return {
    hp: Math.floor(base.hp * levelMult),
    damage: Math.floor(base.damage * levelMult),
    defense: Math.floor(base.defense * levelMult),
    speed: base.speed,
    attackRange: base.attackRange,
    goldDrop: Math.floor(base.goldDrop * levelMult),
  };
}

export const WEAPON_UPGRADES = [
  { level: 1, name: 'Iron Sword', damage: 10, cost: 0 },
  { level: 2, name: 'Steel Blade', damage: 15, cost: 100 },
  { level: 3, name: 'Silver Sword', damage: 22, cost: 250 },
  { level: 4, name: 'Golden Flame', damage: 32, cost: 500 },
  { level: 5, name: 'Crystal Blade', damage: 45, cost: 1000 },
  { level: 6, name: 'Dragon Slayer', damage: 60, cost: 2000 },
  { level: 7, name: 'Legendary Blade', damage: 80, cost: 4000 },
];

export const HP_UPGRADES = [
  { level: 1, hpBonus: 0, cost: 0 },
  { level: 2, hpBonus: 25, cost: 80 },
  { level: 3, hpBonus: 50, cost: 200 },
  { level: 4, hpBonus: 75, cost: 400 },
  { level: 5, hpBonus: 100, cost: 800 },
  { level: 6, hpBonus: 150, cost: 1500 },
  { level: 7, hpBonus: 200, cost: 3000 },
];

export const SPECIAL_UPGRADES = [
  { level: 1, specialBonus: 0, cost: 0 },
  { level: 2, specialBonus: 15, cost: 120 },
  { level: 3, specialBonus: 30, cost: 300 },
  { level: 4, specialBonus: 50, cost: 600 },
  { level: 5, specialBonus: 75, cost: 1200 },
  { level: 6, specialBonus: 100, cost: 2500 },
];
