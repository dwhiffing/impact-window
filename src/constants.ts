import * as Phaser from 'phaser'
import { EnemyType, EnemyStats, PowerupDef } from './types'

export const LOCAL_STORAGE_KEY = 'impact-window-score'
export const INITIAL_SCORE = 0

export const PLAYER_COLOR = 0x00ffcc
export const PLAYER_CRUSH_COLOR = 0xffff00
export const PLAYER_MAX_SPEED = 800
export const PLAYER_DRAG = 0.125
export const PLAYER_SIZE = 13
export const PLAYER_FULL_LAUNCH_SPEED = 450
export const PLAYER_WEAK_LAUNCH_SPEED = 175
export const PLAYER_ACCELERATION = 40
export const PLAYER_MIN_CRUSH_SPEED = 90
export const PLAYER_LAUNCH_COOLDOWN_MS = 500
export const SPAWN_RATE = 1000

export const DEAD_ZONE_SIZE = 10
export const NUDGE_ZONE_SIZE = 50
export const MAX_THUMB_SIZE = 120

export const ENEMY_COLOR = 0xff4444
export const MULTI_SPEED_BOOST = 30

export const COMBO_EXPIRE_MS = 1300
export const COMBO_COUNTDOWN_MS = 250
export const MAX_ENERGY = 100
export const ENERGY_RECHARGE_RATE = 8
export const WEAK_LAUNCH_COST = 10
export const FULL_LAUNCH_COST = 40

export const POWERUPS: PowerupDef[] = [
  {
    name: 'damage',
    color: 0xff4444,
    duration: 5000,
    rarity: 1,
  },
  {
    name: 'speed',
    color: 0x44ff44,
    duration: 5000,
    rarity: 1,
  },
  {
    name: 'energize',
    color: 0xff44ff,
    duration: 5000,
    rarity: 1,
  },
]

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  grunt: {
    color: 0xff4444,
    speed: 60,
    size: 7,
    health: 1,
    energyOnKill: 5,
    speedBoost: 50,
    score: 10,
    damage: 1,
  },
  heavy: {
    color: 0x8888ff,
    speed: 35,
    size: 12,
    health: 2,
    energyOnKill: 6,
    speedBoost: 100,
    score: 15,
    damage: 1,
  },
  fast: {
    color: 0x44ff44,
    speed: 400,
    size: 4,
    health: 1,
    energyOnKill: 3,
    speedBoost: 50,
    score: 25,
    damage: 0,
  },
  boss: {
    color: 0xff44ff,
    speed: 20,
    size: 16,
    health: 6,
    energyOnKill: 12,
    speedBoost: 100,
    score: 50,
    damage: 1,
  },
}

export const TRAIL_CONFIG: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig =
  {
    lifespan: 600,
    frequency: 5,
    alpha: { start: 2, end: 0 },
    quantity: 1,
    tint: PLAYER_CRUSH_COLOR,
    visible: false,
    active: false,
  }

export const PARTICLE_CONFIG: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig =
  {
    lifespan: { min: 100, max: 1200 },
    scale: { min: 0.2, max: 1.5 },
    speed: { min: 50, max: 100 },
    alpha: { start: 1, end: 0 },
    rotate: { start: 0, end: 1200 },
    quantity: 0,
  }

export const WAVES: Record<string, EnemyType[]> = {
  nothing: [],
  one_grunt: new Array(1).fill('grunt'),
  two_grunt: new Array(2).fill('grunt'),
  three_grunt: new Array(3).fill('grunt'),
  four_grunt: new Array(4).fill('grunt'),
  one_heavy: new Array(1).fill('heavy'),
  two_heavy: new Array(2).fill('heavy'),
  three_heavy: new Array(3).fill('heavy'),
  one_fast: new Array(1).fill('fast'),
  one_boss: new Array(1).fill('boss'),
  two_boss: new Array(2).fill('boss'),
}

export const WAVES_BY_SCORE: Array<{ score: number; pool: string[] }> = [
  {
    score: 0,
    pool: [
      ...new Array(2).fill('one_grunt'),
      ...new Array(2).fill('nothing'),
      ...new Array(2).fill('two_grunt'),
    ],
  },
  {
    score: 500,
    pool: [
      ...new Array(3).fill('one_grunt'),
      ...new Array(2).fill('two_grunt'),
      ...new Array(1).fill('nothing'),
      ...new Array(2).fill('one_heavy'),
      ...new Array(1).fill('one_fast'),
    ],
  },
  {
    score: 1500,
    pool: [
      ...new Array(3).fill('one_grunt'),
      ...new Array(2).fill('two_grunt'),
      ...new Array(1).fill('nothing'),
      ...new Array(3).fill('one_heavy'),
      ...new Array(1).fill('one_fast'),
    ],
  },
  {
    score: 3000,
    pool: [
      ...new Array(4).fill('one_grunt'),
      ...new Array(1).fill('two_grunt'),
      ...new Array(2).fill('nothing'),
      ...new Array(2).fill('one_heavy'),
      ...new Array(2).fill('two_heavy'),
      ...new Array(1).fill('one_fast'),
      ...new Array(1).fill('one_boss'),
    ],
  },
  {
    score: 5000,
    pool: [
      ...new Array(4).fill('one_grunt'),
      ...new Array(1).fill('two_grunt'),
      ...new Array(2).fill('nothing'),
      ...new Array(2).fill('one_heavy'),
      ...new Array(2).fill('two_heavy'),
      ...new Array(1).fill('one_fast'),
      ...new Array(2).fill('one_boss'),
    ],
  },
]
