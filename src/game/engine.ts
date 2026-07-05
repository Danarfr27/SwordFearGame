import type {
  GameState, Player, Enemy, SaveData
} from './types';
import { STAGE_COUNT, createStageData, getEnemyStats, WEAPON_UPGRADES, HP_UPGRADES, SPECIAL_UPGRADES } from './stages';
import { playAttackSound, playBlockSound, playSpecialSound, playHitSound, playDamageSound, playCollectSound } from './audio';

// ========== CONSTANTS ==========
const GRAVITY = 900;
const PLAYER_SPEED = 250;
const JUMP_FORCE = -520;
const DOUBLE_JUMP_FORCE = -430;
const TERMINAL_VELOCITY = 700;
const FRICTION = 0.85;
const AIR_FRICTION = 0.95;
const ATTACK_DURATION = 0.25;
const COMBO_WINDOW = 0.8;
const INVINCIBLE_DURATION = 0.6;
const BLOCK_STAMINA_DRAIN = 20;
const BLOCK_STAMINA_REGEN = 15;
const PLAYER_HP_REGEN_RATE = 8;
const SPECIAL_METER_REGEN_RATE = 18;
const SPECIAL_METER_USE_THRESHOLD = 20;
const SPECIAL_METER_PER_HIT = 8;
const SPECIAL_METER_PER_DAMAGE = 3;
const KNOCKBACK_FORCE = 200;

// ========== SAVE SYSTEM ==========
const SAVE_KEY = 'sword_hero_save';

export function loadSave(): SaveData {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const saved: Partial<SaveData> = JSON.parse(data);
      const normalized: SaveData = {
        gold: typeof saved.gold === 'number' ? saved.gold : 500,
        weaponLevel: typeof saved.weaponLevel === 'number' ? saved.weaponLevel : 1,
        hpLevel: typeof saved.hpLevel === 'number' ? saved.hpLevel : 1,
        specialLevel: typeof saved.specialLevel === 'number' ? saved.specialLevel : 1,
        stagesUnlocked: Array.from({ length: STAGE_COUNT }, (_, i) => Boolean(saved.stagesUnlocked?.[i]) || i === 0),
        stageStars: Array.from({ length: STAGE_COUNT }, (_, i) => Number(saved.stageStars?.[i] ?? 0)),
        stageBestScores: Array.from({ length: STAGE_COUNT }, (_, i) => Number(saved.stageBestScores?.[i] ?? 0)),
      };
      return normalized;
    }
  } catch { /* ignore */ }
  return {
    gold: 500,
    weaponLevel: 1,
    hpLevel: 1,
    specialLevel: 1,
    stagesUnlocked: Array.from({ length: STAGE_COUNT }, (_, i) => i === 0),
    stageStars: Array.from({ length: STAGE_COUNT }, () => 0),
    stageBestScores: Array.from({ length: STAGE_COUNT }, () => 0),
  };
}

export function saveSave(data: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// ========== INITIALIZATION ==========
function createPlayer(save: SaveData): Player {
  const hpBonus = HP_UPGRADES[save.hpLevel - 1]?.hpBonus || 0;
  return {
    x: 100, y: 450, w: 40, h: 60,
    vx: 0, vy: 0,
    hp: 100 + hpBonus, maxHp: 100 + hpBonus,
    facing: 1, onGround: false,
    state: 'idle', stateTimer: 0,
    comboCount: 0, comboTimer: 0,
    specialMeter: 0, maxSpecialMeter: 100,
    isBlocking: false,
    blockStamina: 100, maxBlockStamina: 100,
    invincible: false, invincibleTimer: 0,
    attackCooldown: 0, specialCooldown: 0,
    doubleJumped: false,
  };
}

function createEnemy(spawn: { type: string; x: number; y: number; level: number }, _save: SaveData): Enemy {
  const stats = getEnemyStats(spawn.type, spawn.level);
  return {
    x: spawn.x, y: spawn.y, w: 40, h: 60,
    vx: 0, vy: 0,
    hp: stats.hp, maxHp: stats.hp,
    facing: -1, onGround: false,
    type: spawn.type as Enemy['type'],
    state: 'idle', stateTimer: 0,
    level: spawn.level,
    damage: stats.damage,
    defense: stats.defense,
    speed: stats.speed,
    attackRange: stats.attackRange,
    attackCooldown: 1.5,
    currentAttackCooldown: 1,
    detectionRange: 300,
    invincible: false, invincibleTimer: 0,
    aiAggression: 0.5 + (spawn.level * 0.05),
    aiState: 'patrol',
    patrolDirection: -1,
    patrolTimer: 0,
    goldDrop: stats.goldDrop,
  };
}

export function initGameState(stageId: number, save: SaveData): GameState {
  const stage = createStageData(stageId);
  const player = createPlayer(save);
  player.x = stage.playerStart.x;
  player.y = stage.playerStart.y;

  const enemies = stage.enemies.map(s => createEnemy(s, save));
  const collectibles = stage.collectibles.map(c => ({
    ...c,
    value: c.type === 'coin' ? 10 : c.type === 'heart' ? 25 : 0,
    collected: false,
    bobOffset: Math.random() * Math.PI * 2
  }));

  return {
    screen: 'playing',
    currentStage: stageId,
    player,
    enemies,
    platforms: stage.platforms,
    hazards: stage.hazards,
    collectibles,
    particles: [],
    damageNumbers: [],
    camera: { x: 0, y: 0 },
    stageWidth: stage.width,
    stageHeight: stage.height,
    bgImage: stage.bgImage,
    bgColor: stage.bgColor,
    gold: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeElapsed: 0,
    stageCleared: false,
    exitUnlocked: false,
    exitX: stage.exitX,
    windForce: stage.windForce || 0,
    hasLavaFloor: stage.hasLavaFloor || false,
    screenShake: { intensity: 0, duration: 0, timer: 0 },
  };
}

// ========== INPUT HANDLING ==========
export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  jumpPressed: boolean;
  attack: boolean;
  block: boolean;
  special: boolean;
  pause: boolean;
}

