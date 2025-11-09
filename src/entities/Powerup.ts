import { POWERUPS } from '../constants'
import { Game } from '../scenes/Game'
import { PowerupDef } from '../types'

export class Powerup extends Phaser.GameObjects.Container {
  declare body: Phaser.Physics.Arcade.Body
  declare scene: Game
  public def: PowerupDef
  private square: Phaser.GameObjects.Rectangle

  constructor(scene: Game) {
    super(scene)
    this.def = POWERUPS[0]
    const s = 4
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
    this.setPosition(x, y).setActive(true).setVisible(true).setAlpha(0)
    this.scene.tweens.add({ targets: this, alpha: 1, duration: 1000 })
  }

  pickup() {
    this.setActive(false).setVisible(false).setAlpha(0)
    this.scene.particles
      .setParticleTint(this.def.color)
      .emitParticleAt(this.x, this.y, 24)
  }
}
