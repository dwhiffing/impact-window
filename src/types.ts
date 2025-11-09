export type IState = {
  score: number
  multi: number
  energy: number
}

export type EnemyType = 'grunt' | 'heavy'

export type EnemyStats = {
  color: number
  speed: number
  size: number
  health: number
  energyOnKill: number
  speedBoost: number
  score: number
}
