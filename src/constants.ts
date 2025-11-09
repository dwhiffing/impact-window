import * as Phaser from 'phaser'
export const PARTICLE_CONFIG = {
  lifespan: { min: 100, max: 1200 },
  scale: { min: 0.2, max: 1.5 },
  speed: { min: 50, max: 100 },
  alpha: { start: 1, end: 0 },
  rotate: { start: 0, end: 1200 },
  quantity: 0,
}

export const PLAYER_COLOR = 0x00ffcc
export const PLAYER_CRUSH_COLOR = 0xffff00
export const PLAYER_MAX_SPEED = 800
export const PLAYER_DRAG = 0.1
export const PLAYER_SIZE = 13
export const PLAYER_FULL_LAUNCH_SPEED = 450
export const PLAYER_WEAK_LAUNCH_SPEED = 180
export const PLAYER_ACCELERATION = 40
export const PLAYER_MIN_CRUSH_SPEED = 100
export const PLAYER_LAUNCH_COOLDOWN_MS = 200

export const DEAD_ZONE_SIZE = 3
export const NUDGE_ZONE_SIZE = 40
export const MAX_THUMB_SIZE = 100

export const ENEMY_SIZE = 10
export const ENEMY_COLOR = 0xff4444
export const ENEMY_KILL_SPEED_BOOST = 150
export const MULTI_SPEED_BOOST = 30

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

export const MAX_ENERGY = 100
export const ENERGY_RECHARGE_RATE = 12
export const WEAK_LAUNCH_COST = 15
export const FULL_LAUNCH_COST = 30