export function createInputState(): InputState {
  return { left: false, right: false, up: false, jumpPressed: false, attack: false, block: false, special: false, pause: false };
}

// ========== COLLISION ==========
function rectIntersect(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resolvePlatformCollision(entity: { x: number; y: number; w: number; h: number; vx: number; vy: number }, platform: { x: number; y: number; w: number; h: number }): boolean {
  const entityBottom = entity.y + entity.h;
  const entityRight = entity.x + entity.w;
  const platBottom = platform.y + platform.h;
  const platRight = platform.x + platform.w;

  if (entity.x < platRight && entityRight > platform.x && entity.y < platBottom && entityBottom > platform.y) {
    const overlapTop = entityBottom - platform.y;
    const overlapBottom = platBottom - entity.y;
    const overlapLeft = entityRight - platform.x;
    const overlapRight = platRight - entity.x;

    const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

    if (minOverlap === overlapTop && entity.vy >= 0) {
      entity.y = platform.y - entity.h;
      entity.vy = 0;
      return true;
    } else if (minOverlap === overlapBottom && entity.vy < 0) {
      entity.y = platBottom;
      entity.vy = 0;
    } else if (minOverlap === overlapLeft) {
      entity.x = platform.x - entity.w;
      entity.vx = 0;
    } else if (minOverlap === overlapRight) {
      entity.x = platRight;
      entity.vx = 0;
    }
  }
  return false;
}

// ========== UPDATE ==========
export function updateGame(state: GameState, input: InputState, dt: number, save: SaveData): GameState {
  dt = Math.min(dt, 0.05);
  state.timeElapsed += dt;

  if (state.screenShake.timer > 0) {
    state.screenShake.timer -= dt;
  }

  // Update moving platforms
  for (const plat of state.platforms) {
    if (plat.type === 'moving' && plat.moveAxis && plat.moveSpeed && plat.moveRange && plat.moveOrigin !== undefined) {
      const time = state.timeElapsed * plat.moveSpeed;
      if (plat.moveAxis === 'x') {
        plat.x = plat.moveOrigin + Math.sin(time * 0.01) * plat.moveRange;
      } else {
        plat.y = plat.moveOrigin + Math.sin(time * 0.01) * plat.moveRange;
      }
    }
  }

  // Update moving hazards
  for (const haz of state.hazards) {
    if (haz.moveAxis && haz.moveSpeed && haz.moveRange) {
      const time = state.timeElapsed * haz.moveSpeed;
      if (haz.moveAxis === 'x') {
        haz.x += Math.cos(time * 0.01) * haz.moveSpeed * dt;
      } else {
        haz.y += Math.sin(time * 0.01) * haz.moveSpeed * dt;
      }
    }
  }

  updatePlayer(state, input, dt, save);

  for (const enemy of state.enemies) {
    if (enemy.state !== 'death' || enemy.stateTimer > 0) {
      updateEnemy(state, enemy, dt);
    }
  }

  checkCollisions(state);
  checkAllEnemiesDefeated(state);

  // If no alive enemy remains or all alive enemies are outside the map, unlock exit.
  if (!state.exitUnlocked) {
    const anyAliveOnMap = state.enemies.some(e =>
      e.state !== 'death' && e.x + e.w >= 0 && e.x <= state.stageWidth
    );
    if (!anyAliveOnMap) {
      state.exitUnlocked = true;
    }
  }

  for (const col of state.collectibles) {
    if (!col.collected) {
      col.bobOffset += dt * 3;
    }
  }

  state.particles = state.particles.filter(p => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.gravity) p.vy += 300 * dt;
    return p.life > 0;
  });

  state.damageNumbers = state.damageNumbers.filter(d => {
    d.life -= dt;
    d.y += d.vy * dt;
    d.vy -= 100 * dt;
    return d.life > 0;
  });

  updateCamera(state, dt);
  checkWinLose(state);

  return state;
}

