// Game Types

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type GameScreen = 'menu' | 'lobby' | 'playing' | 'paused' | 'gameover' | 'victory' | 'howtoplay' | 'upgrade';

export type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'attack2' | 'attack3' | 'block' | 'hurt' | 'death' | 'special';

export type EnemyType = 'rookie' | 'spearman' | 'rogue' | 'archer' | 'captain' | 'berserker' | 'assassin' | 'mage' | 'paladin' | 'boss';

export type EnemyState = 'idle' | 'run' | 'jump' | 'attack' | 'hurt' | 'death' | 'special';

export interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  facing: number; // 1 = right, -1 = left
  onGround: boolean;
}

export interface Player extends Entity {
  state: PlayerState;
  stateTimer: number;
  comboCount: number;
  comboTimer: number;
  specialMeter: number;
  maxSpecialMeter: number;
  isBlocking: boolean;
  blockStamina: number;
  maxBlockStamina: number;
  invincible: boolean;
  invincibleTimer: number;
  attackCooldown: number;
  specialCooldown: number;
  doubleJumped: boolean;
}

export interface Enemy extends Entity {
  type: EnemyType;
  state: EnemyState;
  stateTimer: number;
  level: number;
  damage: number;
  defense: number;
  speed: number;
  attackRange: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  detectionRange: number;
  invincible: boolean;
  invincibleTimer: number;
  aiAggression: number;
  aiState: 'patrol' | 'chase' | 'attack' | 'hurt';
  patrolDirection: number;
  patrolTimer: number;
  goldDrop: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'grass' | 'wood' | 'stone' | 'moving';
  moveAxis?: 'x' | 'y';
  moveSpeed?: number;
  moveRange?: number;
  moveOrigin?: number;
}

export interface Hazard {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'lava' | 'saw';
  damage: number;
  moveAxis?: 'x' | 'y';
  moveSpeed?: number;
  moveRange?: number;
}

export interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'heart' | 'special';
  value: number;
  collected: boolean;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: boolean;
}

export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  life: number;
  color: string;
  vy: number;
}

export interface StageData {
  id: number;
  name: string;
  theme: string;
  width: number;
  height: number;
  bgImage: string;
  bgColor: string;
  platforms: Platform[];
  hazards: Hazard[];
  enemies: EnemySpawn[];
  collectibles: CollectibleSpawn[];
  playerStart: Vector2;
  exitX: number;
  windForce?: number;
  hasLavaFloor?: boolean;
}

export interface EnemySpawn {
  type: EnemyType;
  x: number;
  y: number;
  level: number;
  isBoss?: boolean;
}

export interface CollectibleSpawn {
  type: 'coin' | 'heart' | 'special';
  x: number;
  y: number;
}

export interface GameState {
  screen: GameScreen;
  currentStage: number;
  player: Player;
  enemies: Enemy[];
  platforms: Platform[];
  hazards: Hazard[];
  collectibles: Collectible[];
  particles: Particle[];
  damageNumbers: DamageNumber[];
  camera: Vector2;
  stageWidth: number;
  stageHeight: number;
  bgImage: string;
  bgColor: string;
  gold: number;
  score: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number;
  stageCleared: boolean;
  exitUnlocked: boolean;
  exitX: number;
  windForce: number;
  hasLavaFloor: boolean;
  screenShake: { intensity: number; duration: number; timer: number };
}

export interface SaveData {
  gold: number;
  weaponLevel: number;
  hpLevel: number;
  specialLevel: number;
  stagesUnlocked: boolean[];
  stageStars: number[];
  stageBestScores: number[];
}

export interface WeaponUpgrade {
  level: number;
  name: string;
  damage: number;
  cost: number;
}

export interface UpgradeLevel {
  level: number;
  hpBonus: number;
  specialBonus: number;
  cost: number;
}
