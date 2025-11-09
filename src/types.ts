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


export type EnemyStats = {
  color: number
  speed: number
  size: number
  health: number
  energyOnKill: number
  speedBoost: number
  score: number
}