function updatePlayer(state: GameState, input: InputState, dt: number, save: SaveData) {
  const p = state.player;

  if (p.invincibleTimer > 0) {
    p.invincibleTimer -= dt;
    if (p.invincibleTimer <= 0) p.invincible = false;
  }
  if (p.attackCooldown > 0) p.attackCooldown -= dt;
  if (p.specialCooldown > 0) p.specialCooldown -= dt;
  if (!p.invincible && p.state !== 'hurt' && p.hp < p.maxHp) {
    p.hp = Math.min(p.maxHp, p.hp + PLAYER_HP_REGEN_RATE * dt);
  }
  p.specialMeter = Math.min(p.maxSpecialMeter, p.specialMeter + SPECIAL_METER_REGEN_RATE * dt);
  if (p.comboTimer > 0) {
    p.comboTimer -= dt;
    if (p.comboTimer <= 0) p.comboCount = 0;
  }
  if (p.stateTimer > 0) {
    p.stateTimer -= dt;
    if (p.stateTimer <= 0) {
      if (p.state === 'hurt') {
        p.state = 'idle';
      } else if (p.state === 'attack' || p.state === 'attack2' || p.state === 'attack3') {
        p.state = 'idle';
      } else if (p.state === 'special') {
        p.state = 'idle';
      }
    }
  }

  p.isBlocking = input.block && p.blockStamina > 0 && p.state !== 'hurt' && p.state !== 'special';
  if (p.isBlocking) {
    p.blockStamina -= BLOCK_STAMINA_DRAIN * dt;
    p.vx *= 0.5;
    p.state = 'block';
  } else {
    p.blockStamina = Math.min(p.blockStamina + BLOCK_STAMINA_REGEN * dt, p.maxBlockStamina);
  }

  if (!p.isBlocking && p.state !== 'hurt' && p.state !== 'special') {
    if (input.left) {
      p.vx = -PLAYER_SPEED;
      p.facing = -1;
      if (p.onGround) p.state = 'run';
    } else if (input.right) {
      p.vx = PLAYER_SPEED;
      p.facing = 1;
      if (p.onGround) p.state = 'run';
    } else {
      p.vx *= p.onGround ? FRICTION : AIR_FRICTION;
      if (Math.abs(p.vx) < 10) p.vx = 0;
      if (p.onGround && Math.abs(p.vx) < 5) p.state = 'idle';
    }

    if (input.jumpPressed) {
      if (p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        p.doubleJumped = false;
        p.state = 'jump';
      } else if (!p.doubleJumped) {
        p.vy = DOUBLE_JUMP_FORCE;
        p.doubleJumped = true;
        p.state = 'jump';
        for (let i = 0; i < 5; i++) {
          state.particles.push({
            x: p.x + p.w / 2, y: p.y + p.h,
            vx: (Math.random() - 0.5) * 100, vy: Math.random() * 50,
            life: 0.3, maxLife: 0.3, color: '#87CEEB', size: 4, gravity: false
          });
        }
      }
    }
  }

  if (state.windForce !== 0) {
    p.vx += state.windForce * dt * 0.5;
  }

  p.vy += GRAVITY * dt;
  p.vy = Math.min(p.vy, TERMINAL_VELOCITY);

  p.x += p.vx * dt;
  p.y += p.vy * dt;

  p.onGround = false;
  for (const plat of state.platforms) {
    if (resolvePlatformCollision(p, plat)) {
      p.onGround = true;
      p.doubleJumped = false;
    }
  }

  if (p.x < 0) { p.x = 0; p.vx = 0; }

  if (p.y > state.stageHeight + 200) {
    p.hp = 0;
  }

  if (state.hasLavaFloor && p.y + p.h > 650 && p.onGround) {
    takeDamage(state, p, 30 * dt, true);
  }

  if (input.attack && p.attackCooldown <= 0 && !p.isBlocking && p.state !== 'hurt' && p.state !== 'special') {
    p.comboCount++;
    if (p.comboCount > 3) p.comboCount = 1;
    p.comboTimer = COMBO_WINDOW;
    playAttackSound();

    if (p.comboCount === 1) p.state = 'attack';
    else if (p.comboCount === 2) p.state = 'attack2';
    else p.state = 'attack3';

    p.stateTimer = ATTACK_DURATION;
    p.attackCooldown = ATTACK_DURATION + 0.1;

    performPlayerAttack(state, save);
  }

  if (input.special && p.specialMeter >= SPECIAL_METER_USE_THRESHOLD && p.specialCooldown <= 0 && !p.isBlocking) {
    p.state = 'special';
    p.stateTimer = 0.6;
    p.specialCooldown = 1;
    p.specialMeter = 0;
    performSpecialAttack(state, save);
    playSpecialSound();
  }

  if (!p.onGround && p.state !== 'hurt' && p.state !== 'special' && p.state !== 'attack' && p.state !== 'attack2' && p.state !== 'attack3') {
    p.state = p.vy < 0 ? 'jump' : 'fall';
  }
}

function performPlayerAttack(state: GameState, save: SaveData) {
  const p = state.player;
  const attackW = 60;
  const attackX = p.facing === 1 ? p.x + p.w : p.x - attackW;
  const attackY = p.y;
  const attackH = p.h;

  const weaponDmg = WEAPON_UPGRADES[save.weaponLevel - 1]?.damage || 10;
  const comboMult = p.comboCount === 3 ? 1.5 : 1;
  const totalDamage = Math.floor(weaponDmg * comboMult);

  let hitSomething = false;

  for (const enemy of state.enemies) {
    if (enemy.state === 'death' || enemy.invincible) continue;

    if (rectIntersect(
      { x: attackX, y: attackY, w: attackW, h: attackH },
      { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }
    )) {
      const actualDamage = Math.max(1, totalDamage - enemy.defense);
      enemy.hp -= actualDamage;
      enemy.state = 'hurt';
      enemy.stateTimer = 0.3;
      enemy.invincible = true;
      enemy.invincibleTimer = 0.3;
      enemy.vx = p.facing * KNOCKBACK_FORCE;
      enemy.vy = -100;
      playHitSound();

      hitSomething = true;

      p.specialMeter = Math.min(p.specialMeter + SPECIAL_METER_PER_HIT, p.maxSpecialMeter);

      state.damageNumbers.push({
        x: enemy.x + enemy.w / 2, y: enemy.y,
        value: actualDamage, life: 0.8,
        color: p.comboCount === 3 ? '#FFD700' : '#FFFFFF',
        vy: -150
      });

      for (let i = 0; i < 6; i++) {
        state.particles.push({
          x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2,
          vx: (Math.random() - 0.5) * 200, vy: (Math.random() - 0.5) * 200,
          life: 0.3, maxLife: 0.3, color: '#FFD700', size: 3 + Math.random() * 3, gravity: true
        });
      }

      if (enemy.hp <= 0) {
        enemy.state = 'death';
        enemy.stateTimer = 1.2;
        enemy.vx = p.facing * 60;
        enemy.vy = 80;
        state.gold += enemy.goldDrop;
        state.score += enemy.goldDrop * 10;
        healPlayerToFull(state.player, state.player.maxHp);

        for (let i = 0; i < 15; i++) {
          state.particles.push({
            x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2,
            vx: (Math.random() - 0.5) * 300, vy: (Math.random() - 0.5) * 300,
            life: 0.5, maxLife: 0.5, color: ['#FFD700', '#FF4500', '#FFFFFF'][Math.floor(Math.random() * 3)],
            size: 4 + Math.random() * 4, gravity: true
          });
        }

        checkAllEnemiesDefeated(state);
      }
    }
  }

  if (hitSomething) {
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.screenShake = { intensity: 4, duration: 0.1, timer: 0.1 };
  }
}

