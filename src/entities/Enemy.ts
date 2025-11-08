import { ENEMY_COLOR, ENEMY_SIZE } from '../constants'
import { Game } from '../scenes/Game'

export class Enemy extends Phaser.GameObjects.Arc {
  declare scene: Game
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Game) {
    super(scene, 0, 0, ENEMY_SIZE, 0, 360, true, ENEMY_COLOR)
    scene.physics.add.existing(this)
    scene.add.existing(this)
  }

  spawn() {
    const { width, height, centerX, centerY } = this.scene.cameras.main

    this.body.setCircle(ENEMY_SIZE).setAllowGravity(false)
    this.setAlpha(1).setActive(true)

    const side = Phaser.Math.Between(0, 3)
    let x = 0
    let y = 0
    const d = ENEMY_SIZE * 2

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

    const s = 100
    const dx = centerX + Phaser.Math.Between(-s, s) - x
    const dy = centerY + Phaser.Math.Between(-s, s) - y
    const angle = Math.atan2(dy, dx)
    const speed = Phaser.Math.Between(20, 100)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    this.body.setVelocity(vx, vy)
  }

  kill = () => {
    this.setActive(false).setAlpha(0)
    this.scene.particles
      .setParticleTint(ENEMY_COLOR)
      .emitParticleAt(this.x, this.y, 15)
  }
}
