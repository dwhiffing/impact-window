import { POWERUPS } from '../constants'
import { Game } from '../scenes/Game'
import { PowerupDef } from '../types'

export class Powerup extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Game
  public def: PowerupDef
  private square: Phaser.GameObjects.Rectangle
  private despawnTimer: Phaser.Tweens.Tween | null = null

  constructor(scene: Game) {
    super(scene)
    this.def = POWERUPS[0]
    const s = 6
    this.square = scene.add
      .rectangle(0, 0, s * 2, s * 2, this.def.color)
      .setDepth(2)
    this.add(this.square)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body
      .setImmovable(true)
      .setAllowGravity(false)
      .setCircle(s)
      .setOffset(-s, -s)
    this.setActive(false).setVisible(false)

    this.scene.tweens.add({
      targets: this.square,
      repeat: -1,
      angle: 360,
      duration: 1000,
    })
  }

  spawnAt(x: number, y: number, def: PowerupDef) {
    this.def = def
    this.square.setFillStyle(def.color)
    this.setPosition(x, y).setActive(false).setVisible(true).setAlpha(0)

    this.despawnTimer?.remove()

    const { width, height } = this.scene.cameras.main

    let px = x
    let py = y

    let i = 0
    // find spot at least 30px away from (x, y)
    const buffer = 40
    while (i++ < 1000) {
      const rx = Phaser.Math.Between(buffer, width - buffer)
      const ry = Phaser.Math.Between(buffer, height - buffer)
      const d = Phaser.Math.Distance.Between(x, y, rx, ry)
      if (d >= 30) {
        px = rx
        py = ry
        break
      }
    }

    // then tween to that position
    this.scene.tweens.add({
      targets: this,
      x: px,
      y: py,
      alpha: 1,
      ease: 'Sine.easeOut',
      duration: 800,
      onComplete: () => {
        this.setActive(true)
        // dispawn after 3 seconds
        this.despawnTimer = this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 3000,
          onComplete: () => {
            this.setActive(false).setVisible(false).setAlpha(0)
          },
        })
      },
    })
  }

  pickup() {
    this.despawnTimer?.remove()
    this.setActive(false).setVisible(false).setAlpha(0)
    this.scene.particles
      .setParticleTint(this.def.color)
      .emitParticleAt(this.x, this.y, 24)
  }
}