function healPlayerToFull(player: Player, maxHp: number) {
  player.hp = Math.min(maxHp, player.hp + maxHp);
  player.hp = player.maxHp;
  player.state = 'idle';
}

function performSpecialAttack(state: GameState, save: SaveData) {
  const p = state.player;
  const specialBonus = SPECIAL_UPGRADES[save.specialLevel - 1]?.specialBonus || 0;
  const waterRange = 260 + specialBonus * 15;

  const aoeX = p.facing === 1 ? p.x + p.w : p.x - waterRange;
  const aoeY = p.y - 20;
  const aoeW = waterRange;
  const aoeH = p.h + 40;

  state.screenShake = { intensity: 12, duration: 0.28, timer: 0.28 };

  for (let i = 0; i < 28; i++) {
    const offset = (i / 28) * waterRange;
    state.particles.push({
      x: p.x + p.w / 2 + (p.facing === 1 ? offset : -offset),
      y: p.y + p.h / 2 - 20 + Math.sin(i * 0.7) * 10,
      vx: p.facing * (40 + Math.random() * 40),
      vy: Math.sin(i * 0.5) * 12 - 15,
      life: 0.6, maxLife: 0.6,
      color: ['rgba(0,191,255,0.65)', 'rgba(0,154,205,0.7)', 'rgba(135,206,235,0.55)'][Math.floor(Math.random() * 3)],
      size: 6 + Math.random() * 6, gravity: false
    });
  }

  for (let i = 0; i < 20; i++) {
    state.particles.push({
      x: p.x + p.w / 2 + (p.facing === 1 ? Math.random() * waterRange : -Math.random() * waterRange),
      y: p.y + p.h / 2 - 10 - Math.random() * 20,
      vx: p.facing * (20 + Math.random() * 30),
      vy: -10 - Math.random() * 30,
      life: 0.35, maxLife: 0.35,
      color: 'rgba(173,216,230,0.9)',
      size: 4 + Math.random() * 4, gravity: false
    });
  }

  for (const enemy of state.enemies) {
    if (enemy.state === 'death') continue;

    if (rectIntersect(
      { x: aoeX, y: aoeY, w: aoeW, h: aoeH },
      { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }
    )) {
      const drainAmount = Math.max(1, Math.floor(enemy.maxHp * 0.5));
      enemy.hp -= drainAmount;
      enemy.vx = (enemy.x - p.x) > 0 ? 280 : -280;
      enemy.vy = -120;
      enemy.state = 'hurt';
      enemy.stateTimer = 0.45;
      enemy.invincible = true;
      enemy.invincibleTimer = 0.25;

      state.damageNumbers.push({
        x: enemy.x + enemy.w / 2, y: enemy.y,
        value: drainAmount, life: 0.9,
        color: '#00BFFF', vy: -180
      });

      if (enemy.hp <= 0) {
        enemy.state = 'death';
        enemy.stateTimer = 1.2;
        enemy.vx = (enemy.x - p.x) > 0 ? 100 : -100;
        enemy.vy = 80;
        state.gold += enemy.goldDrop;
        state.score += enemy.goldDrop * 10;
        healPlayerToFull(state.player, state.player.maxHp);
        checkAllEnemiesDefeated(state);
      }
    }
  }

  if (waterRange > 0) {
    for (let i = 0; i < 16; i++) {
      state.particles.push({
        x: p.x + p.w / 2 + (p.facing === 1 ? Math.random() * waterRange : -Math.random() * waterRange),
        y: p.y + p.h / 2 + 10 + Math.random() * 10,
        vx: p.facing * (10 + Math.random() * 20),
        vy: 5 + Math.random() * 15,
        life: 0.4, maxLife: 0.4,
        color: 'rgba(224,255,255,0.55)',
        size: 5 + Math.random() * 5, gravity: false
      });
    }
  }
}

function updateEnemy(state: GameState, enemy: Enemy, dt: number) {
  const p = state.player;

  if (enemy.state === 'death') {
    if (enemy.stateTimer > 0) {
      enemy.stateTimer -= dt;
    }

    enemy.vy += GRAVITY * dt;
    enemy.vy = Math.min(enemy.vy, TERMINAL_VELOCITY);
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    enemy.vx *= 0.98;

    enemy.onGround = false;
    for (const plat of state.platforms) {
      if (resolvePlatformCollision(enemy, plat)) {
        enemy.onGround = true;
        enemy.vy = 0;
        enemy.vx *= 0.7;
        break;
      }
    }

    return;
  }

  if (enemy.invincibleTimer > 0) {
    enemy.invincibleTimer -= dt;
    if (enemy.invincibleTimer <= 0) enemy.invincible = false;
  }
  if (enemy.stateTimer > 0) {
    enemy.stateTimer -= dt;
    if (enemy.stateTimer <= 0 && enemy.state === 'hurt') {
      enemy.state = 'idle';
    }
  }
  if (enemy.currentAttackCooldown > 0) {
    enemy.currentAttackCooldown -= dt;
  }

  const distToPlayer = Math.abs(p.x - enemy.x);
  const canSeePlayer = distToPlayer < enemy.detectionRange && p.hp > 0;

  if (enemy.state === 'hurt') {
    enemy.aiState = 'hurt';
  } else if (canSeePlayer) {
    if (distToPlayer < enemy.attackRange && enemy.currentAttackCooldown <= 0) {
      enemy.aiState = 'attack';
    } else {
      enemy.aiState = 'chase';
    }
  } else {
    enemy.aiState = 'patrol';
  }

  switch (enemy.aiState) {
    case 'patrol':
      enemy.vx = enemy.patrolDirection * enemy.speed * 0.3;
      enemy.patrolTimer += dt;
      if (enemy.patrolTimer > 2) {
        enemy.patrolDirection *= -1;
        enemy.patrolTimer = 0;
      }
      enemy.facing = enemy.patrolDirection;
      if (enemy.onGround) enemy.state = 'run';
      break;

    case 'chase':
      const dir = p.x > enemy.x ? 1 : -1;
      enemy.vx = dir * enemy.speed;
      enemy.facing = dir;
      if (enemy.onGround) enemy.state = 'run';
      if (p.y < enemy.y - 50 && enemy.onGround && Math.random() < 0.02) {
        enemy.vy = -350;
        enemy.onGround = false;
      }
      break;

    case 'attack':
      enemy.vx *= 0.5;
      if (enemy.currentAttackCooldown <= 0) {
        enemy.state = 'attack';
        enemy.stateTimer = 0.4;
        enemy.currentAttackCooldown = enemy.attackCooldown;
        enemy.facing = p.x > enemy.x ? 1 : -1;
        performEnemyAttack(state, enemy);
      }
      break;

    case 'hurt':
      enemy.vx *= 0.9;
      break;
  }

  enemy.vy += GRAVITY * dt;
  enemy.vy = Math.min(enemy.vy, TERMINAL_VELOCITY);

  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;

  enemy.onGround = false;
  for (const plat of state.platforms) {
    if (resolvePlatformCollision(enemy, plat)) {
      enemy.onGround = true;
    }
  }

  if (enemy.x < 0) { enemy.x = 0; enemy.vx = 0; }
  if (enemy.x > state.stageWidth) { enemy.x = state.stageWidth; enemy.vx = 0; }
}

