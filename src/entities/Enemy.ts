import { ENEMY_STATS, EnemyType } from '../constants'
import { Game } from '../scenes/Game'

export class Enemy extends Phaser.GameObjects.Arc {
  declare scene: Game
  declare body: Phaser.Physics.Arcade.Body
  public spawnType: EnemyType = 'grunt'
  public health = 0

  constructor(scene: Game) {
    super(scene)
    scene.physics.add.existing(this)
    scene.add.existing(this)
  }

  spawn(spawnType: EnemyType) {
    const { width, height } = this.scene.cameras.main
    this.spawnType = spawnType
    this.health = this.stats.health

    this.body.setCircle(this.stats.size).setAllowGravity(false)
    this.setAlpha(1)
      .setActive(true)
      .setRadius(this.stats.size)
      .setFillStyle(this.stats.color, 1)

    const side = Phaser.Math.Between(0, 3)
    let x = 0
    let y = 0
    const d = this.stats.size * 2

    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(0, width)
        y = -d
        break
      case 1: // right
        x = width + d
        y = Phaser.Math.Between(0, height)
        break
      case 2: // bottom
        x = Phaser.Math.Between(0, width)
        y = height + d
        break
      case 3: // left
        x = -d
        y = Phaser.Math.Between(0, height)
        break
    }

    this.setPosition(x, y)

    this.move()
  }

  move = () => {
    const { centerX, centerY } = this.scene.cameras.main
    const s = 100
    const dx = centerX + Phaser.Math.Between(-s, s) - this.x
    const dy = centerY + Phaser.Math.Between(-s, s) - this.y
    const angle = Math.atan2(dy, dx)
    const speed = Phaser.Math.Between(
      Math.max(10, this.stats.speed - 20),
      Math.max(this.stats.speed + 20, this.stats.speed),
    )
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    this.body.setVelocity(vx, vy)
  }

  damage = () => {
    if (this.alpha < 1) return

    if (--this.health <= 0) {
      this.kill()
    } else {
      this.setAlpha(0.5)
      this.scene.time.delayedCall(200, () => this.setAlpha(1).setActive(true))
      this.scene.time.delayedCall(500, () => this.move())
    }
  }

  kill = () => {
    this.setActive(false).setAlpha(0)
    this.scene.particles
      .setParticleTint(this.stats.color)
      .emitParticleAt(this.x, this.y, 15)
  }

  get stats() {
    return ENEMY_STATS[this.spawnType]
  }
}
