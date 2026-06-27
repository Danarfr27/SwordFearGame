import type { StageData, EnemySpawn, CollectibleSpawn, Platform, Hazard } from './types';

function makePlatforms(stageId: number): Platform[] {
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
  const widths = [2500, 2000, 2500, 2300, 1500, 2800, 1800, 2600, 3300, 2200];
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
  };

  const width = getStageWidth(stageId);
  const platforms = makePlatforms(stageId);
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