function performEnemyAttack(state: GameState, enemy: Enemy) {
  const p = state.player;
  if (p.invincible || p.hp <= 0) return;

  const attackW = enemy.attackRange;
  const attackX = enemy.facing === 1 ? enemy.x + enemy.w : enemy.x - attackW;
  const attackY = enemy.y - 10;
  const attackH = enemy.h + 20;

  if (rectIntersect(
    { x: attackX, y: attackY, w: attackW, h: attackH },
    { x: p.x, y: p.y, w: p.w, h: p.h }
  )) {
    let damage = enemy.damage;

    if (p.isBlocking) {
      damage = 0; // Perfect block = no damage
      p.blockStamina -= 25;
      playBlockSound();
      for (let i = 0; i < 4; i++) {
        state.particles.push({
          x: p.x + p.w / 2, y: p.y + p.h / 2,
          vx: (Math.random() - 0.5) * 150, vy: (Math.random() - 0.5) * 150,
          life: 0.2, maxLife: 0.2, color: '#87CEEB', size: 4, gravity: false
        });
      }
      state.screenShake = { intensity: 3, duration: 0.08, timer: 0.08 };
    } else {
      state.screenShake = { intensity: 6, duration: 0.15, timer: 0.15 };
    }

    takeDamage(state, p, damage, false);
    playHitSound();
    if (damage > 0) playDamageSound();
    p.vx = enemy.facing * KNOCKBACK_FORCE * 0.8;
    p.vy = -80;

    state.damageNumbers.push({
      x: p.x + p.w / 2, y: p.y,
      value: damage, life: 0.8,
      color: '#FF4500', vy: -120
    });
  }
}

function takeDamage(_state: GameState, entity: Player | Enemy, damage: number, ignoreInvincible: boolean) {
  if ('invincible' in entity && entity.invincible && !ignoreInvincible) return;

  entity.hp -= damage;

  if ('state' in entity && 'maxHp' in entity) {
    const p = entity as Player;
    if (!ignoreInvincible) {
      p.invincible = true;
      p.invincibleTimer = INVINCIBLE_DURATION;
      p.state = 'hurt';
      p.stateTimer = 0.3;
    }
    p.specialMeter = Math.min(p.specialMeter + SPECIAL_METER_PER_DAMAGE, p.maxSpecialMeter);
  }
}

function checkCollisions(state: GameState) {
  const p = state.player;

  // Hazard collision
  for (const haz of state.hazards) {
    if (rectIntersect(
      { x: p.x, y: p.y, w: p.w, h: p.h },
      { x: haz.x, y: haz.y, w: haz.w, h: haz.h }
    )) {
      if (!p.invincible) {
        takeDamage(state, p, haz.damage, false);
        p.vx = -p.facing * KNOCKBACK_FORCE;
        p.vy = -150;
        state.damageNumbers.push({
          x: p.x + p.w / 2, y: p.y,
          value: haz.damage, life: 0.8,
          color: '#FF4500', vy: -120
        });
      }
    }
  }

  // Collectible collision
  for (const col of state.collectibles) {
    if (col.collected) continue;
    const colX = col.x - 15;
    const colY = col.y - 15 + Math.sin(col.bobOffset) * 5;
    if (rectIntersect(
      { x: p.x, y: p.y, w: p.w, h: p.h },
      { x: colX, y: colY, w: 30, h: 30 }
    )) {
      col.collected = true;
      playCollectSound();
      if (col.type === 'coin') {
        state.gold += col.value;
        state.score += col.value;
      } else if (col.type === 'heart') {
        p.hp = Math.min(p.hp + 25, p.maxHp);
        state.damageNumbers.push({
          x: p.x + p.w / 2, y: p.y - 20,
          value: 25, life: 0.8,
          color: '#32CD32', vy: -80
        });
      } else if (col.type === 'special') {
        p.specialMeter = p.maxSpecialMeter;
        state.damageNumbers.push({
          x: p.x + p.w / 2, y: p.y - 20,
          value: 0, life: 0.8,
          color: '#00BFFF', vy: -80
        });
      }

      for (let i = 0; i < 6; i++) {
        state.particles.push({
          x: col.x, y: col.y,
          vx: (Math.random() - 0.5) * 150, vy: (Math.random() - 0.5) * 150,
          life: 0.3, maxLife: 0.3,
          color: col.type === 'coin' ? '#FFD700' : col.type === 'heart' ? '#FF69B4' : '#00BFFF',
          size: 3, gravity: false
        });
      }
    }
  }

  // Exit portal
  if (state.exitUnlocked && p.x + p.w > state.exitX - 20) {
    state.stageCleared = true;
  }
}

