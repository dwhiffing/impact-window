export type IState = {
  score: number
  multi: number
  energy: number
}

export type PowerupDef = {
  name: string
  color: number
  duration: number
  rarity: number
}

export type EnemyType = 'grunt' | 'heavy' | 'fast'

export type EnemyStats = {
  color: number
  speed: number
  size: number
  health: number
  damage: number
  energyOnKill: number
  speedBoost: number
  score: number
}