function checkAllEnemiesDefeated(state: GameState) {
  const alive = state.enemies.filter(e => e.state !== 'death');
  if (alive.length === 0 && !state.stageCleared) {
    state.exitUnlocked = true;
    for (let i = 0; i < 20; i++) {
      state.particles.push({
        x: state.exitX, y: 500,
        vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 200,
        life: 1, maxLife: 1, color: '#00FF00', size: 4, gravity: false
      });
    }
  }
}

function checkWinLose(state: GameState) {
  if (state.player.hp <= 0 && state.screen !== 'gameover') {
    state.player.hp = 0;
    state.player.state = 'death';
    state.screen = 'gameover';
  }
  if (state.stageCleared && state.screen !== 'victory') {
    state.screen = 'victory';
  }
}

function updateCamera(state: GameState, dt: number) {
  const targetX = state.player.x - 400;
  const targetY = state.player.y - 300;

  state.camera.x += (targetX - state.camera.x) * 3 * dt;
  state.camera.y += (targetY - state.camera.y) * 3 * dt;

  state.camera.x = Math.max(0, Math.min(state.camera.x, state.stageWidth - 800));
  state.camera.y = Math.max(-100, Math.min(state.camera.y, state.stageHeight - 600));
}

// ========== RENDERING ==========
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>, canvasWidth: number, canvasHeight: number) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  let shakeX = 0, shakeY = 0;
  if (state.screenShake.timer > 0) {
    shakeX = (Math.random() - 0.5) * state.screenShake.intensity * 2;
    shakeY = (Math.random() - 0.5) * state.screenShake.intensity * 2;
  }

  ctx.save();
  ctx.translate(-state.camera.x + shakeX, -state.camera.y + shakeY);

  renderBackground(ctx, state, images);

  for (const plat of state.platforms) {
    renderPlatform(ctx, plat);
  }

  for (const haz of state.hazards) {
    renderHazard(ctx, haz, state);
  }

  if (state.exitUnlocked) {
    renderExitPortal(ctx, state);
  }

  for (const col of state.collectibles) {
    if (!col.collected) renderCollectible(ctx, col, state);
  }

  for (const enemy of state.enemies) {
    if (enemy.state !== 'death' || enemy.stateTimer > 0) {
      renderEnemy(ctx, enemy, images);
    }
  }

  if (state.player.hp > 0) {
    renderPlayer(ctx, state.player, images);
  }

  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  for (const d of state.damageNumbers) {
    const alpha = d.life / 0.8;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = d.color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const text = d.value > 0 ? `${d.value}` : d.color === '#00BFFF' ? 'SPECIAL!' : '+' + Math.abs(d.value);
    ctx.strokeText(text, d.x, d.y);
    ctx.fillText(text, d.x, d.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  renderHUD(ctx, state, canvasWidth);
}

function renderBackground(ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>) {
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(state.camera.x, state.camera.y, 800, 600);

  if (images[state.bgImage]) {
    const img = images[state.bgImage];
    const parallaxX = state.camera.x * 0.3;
    ctx.drawImage(img, parallaxX, state.camera.y, 800 * 2, 600);
    ctx.drawImage(img, parallaxX + 800 * 2, state.camera.y, 800 * 2, 600);
  }
}

function renderPlatform(ctx: CanvasRenderingContext2D, plat: { x: number; y: number; w: number; h: number; type: string; moveAxis?: string }) {
  switch (plat.type) {
    case 'grass':
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(plat.x, plat.y + 12, plat.w, plat.h - 12);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(plat.x, plat.y, plat.w, 14);
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(plat.x, plat.y + 12, plat.w, 2);
      ctx.fillStyle = '#66BB6A';
      for (let i = 0; i < plat.w; i += 12) {
        ctx.fillRect(plat.x + i, plat.y - 2, 4, 6);
        ctx.fillRect(plat.x + i + 6, plat.y - 1, 3, 5);
      }
      break;
    case 'wood':
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#8B4513';
      for (let i = 0; i < plat.h; i += 10) {
        ctx.fillRect(plat.x, plat.y + i, plat.w, 1);
      }
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      break;
    case 'stone':
      ctx.fillStyle = '#808080';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#696969';
      for (let i = 0; i < plat.w; i += 30) {
        for (let j = 0; j < plat.h; j += 15) {
          ctx.fillRect(plat.x + i, plat.y + j, 28, 13);
        }
      }
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      break;
    case 'moving':
      ctx.fillStyle = '#6A5ACD';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#9370DB';
      ctx.fillRect(plat.x + 2, plat.y + 2, plat.w - 4, plat.h - 4);
      ctx.fillStyle = '#FFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(plat.moveAxis === 'x' ? '<->' : '^v', plat.x + plat.w / 2, plat.y + plat.h / 2 + 4);
      break;
  }
}

function renderHazard(ctx: CanvasRenderingContext2D, haz: { x: number; y: number; w: number; h: number; type: string; damage: number }, state: GameState) {
  switch (haz.type) {
    case 'spike':
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.moveTo(haz.x, haz.y + haz.h);
      ctx.lineTo(haz.x + haz.w / 2, haz.y);
      ctx.lineTo(haz.x + haz.w, haz.y + haz.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    case 'lava':
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(haz.x, haz.y, haz.w, haz.h);
      ctx.fillStyle = '#FF8C00';
      const lavaBob = Math.sin(state.timeElapsed * 4) * 3;
      ctx.fillRect(haz.x, haz.y + lavaBob, haz.w, haz.h / 2);
      break;
    case 'saw':
      ctx.save();
      ctx.translate(haz.x + haz.w / 2, haz.y + haz.h / 2);
      ctx.rotate(state.timeElapsed * 5);
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.arc(0, 0, haz.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#A9A9A9';
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3, -haz.w / 2 - 3, 6, 8);
      }
      ctx.restore();
      break;
  }
}

function renderExitPortal(ctx: CanvasRenderingContext2D, state: GameState) {
  const x = state.exitX;
  const platform = state.platforms.reduce((best, plat) => {
    if (plat.x <= x && x <= plat.x + plat.w) {
      return plat;
    }
    return best;
  }, state.platforms[0]);
  const y = platform ? platform.y - 50 : 480;
  const pulse = 1 + Math.sin(state.timeElapsed * 3) * 0.12;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);

  ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ADFF2F';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 56, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#90EE90';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText('EXIT', x, y - 68);
  ctx.fillText('EXIT', x, y - 68);
}

function renderCollectible(ctx: CanvasRenderingContext2D, col: { x: number; y: number; type: string; bobOffset: number }, _state: GameState) {
  const bobY = Math.sin(col.bobOffset) * 5;
  const x = col.x;
  const y = col.y + bobY;

  switch (col.type) {
    case 'coin':
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFA000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('$', x, y + 4);
      break;
    case 'heart':
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      const heartScale = 0.6;
      ctx.moveTo(x, y + 5 * heartScale);
      ctx.bezierCurveTo(x, y + 2 * heartScale, x - 10 * heartScale, y - 5 * heartScale, x - 10 * heartScale, y + 2 * heartScale);
      ctx.bezierCurveTo(x - 10 * heartScale, y + 7 * heartScale, x, y + 12 * heartScale, x, y + 15 * heartScale);
      ctx.bezierCurveTo(x, y + 12 * heartScale, x + 10 * heartScale, y + 7 * heartScale, x + 10 * heartScale, y + 2 * heartScale);
      ctx.bezierCurveTo(x + 10 * heartScale, y - 5 * heartScale, x, y + 2 * heartScale, x, y + 5 * heartScale);
      ctx.fill();
      break;
    case 'special':
      ctx.fillStyle = '#00BFFF';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('S', x, y + 5);
      break;
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, p: Player, images: Record<string, HTMLImageElement>) {
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);

  if (p.facing === -1) {
    ctx.scale(-1, 1);
  }

  if (p.invincible && Math.floor(p.invincibleTimer * 10) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  if (p.isBlocking) {
    ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  const img = images['/assets/hero_player.png'];
  if (img) {
    let offsetY = 0;
    let rot = 0;
    const attackActive = p.state === 'attack' || p.state === 'attack2' || p.state === 'attack3';

    if (p.state === 'run') {
      offsetY = Math.sin(Date.now() * 0.02) * 2;
    } else if (p.state === 'jump' || p.state === 'fall') {
      offsetY = -5;
    } else if (attackActive) {
      const attackProgress = Math.min(1, 1 - p.stateTimer / ATTACK_DURATION);
      const eased = attackProgress < 0.5
        ? 4 * attackProgress * attackProgress * attackProgress
        : 1 - Math.pow(-2 * attackProgress + 2, 3) / 2;
      const direction = p.facing === 1 ? 1 : -1;
      rot = direction * (0.12 - eased * 0.22);
      offsetY = -3 + Math.sin(eased * Math.PI) * 2;
    } else if (p.state === 'hurt') {
      ctx.globalAlpha = 0.6;
    }

    ctx.rotate(rot);
    ctx.drawImage(img, -35, -50 + offsetY, 70, 90);

    if (attackActive) {
      const attackProgress = Math.min(1, 1 - p.stateTimer / ATTACK_DURATION);
      const eased = attackProgress < 0.5
        ? 4 * attackProgress * attackProgress * attackProgress
        : 1 - Math.pow(-2 * attackProgress + 2, 3) / 2;
      const direction = p.facing === 1 ? 1 : -1;
      const swingAngle = direction * (-0.9 + eased * 1.8);
      const swordX = direction * 16;
      const swordY = -10 + eased * 6;

      ctx.save();
      ctx.translate(swordX, swordY);
      ctx.rotate(swingAngle);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, -10, -12, 24, 24);

      ctx.strokeStyle = '#4a3428';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 0);
      ctx.stroke();

      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(62 + eased * 8, 0);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255,255,255,${0.35 + eased * 0.25})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(58 + eased * 10, 0);
      ctx.stroke();

      ctx.restore();
    }
  } else {
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(-20, -30, 40, 60);
  }

  if (p.state === 'special') {
    const flamePulse = 1 + Math.sin(Date.now() * 0.04) * 0.2;
    const attackProgress = Math.min(1, 1 - p.stateTimer / 0.6);
    const burstX = p.facing === 1 ? 28 : -28;

    ctx.save();
    ctx.translate(burstX, -12);
    ctx.scale(flamePulse, flamePulse);

    ctx.globalAlpha = 0.95;
    ctx.drawImage(images['/assets/ryu.png'] || img, -42, -54, 84, 108);

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = 'rgba(255, 122, 0, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 42 + attackProgress * 18, 26 + attackProgress * 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 234, 0, 0.85)';
    ctx.beginPath();
    ctx.ellipse(6, -2, 22 + attackProgress * 8, 14 + attackProgress * 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 61, 0, 0.95)';
    ctx.beginPath();
    ctx.ellipse(-8, 6, 14 + attackProgress * 6, 10 + attackProgress * 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();

  const barW = 50;
  const barH = 6;
  const barX = p.x + p.w / 2 - barW / 2;
  const barY = p.y - 15;
  ctx.fillStyle = '#000';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = p.hp > p.maxHp * 0.3 ? '#32CD32' : '#FF0000';
  ctx.fillRect(barX, barY, barW * (p.hp / p.maxHp), barH);
}

function renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, images: Record<string, HTMLImageElement>) {
  ctx.save();
  ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);

  if (enemy.facing === -1) {
    ctx.scale(-1, 1);
  }

  if (enemy.invincible && Math.floor(enemy.invincibleTimer * 10) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  const imgMap: Record<string, string> = {
    rookie: '/assets/enemy_rookie.png',
    spearman: '/assets/enemy_rookie.png',
    rogue: '/assets/enemy_rogue.png',
    archer: '/assets/enemy_mage.png',
    captain: '/assets/enemy_paladin.png',
    berserker: '/assets/enemy_berserker.png',
    assassin: '/assets/enemy_rogue.png',
    mage: '/assets/enemy_mage.png',
    paladin: '/assets/enemy_paladin.png',
    boss: '/assets/enemy_boss.png',
  };

  const imgKey = imgMap[enemy.type] || '/assets/enemy_rookie.png';
  const img = images[imgKey];

  if (img) {
    let scale = 1;
    if (enemy.type === 'boss') scale = 1.4;
    if (enemy.state === 'hurt') {
      ctx.globalAlpha = 0.6;
    }
    ctx.drawImage(img, -35 * scale, -50 * scale, 70 * scale, 90 * scale);
  } else {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(-20, -30, 40, 60);
  }

  if (enemy.state === 'attack') {
    ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(30, 0, 25, -Math.PI / 4, Math.PI / 4);
    ctx.lineTo(30, 0);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  const barW = 50;
  const barH = 5;
  const barX = enemy.x + enemy.w / 2 - barW / 2;
  const barY = enemy.y - 12;
  ctx.fillStyle = '#000';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = enemy.hp > enemy.maxHp * 0.3 ? '#FF0000' : '#FF8C00';
  ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Lv.${enemy.level}`, enemy.x + enemy.w / 2, barY - 3);
}

function renderHUD(ctx: CanvasRenderingContext2D, state: GameState, canvasWidth: number) {
  const p = state.player;

  const hpBarW = 200;
  const hpBarH = 20;
  const hpX = 15;
  const hpY = 15;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(hpX - 2, hpY - 2, hpBarW + 4, hpBarH + 4);
  ctx.fillStyle = '#333';
  ctx.fillRect(hpX, hpY, hpBarW, hpBarH);
  ctx.fillStyle = p.hp > p.maxHp * 0.3 ? '#32CD32' : '#FF0000';
  ctx.fillRect(hpX, hpY, hpBarW * (p.hp / p.maxHp), hpBarH);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`HP: ${Math.max(0, Math.floor(p.hp))}/${p.maxHp}`, hpX + hpBarW / 2, hpY + hpBarH - 4);

  const specY = hpY + hpBarH + 8;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(hpX - 2, specY - 2, hpBarW + 4, 16);
  ctx.fillStyle = '#333';
  ctx.fillRect(hpX, specY, hpBarW, 12);
  ctx.fillStyle = '#00BFFF';
  ctx.fillRect(hpX, specY, hpBarW * (p.specialMeter / p.maxSpecialMeter), 12);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 10px Arial';
  ctx.fillText(`SKILL [A]`, hpX + hpBarW / 2, specY + 10);

  const blockY = specY + 18;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(hpX - 2, blockY - 2, 120, 14);
  ctx.fillStyle = '#333';
  ctx.fillRect(hpX, blockY, 116, 10);
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(hpX, blockY, 116 * (p.blockStamina / p.maxBlockStamina), 10);
  ctx.fillStyle = '#FFF';
  ctx.font = '9px Arial';
  ctx.fillText(`BLOCK [S]`, hpX + 58, blockY + 9);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`${state.gold}`, canvasWidth - 15, 30);
  ctx.fillStyle = '#FFA000';
  ctx.font = '14px Arial';
  ctx.fillText('GOLD', canvasWidth - 15, 48);

  const stageNames: Record<number, string> = {
    1: 'Green Plains', 2: 'Wooden Forts', 3: 'Spiked Path', 4: 'Moving Towers',
    5: 'Guard Captain', 6: 'Lava Caverns', 7: 'Dual Blades', 8: 'Windy Cliffs',
    9: 'The Gauntlet', 10: 'Sword King Throne'
  };
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(canvasWidth / 2 - 120, 5, 240, 28);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`STAGE ${state.currentStage} - ${stageNames[state.currentStage]?.toUpperCase()}`, canvasWidth / 2, 24);

  if (state.combo > 1) {
    const comboScale = 1 + Math.min(state.combo * 0.1, 0.5);
    ctx.save();
    ctx.translate(canvasWidth / 2, 70);
    ctx.scale(comboScale, comboScale);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold italic 24px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(`${state.combo} HIT COMBO!`, 0, 0);
    ctx.fillText(`${state.combo} HIT COMBO!`, 0, 0);
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 560, 400, 30);
  ctx.fillStyle = '#AAA';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Arrows: Move/Jump | D: Attack | S: Block | A: Special | ESC: Pause', 18, 580);

  if (!state.exitUnlocked) {
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.fillRect(canvasWidth - 140, 55, 125, 22);
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Defeat all enemies!', canvasWidth - 18, 70);
  } else {
    ctx.fillStyle = 'rgba(0,255,0,0.3)';
    ctx.fillRect(canvasWidth - 140, 55, 125, 22);
    ctx.fillStyle = '#32CD32';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Exit unlocked!', canvasWidth - 18, 70);
  }
}

export function calculateStageScore(state: GameState): { score: number; stars: number } {
  const timeBonus = Math.max(0, 300 - Math.floor(state.timeElapsed)) * 10;
  const comboBonus = state.maxCombo * 50;
  const hpBonus = Math.floor(state.player.hp) * 5;
  const totalScore = state.score + timeBonus + comboBonus + hpBonus;

  let stars = 1;
  if (state.timeElapsed < 60) stars = 2;
  if (state.timeElapsed < 60 && state.player.hp >= state.player.maxHp * 0.8) stars = 3;

  return { score: totalScore, stars };
}
